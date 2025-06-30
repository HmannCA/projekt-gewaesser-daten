import pandas as pd
import numpy as np
from typing import Dict, Tuple, List, Optional
from datetime import datetime, timedelta
import json

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
    NOT_EVALUATED = 2
    SUSPECT = 3
    BAD = 4
    MISSING = 9

class AgriculturalRunoffDetector:
    """
    Erkennt landwirtschaftliche Einträge in Badeseen durch Analyse charakteristischer
    Parametermuster und deren zeitlichen Verlauf.
    """
    
    def __init__(self, station_metadata: Optional[Dict] = None):
        """
        Args:
            station_metadata: Optionale Metadaten über die Station 
                             (z.B. Nähe zu Agrarflächen, Einzugsgebiet)
        """
        self.station_metadata = station_metadata or {}
        
        # Schwellenwerte für Eintrags-Erkennung
        self.thresholds = {
            'nitrate_spike': {
                'relative_increase': 0.3,  # 30% Anstieg
                'absolute_increase': 5.0,  # mg/L
                'duration_hours': 6
            },
            'conductivity_spike': {
                'relative_increase': 0.2,  # 20% Anstieg
                'absolute_increase': 100   # µS/cm
            },
            'turbidity_spike': {
                'relative_increase': 0.5,  # 50% Anstieg
                'absolute_increase': 10    # NTU
            },
            'phosphate_critical': 0.1,     # mg/L (falls Phosphat gemessen wird)
            'doc_spike': {
                'relative_increase': 0.25,  # 25% Anstieg
                'absolute_increase': 2.0    # mg/L
            }
        }
        
        # Typische Muster für verschiedene Eintragsarten
        self.runoff_patterns = {
            'fertilizer_runoff': {
                'indicators': ['nitrate_spike', 'conductivity_increase', 'ph_change'],
                'typical_duration': 24,  # Stunden
                'post_rain_delay': 2     # Stunden nach Regen
            },
            'erosion_runoff': {
                'indicators': ['turbidity_spike', 'doc_increase', 'conductivity_change'],
                'typical_duration': 48,
                'post_rain_delay': 0
            },
            'manure_runoff': {
                'indicators': ['doc_spike', 'oxygen_depletion', 'conductivity_spike', 'nitrate_increase'],
                'typical_duration': 72,
                'post_rain_delay': 1
            },
            'pesticide_runoff': {
                'indicators': ['conductivity_change', 'ph_change', 'biological_stress'],
                'typical_duration': 24,
                'post_rain_delay': 2
            }
        }
    
    def detect_agricultural_runoff(self, df: pd.DataFrame, 
                                 weather_data: Optional[pd.DataFrame] = None,
                                 lookback_hours: int = 72) -> Tuple[pd.Series, pd.Series, Dict]:
        """
        Hauptmethode zur Erkennung landwirtschaftlicher Einträge.
        
        Args:
            df: DataFrame mit Sensordaten
            weather_data: Optionale Wetterdaten (Niederschlag)
            lookback_hours: Zeitfenster für Trendanalyse
            
        Returns:
            Tuple[flags, reasons, analysis_details]
        """
        flags = pd.Series(QartodFlags.GOOD, index=df.index)
        reasons = pd.Series("", index=df.index)
        analysis_details = {'detected_events': [], 'risk_indicators': {}}
        
        # 1. Berechne Baseline und Trends
        baselines = self._calculate_baselines(df, lookback_hours)
        
        # 2. Erkenne Niederschlagsereignisse (falls Wetterdaten vorhanden)
        rain_events = self._identify_rain_events(weather_data) if weather_data is not None else []
        
        # 3. Analysiere verschiedene Eintragstypen
        for runoff_type, pattern in self.runoff_patterns.items():
            detection_result = self._detect_runoff_pattern(
                df, baselines, pattern, rain_events, runoff_type
            )
            
            if detection_result['detected']:
                # Aktualisiere Flags und Gründe
                affected_indices = detection_result['affected_indices']
                # Konvertiere Integer-Indizes zu DateTime-Indizes
                if affected_indices:
                    datetime_indices = df.index[affected_indices]
                    flags.loc[datetime_indices] = QartodFlags.SUSPECT
                    
                    for idx, dt_idx in zip(affected_indices, datetime_indices):
                        reason = detection_result['reasons'].get(idx, '')
                        if reasons.loc[dt_idx]:
                            reasons.loc[dt_idx] += f"; {reason}"
                        else:
                            reasons.loc[dt_idx] = reason
                
                # Sammle Details für Bericht
                analysis_details['detected_events'].append({
                    'type': runoff_type,
                    'start_time': detection_result['start_time'],
                    'duration_hours': detection_result['duration'],
                    'severity': detection_result['severity'],
                    'affected_parameters': detection_result['affected_parameters']
                })
        
        # 4. Berechne Gesamtrisikoindikator
        analysis_details['risk_indicators'] = self._calculate_risk_indicators(df, baselines)
        
        # 5. Langzeittrend-Analyse
        if len(df) > 24 * 7:  # Mindestens eine Woche Daten
            analysis_details['long_term_trends'] = self._analyze_long_term_trends(df)
        
        return flags, reasons, analysis_details
    
    def _calculate_baselines(self, df: pd.DataFrame, lookback_hours: int) -> Dict[str, pd.Series]:
        """Berechnet gleitende Baselines für alle Parameter."""
        baselines = {}
        
        for param in df.columns:
            if 'flag' not in param and 'reason' not in param:
                # Robuste Baseline mit Median
                baseline = df[param].rolling(
                    window=f'{lookback_hours}H',
                    min_periods=int(lookback_hours * 0.5)
                ).median()
                
                # Fülle erste Werte mit Gesamtmedian
                baseline.fillna(df[param].median(), inplace=True)
                baselines[param] = baseline
        
        return baselines
    
    def _detect_runoff_pattern(self, df: pd.DataFrame, baselines: Dict,
                              pattern: Dict, rain_events: List,
                              runoff_type: str) -> Dict:
        """Erkennt spezifische Eintrags-Muster."""
        result = {
            'detected': False,
            'affected_indices': [],
            'reasons': {},
            'severity': 'low',
            'affected_parameters': [],
            'start_time': None,
            'duration': 0
        }
        
        indicators_found = {}
        
        # Prüfe jeden Indikator des Musters
        for indicator in pattern['indicators']:
            if indicator == 'nitrate_spike' and 'Nitrat' in df.columns:
                spike_indices = self._detect_parameter_spike(
                    df['Nitrat'], baselines.get('Nitrat'),
                    self.thresholds['nitrate_spike']
                )
                if len(spike_indices) > 0:
                    indicators_found['nitrate'] = spike_indices
                    
            elif indicator == 'conductivity_increase' and 'Leitfähigkeit' in df.columns:
                spike_indices = self._detect_parameter_spike(
                    df['Leitfähigkeit'], baselines.get('Leitfähigkeit'),
                    self.thresholds['conductivity_spike']
                )
                if len(spike_indices) > 0:
                    indicators_found['conductivity'] = spike_indices
                    
            elif indicator == 'turbidity_spike' and 'Trübung' in df.columns:
                spike_indices = self._detect_parameter_spike(
                    df['Trübung'], baselines.get('Trübung'),
                    self.thresholds['turbidity_spike']
                )
                if len(spike_indices) > 0:
                    indicators_found['turbidity'] = spike_indices
                    
            elif indicator == 'doc_spike' and 'DOC' in df.columns:
                spike_indices = self._detect_parameter_spike(
                    df['DOC'], baselines.get('DOC'),
                    self.thresholds['doc_spike']
                )
                if len(spike_indices) > 0:
                    indicators_found['doc'] = spike_indices
                    
            elif indicator == 'oxygen_depletion' and 'Gelöster Sauerstoff' in df.columns:
                depletion_indices = self._detect_oxygen_depletion(
                    df['Gelöster Sauerstoff'], baselines.get('Gelöster Sauerstoff')
                )
                if len(depletion_indices) > 0:
                    indicators_found['oxygen'] = depletion_indices
        
        # Bewerte ob genügend Indikatoren gefunden wurden
        if len(indicators_found) >= 2:  # Mindestens 2 Indikatoren
            result['detected'] = True
            result['affected_parameters'] = list(indicators_found.keys())
            
            # Finde gemeinsame betroffene Zeitpunkte
            all_indices = set()
            for indices in indicators_found.values():
                all_indices.update(indices)
            
            result['affected_indices'] = sorted(list(all_indices))
            
            if result['affected_indices']:
                result['start_time'] = df.index[result['affected_indices'][0]]
                result['duration'] = len(result['affected_indices'])
            
            # Bewerte Schweregrad
            if len(indicators_found) >= 4:
                result['severity'] = 'high'
            elif len(indicators_found) >= 3:
                result['severity'] = 'medium'
            else:
                result['severity'] = 'low'
            
            # Erstelle Begründungen
            for idx in result['affected_indices']:
                reasons = []
                
                if runoff_type == 'fertilizer_runoff':
                    reasons.append("Verdacht auf Düngemitteleintrag")
                elif runoff_type == 'erosion_runoff':
                    reasons.append("Verdacht auf Erosionseintrag")
                elif runoff_type == 'manure_runoff':
                    reasons.append("Verdacht auf Gülleeintrag")
                elif runoff_type == 'pesticide_runoff':
                    reasons.append("Verdacht auf Pestizideintrag")
                
                # Füge spezifische Parameter hinzu
                param_changes = []
                for param, param_indices in indicators_found.items():
                    if idx in param_indices:
                        if param == 'nitrate':
                            value = df.loc[df.index[idx], 'Nitrat']
                            baseline = baselines['Nitrat'].iloc[idx]
                            param_changes.append(f"Nitrat ↑{value-baseline:.1f} mg/L")
                        elif param == 'turbidity':
                            param_changes.append("Trübung erhöht")
                        elif param == 'doc':
                            param_changes.append("DOC erhöht")
                        elif param == 'oxygen':
                            param_changes.append("O₂-Zehrung")
                
                if param_changes:
                    reasons.append(f"({', '.join(param_changes)})")
                
                # Prüfe Zusammenhang mit Regen
                if rain_events and self._is_post_rain(df.index[idx], rain_events, pattern['post_rain_delay']):
                    reasons.append("nach Niederschlag")
                
                result['reasons'][idx] = " - ".join(reasons)
        
        return result
    
    def _detect_parameter_spike(self, series: pd.Series, baseline: pd.Series,
                               threshold: Dict) -> List[int]:
        """Erkennt signifikante Anstiege eines Parameters."""
        spike_indices = []
        
        for i in range(len(series)):
            if pd.isna(series.iloc[i]) or pd.isna(baseline.iloc[i]):
                continue
                
            value = series.iloc[i]
            base = baseline.iloc[i]
            
            # Absolute und relative Änderung
            abs_change = value - base
            rel_change = abs_change / base if base > 0 else 0
            
            # Prüfe Schwellenwerte
            if (abs_change >= threshold['absolute_increase'] or 
                rel_change >= threshold['relative_increase']):
                spike_indices.append(i)
        
        return spike_indices
    
    def _detect_oxygen_depletion(self, o2_series: pd.Series, 
                               baseline: pd.Series, threshold: float = 0.3) -> List[int]:
        """Erkennt Sauerstoffzehrung."""
        depletion_indices = []
        
        for i in range(len(o2_series)):
            if pd.isna(o2_series.iloc[i]) or pd.isna(baseline.iloc[i]):
                continue
                
            value = o2_series.iloc[i]
            base = baseline.iloc[i]
            
            # Relativer Rückgang
            if base > 0:
                rel_decrease = (base - value) / base
                if rel_decrease >= threshold or value < 4.0:  # < 4 mg/L ist kritisch
                    depletion_indices.append(i)
        
        return depletion_indices
    
    def _identify_rain_events(self, weather_data: pd.DataFrame,
                            rain_threshold: float = 5.0) -> List[Dict]:
        """Identifiziert Regenereignisse aus Wetterdaten."""
        rain_events = []
        
        if 'precipitation' not in weather_data.columns:
            return rain_events
        
        # Finde Zeiträume mit Niederschlag
        is_raining = weather_data['precipitation'] > rain_threshold
        
        # Gruppiere zusammenhängende Regenereignisse
        rain_groups = is_raining.ne(is_raining.shift()).cumsum()
        
        for group_id, group_data in weather_data[is_raining].groupby(rain_groups[is_raining]):
            rain_events.append({
                'start': group_data.index[0],
                'end': group_data.index[-1],
                'total_precipitation': group_data['precipitation'].sum(),
                'max_intensity': group_data['precipitation'].max()
            })
        
        return rain_events
    
    def _is_post_rain(self, timestamp: pd.Timestamp, rain_events: List[Dict],
                     delay_hours: int) -> bool:
        """Prüft ob ein Zeitpunkt kurz nach einem Regenereignis liegt."""
        for event in rain_events:
            time_since_rain = (timestamp - event['end']).total_seconds() / 3600
            if 0 <= time_since_rain <= delay_hours + 12:  # Toleranz von 12h
                return True
        return False
    
    def _calculate_risk_indicators(self, df: pd.DataFrame, 
                                 baselines: Dict[str, pd.Series]) -> Dict[str, float]:
        """Berechnet verschiedene Risikoindikatoren für landwirtschaftliche Einträge."""
        indicators = {}
        
        # 1. Nährstoffbelastungs-Index
        if 'Nitrat' in df.columns:
            nitrate_mean = df['Nitrat'].mean()
            nitrate_peaks = (df['Nitrat'] > df['Nitrat'].quantile(0.9)).sum()
            indicators['nutrient_load_index'] = min(100, (nitrate_mean / 10) * 50 + 
                                                   (nitrate_peaks / len(df)) * 500)
        
        # 2. Eintrags-Häufigkeits-Index
        spike_count = 0
        for param in ['Nitrat', 'DOC', 'Trübung', 'Leitfähigkeit']:
            if param in df.columns and param in baselines:
                spikes = self._detect_parameter_spike(
                    df[param], baselines[param],
                    {'relative_increase': 0.2, 'absolute_increase': 0}
                )
                spike_count += len(spikes)
        
        indicators['runoff_frequency_index'] = min(100, (spike_count / len(df)) * 1000)
        
        # 3. Gewässerbelastungs-Index
        stress_score = 0
        if 'Gelöster Sauerstoff' in df.columns:
            o2_low = (df['Gelöster Sauerstoff'] < 6).sum() / len(df)
            stress_score += o2_low * 30
        
        if 'pH' in df.columns:
            ph_extreme = ((df['pH'] < 6.5) | (df['pH'] > 9)).sum() / len(df)
            stress_score += ph_extreme * 20
        
        if 'Chl-a' in df.columns:
            algae_high = (df['Chl-a'] > 50).sum() / len(df)
            stress_score += algae_high * 25
        
        indicators['water_stress_index'] = min(100, stress_score * 100)
        
        # 4. Gesamtrisiko
        if indicators:
            indicators['overall_agricultural_risk'] = np.mean(list(indicators.values()))
        
        return indicators
    
    def _analyze_long_term_trends(self, df: pd.DataFrame) -> Dict[str, Dict]:
        """Analysiert Langzeittrends die auf chronische Belastung hindeuten."""
        trends = {}
        
        # Analysiere wichtige Parameter
        trend_params = ['Nitrat', 'DOC', 'Leitfähigkeit', 'Chl-a', 'pH']
        
        for param in trend_params:
            if param not in df.columns:
                continue
                
            # Berechne Wochenmittelwerte
            weekly_means = df[param].resample('W').mean()
            
            if len(weekly_means) < 4:  # Mindestens 4 Wochen
                continue
            
            # Linearer Trend
            x = np.arange(len(weekly_means))
            y = weekly_means.values
            
            # Entferne NaN-Werte
            mask = ~np.isnan(y)
            if mask.sum() < 4:
                continue
                
            x, y = x[mask], y[mask]
            
            # Berechne Trend
            slope, intercept = np.polyfit(x, y, 1)
            
            # Bewerte Trend
            trend_direction = 'steigend' if slope > 0 else 'fallend'
            trend_strength = abs(slope) / (np.mean(y) + 1e-6)  # Relativer Trend
            
            trends[param] = {
                'direction': trend_direction,
                'strength': trend_strength,
                'slope': slope,
                'mean_value': np.mean(y),
                'interpretation': self._interpret_trend(param, slope, np.mean(y))
            }
        
        return trends
    
    def _interpret_trend(self, param: str, slope: float, mean_value: float) -> str:
        """Interpretiert Trends im Kontext landwirtschaftlicher Einträge."""
        if param == 'Nitrat':
            if slope > 0.1 and mean_value > 10:
                return "Zunehmende Nährstoffbelastung - verstärkte landwirtschaftliche Einträge wahrscheinlich"
            elif slope > 0.05:
                return "Leicht steigende Nitratbelastung"
            elif slope < -0.05:
                return "Abnehmende Nitratbelastung - Verbesserung der Situation"
        
        elif param == 'Chl-a':
            if slope > 1 and mean_value > 30:
                return "Zunehmende Eutrophierung - Folge chronischer Nährstoffeinträge"
            elif slope > 0.5:
                return "Steigende Algenproduktion"
        
        elif param == 'DOC':
            if slope > 0.1:
                return "Zunehmende organische Belastung - mögliche Einträge aus Landwirtschaft"
        
        elif param == 'Leitfähigkeit':
            if slope > 5:
                return "Steigende Mineralisation - mögliche Düngersalze"
        
        return "Trend vorhanden, aber nicht signifikant"
    
    def generate_report(self, analysis_results: Dict, 
                       start_date: pd.Timestamp,
                       end_date: pd.Timestamp) -> str:
        """Generiert einen detaillierten Bericht über landwirtschaftliche Einträge."""
        report = []
        report.append("=" * 60)
        report.append("BERICHT: Landwirtschaftliche Einträge")
        report.append(f"Zeitraum: {start_date.strftime('%d.%m.%Y')} - {end_date.strftime('%d.%m.%Y')}")
        report.append("=" * 60)
        
        # 1. Zusammenfassung der Ereignisse
        if analysis_results['detected_events']:
            report.append("\n## ERKANNTE EINTRAGS-EREIGNISSE ##")
            for event in analysis_results['detected_events']:
                report.append(f"\n{event['start_time'].strftime('%d.%m.%Y %H:%M')}:")
                report.append(f"  Typ: {self._translate_runoff_type(event['type'])}")
                report.append(f"  Dauer: {event['duration_hours']} Stunden")
                report.append(f"  Schweregrad: {self._translate_severity(event['severity'])}")
                report.append(f"  Betroffene Parameter: {', '.join(event['affected_parameters'])}")
        else:
            report.append("\nKeine akuten Eintrags-Ereignisse erkannt.")
        
        # 2. Risikoindikatoren
        if 'risk_indicators' in analysis_results:
            report.append("\n## RISIKOINDIKATOREN ##")
            indicators = analysis_results['risk_indicators']
            
            for key, value in indicators.items():
                translated_key = self._translate_indicator(key)
                risk_level = self._get_risk_level(value)
                report.append(f"{translated_key}: {value:.1f}/100 ({risk_level})")
        
        # 3. Langzeittrends
        if 'long_term_trends' in analysis_results:
            report.append("\n## LANGZEITTRENDS ##")
            for param, trend in analysis_results['long_term_trends'].items():
                report.append(f"\n{param}:")
                report.append(f"  Trend: {trend['direction']} (Stärke: {trend['strength']:.3f})")
                report.append(f"  Mittelwert: {trend['mean_value']:.2f}")
                report.append(f"  Bewertung: {trend['interpretation']}")
        
        # 4. Handlungsempfehlungen
        report.append("\n## EMPFEHLUNGEN ##")
        recommendations = self._generate_recommendations(analysis_results)
        for rec in recommendations:
            report.append(f"- {rec}")
        
        return "\n".join(report)
    
    def _translate_runoff_type(self, runoff_type: str) -> str:
        """Übersetzt Eintragstypen ins Deutsche."""
        translations = {
            'fertilizer_runoff': 'Düngemitteleintrag',
            'erosion_runoff': 'Erosionseintrag',
            'manure_runoff': 'Gülle-/Misteintrag',
            'pesticide_runoff': 'Pestizideintrag'
        }
        return translations.get(runoff_type, runoff_type)
    
    def _translate_severity(self, severity: str) -> str:
        """Übersetzt Schweregrad ins Deutsche."""
        translations = {
            'low': 'gering',
            'medium': 'mittel',
            'high': 'hoch'
        }
        return translations.get(severity, severity)
    
    def _translate_indicator(self, indicator: str) -> str:
        """Übersetzt Risikoindikatoren ins Deutsche."""
        translations = {
            'nutrient_load_index': 'Nährstoffbelastung',
            'runoff_frequency_index': 'Eintrags-Häufigkeit',
            'water_stress_index': 'Gewässerbelastung',
            'overall_agricultural_risk': 'Gesamtrisiko'
        }
        return translations.get(indicator, indicator)
    
    def _get_risk_level(self, value: float) -> str:
        """Kategorisiert Risikowerte."""
        if value < 20:
            return "niedrig"
        elif value < 40:
            return "mäßig"
        elif value < 60:
            return "erhöht"
        elif value < 80:
            return "hoch"
        else:
            return "sehr hoch"
    
    def _generate_recommendations(self, analysis_results: Dict) -> List[str]:
        """Generiert Handlungsempfehlungen basierend auf der Analyse."""
        recommendations = []
        
        # Basierend auf Risikoindikatoren
        indicators = analysis_results.get('risk_indicators', {})
        
        if indicators.get('nutrient_load_index', 0) > 60:
            recommendations.append(
                "Erhöhte Nährstoffbelastung: Gespräche mit Landwirten über "
                "Düngezeitpunkte und Pufferstreifen empfohlen"
            )
        
        if indicators.get('runoff_frequency_index', 0) > 40:
            recommendations.append(
                "Häufige Einträge nach Niederschlägen: Prüfung der "
                "Drainagesysteme und Erosionsschutzmaßnahmen"
            )
        
        if indicators.get('water_stress_index', 0) > 50:
            recommendations.append(
                "Gewässer zeigt Belastungserscheinungen: Intensivierung "
                "der Überwachung und ggf. Badeverbot prüfen"
            )
        
        # Basierend auf erkannten Ereignissen
        event_types = [e['type'] for e in analysis_results.get('detected_events', [])]
        
        if 'manure_runoff' in event_types:
            recommendations.append(
                "Gülleeintrag erkannt: Kontrolle der Gülleausbringung "
                "im Einzugsgebiet, besonders vor Regenereignissen"
            )
        
        if 'erosion_runoff' in event_types:
            recommendations.append(
                "Erosionseinträge festgestellt: Anlage von Gewässerrandstreifen "
                "und erosionsmindernde Bewirtschaftung fördern"
            )
        
        # Basierend auf Langzeittrends
        trends = analysis_results.get('long_term_trends', {})
        
        if 'Nitrat' in trends and trends['Nitrat']['slope'] > 0.1:
            recommendations.append(
                "Langfristig steigende Nitratwerte: Überprüfung der "
                "Düngepraktiken im gesamten Einzugsgebiet notwendig"
            )
        
        if not recommendations:
            recommendations.append(
                "Keine akuten Maßnahmen erforderlich, aber kontinuierliche "
                "Überwachung beibehalten"
            )
        
        return recommendations


# Integration in die bestehende Pipeline
def integrate_agricultural_detector(processed_data: pd.DataFrame,
                                  station_id: str,
                                  weather_data: Optional[pd.DataFrame] = None) -> Dict:
    """
    Wrapper-Funktion zur Integration in die bestehende Pipeline.
    """
    # Optional: Lade Stations-Metadaten (z.B. Nähe zu Agrarflächen)
    station_metadata = {
        'agricultural_area_percentage': 65,  # % Agrarfläche im Einzugsgebiet
        'main_crops': ['Mais', 'Raps', 'Getreide'],
        'livestock_units': 120  # Großvieheinheiten im Umkreis
    }
    
    detector = AgriculturalRunoffDetector(station_metadata)
    
    # Führe Analyse durch
    flags, reasons, analysis_details = detector.detect_agricultural_runoff(
        processed_data,
        weather_data,
        lookback_hours=72
    )
    
    # Generiere Bericht
    if processed_data.index.size > 0:
        report = detector.generate_report(
            analysis_details,
            processed_data.index[0],
            processed_data.index[-1]
        )
        
        # Speichere Bericht
        report_filename = f"landwirtschaft_bericht_{station_id}_{datetime.now().strftime('%Y%m%d')}.txt"
        with open(report_filename, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\nLandwirtschaftlicher Eintrags-Bericht erstellt: {report_filename}")
    
    return {
        'flags': flags,
        'reasons': reasons,
        'analysis_details': analysis_details,
        'risk_score': analysis_details['risk_indicators'].get('overall_agricultural_risk', 0)
    }