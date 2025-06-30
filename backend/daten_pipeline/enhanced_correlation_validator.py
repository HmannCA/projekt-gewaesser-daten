import pandas as pd
import numpy as np
from typing import Dict, Tuple, List
from datetime import datetime
import warnings

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
    NOT_EVALUATED = 2
    SUSPECT = 3
    BAD = 4
    MISSING = 9

class EnhancedCorrelationValidator:
    """
    Erweiterte Korrelationsvalidierung für Badesee-Sensordaten.
    Prüft physikalische und biologische Zusammenhänge basierend auf limnologischen Prinzipien.
    """
    
    def __init__(self):
        # Physikalische Konstanten
        self.O2_SATURATION_COEFFICIENTS = {
            'A1': -173.4292, 'A2': 249.6339, 'A3': 143.3483,
            'A4': -21.8492, 'B1': -0.033096, 'B2': 0.014259, 'B3': -0.001700
        }
        
        # Erwartete Korrelationskoeffizienten für normale Bedingungen
        self.expected_correlations = {
            ('pH', 'Gelöster Sauerstoff'): {'min': 0.3, 'max': 0.9, 'condition': 'tagsüber'},
            ('Wassertemperatur', 'Gelöster Sauerstoff'): {'min': -0.8, 'max': -0.3, 'condition': 'normal'},
            ('Chl-a', 'pH'): {'min': 0.2, 'max': 0.8, 'condition': 'produktiv'},
            ('Trübung', 'Chl-a'): {'min': 0.3, 'max': 0.9, 'condition': 'algenbedingt'},
            ('Leitfähigkeit', 'Wassertemperatur'): {'min': 0.1, 'max': 0.4, 'condition': 'normal'}
        }
    
    def validate_all_correlations(self, df: pd.DataFrame, timestamp: pd.Timestamp) -> Tuple[pd.Series, pd.Series]:
        """
        Hauptmethode zur Durchführung aller Korrelationsprüfungen.
        
        Returns:
            Tuple[pd.Series, pd.Series]: (Flags, Begründungen)
        """
        flags = pd.Series(QartodFlags.GOOD, index=df.index)
        reasons = pd.Series("", index=df.index)
        
        # Sammle alle Validierungsergebnisse
        validation_results = []
        
        # 1. pH-Sauerstoff-Beziehung
        if all(col in df.columns for col in ['pH', 'Gelöster Sauerstoff']):
            result = self._validate_ph_oxygen_relationship(df, timestamp)
            validation_results.append(result)
        
        # 2. Temperatur-Sauerstoff-Sättigung
        if all(col in df.columns for col in ['Wassertemp. (0.5m)', 'Gelöster Sauerstoff']):
            result = self._validate_oxygen_saturation(df)
            validation_results.append(result)
        
        # 3. Temperaturschichtung
        temp_cols = ['Wassertemp. (0.5m)', 'Wassertemp. (1m)', 'Wassertemp. (2m)']
        if all(col in df.columns for col in temp_cols):
            result = self._validate_thermal_stratification(df, timestamp)
            validation_results.append(result)
        
        # 4. Algenblüten-Indikatoren
        if all(col in df.columns for col in ['Chl-a', 'pH', 'Gelöster Sauerstoff', 'Trübung']):
            result = self._validate_algae_bloom_indicators(df, timestamp)
            validation_results.append(result)
        
        # 5. Leitfähigkeit-Temperatur-Kompensation
        if all(col in df.columns for col in ['Leitfähigkeit', 'Wassertemp. (0.5m)']):
            result = self._validate_conductivity_temperature(df)
            validation_results.append(result)
        
        # 6. Redox-Sauerstoff-Beziehung
        if all(col in df.columns for col in ['Redoxpotential', 'Gelöster Sauerstoff']):
            result = self._validate_redox_oxygen(df)
            validation_results.append(result)
        
        # 7. Nährstoff-Algen-Beziehung
        if all(col in df.columns for col in ['Nitrat', 'Chl-a', 'Phycocyanin Abs.']):
            result = self._validate_nutrient_algae_relationship(df)
            validation_results.append(result)
        
        # Kombiniere alle Ergebnisse
        for result_flags, result_reasons in validation_results:
            # Aktualisiere Flags (höchster Wert = schlechtester Flag)
            flags = pd.concat([flags, result_flags], axis=1).max(axis=1)
            # Sammle Gründe
            for idx in result_reasons[result_reasons != ""].index:
                if reasons[idx] == "":
                    reasons[idx] = result_reasons[idx]
                else:
                    reasons[idx] += "; " + result_reasons[idx]
        
        return flags, reasons
    
    def _validate_ph_oxygen_relationship(self, df: pd.DataFrame, timestamp: pd.Timestamp) -> Tuple[pd.Series, pd.Series]:
        """Validiert die pH-Sauerstoff-Beziehung unter Berücksichtigung der Tageszeit."""
        flags = pd.Series(QartodFlags.GOOD, index=df.index)
        reasons = pd.Series("", index=df.index)
        
        hour = timestamp.hour
        is_daylight = 6 <= hour <= 20  # Vereinfachte Annahme
        
        ph_values = df['pH']
        o2_values = df['Gelöster Sauerstoff']
        
        for idx in df.index:
            ph = ph_values.loc[idx]
            o2 = o2_values.loc[idx]
            
            if pd.isna(ph) or pd.isna(o2):
                continue
            
            # Tagsüber: Photosynthese sollte pH und O2 erhöhen
            if is_daylight:
                if ph > 8.5 and o2 < 6:
                    flags.loc[idx] = QartodFlags.SUSPECT
                    reasons.loc[idx] = "Hoher pH bei niedrigem O2 tagsüber (untypisch für Photosynthese)"
                elif ph < 7 and o2 > 12:
                    flags.loc[idx] = QartodFlags.SUSPECT
                    reasons.loc[idx] = "Niedriger pH bei hohem O2 tagsüber (untypisch)"
            else:
                # Nachts: Respiration sollte pH und O2 senken
                if ph > 8.5 and o2 > 12:
                    flags.loc[idx] = QartodFlags.SUSPECT
                    reasons.loc[idx] = "Hoher pH und O2 nachts (keine Photosynthese erwartet)"
        
        return flags, reasons
    
    def _validate_oxygen_saturation(self, df: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
        """Prüft die Sauerstoffsättigung basierend auf der Wassertemperatur."""
        flags = pd.Series(QartodFlags.GOOD, index=df.index)
        reasons = pd.Series("", index=df.index)
        
        temp_col = 'Wassertemp. (0.5m)' if 'Wassertemp. (0.5m)' in df.columns else 'Wassertemperatur'
        temperatures = df[temp_col]
        o2_values = df['Gelöster Sauerstoff']
        
        for idx in df.index:
            temp = temperatures.loc[idx]
            o2 = o2_values.loc[idx]
            
            if pd.isna(temp) or pd.isna(o2):
                continue
            
            # Berechne theoretische O2-Sättigung
            saturation_mg_l = self._calculate_o2_saturation(temp)
            saturation_percent = (o2 / saturation_mg_l) * 100 if saturation_mg_l > 0 else 0
            
            # Bewertung der Sättigung
            if saturation_percent > 140:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = f"Extreme O2-Übersättigung ({saturation_percent:.0f}%) - mögliche starke Algenblüte"
            elif saturation_percent > 120:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = f"O2-Übersättigung ({saturation_percent:.0f}%) - aktive Photosynthese"
            elif saturation_percent < 30:
                flags.loc[idx] = QartodFlags.BAD
                reasons.loc[idx] = f"Kritisch niedriger O2 ({saturation_percent:.0f}% Sättigung)"
            elif saturation_percent < 60:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = f"Niedrige O2-Sättigung ({saturation_percent:.0f}%) - mögliche Belastung"
        
        return flags, reasons
    
    def _calculate_o2_saturation(self, temp_celsius: float, salinity: float = 0) -> float:
        """
        Berechnet die theoretische O2-Sättigung in mg/L nach Benson & Krause.
        Für Süßwasser (salinity = 0).
        """
        temp_kelvin = temp_celsius + 273.15
        
        # Benson & Krause Gleichung
        ln_o2_sat = (self.O2_SATURATION_COEFFICIENTS['A1'] + 
                     self.O2_SATURATION_COEFFICIENTS['A2'] * (100/temp_kelvin) + 
                     self.O2_SATURATION_COEFFICIENTS['A3'] * np.log(temp_kelvin/100) + 
                     self.O2_SATURATION_COEFFICIENTS['A4'] * (temp_kelvin/100))
        
        o2_sat = np.exp(ln_o2_sat) * 1.42905  # Umrechnung in mg/L
        return o2_sat
    
    def _validate_thermal_stratification(self, df: pd.DataFrame, timestamp: pd.Timestamp) -> Tuple[pd.Series, pd.Series]:
        """Prüft die physikalische Plausibilität der Temperaturschichtung."""
        flags = pd.Series(QartodFlags.GOOD, index=df.index)
        reasons = pd.Series("", index=df.index)
        
        month = timestamp.month
        is_summer = 5 <= month <= 9
        
        for idx in df.index:
            temp_05m = df.loc[idx, 'Wassertemp. (0.5m)']
            temp_1m = df.loc[idx, 'Wassertemp. (1m)']
            temp_2m = df.loc[idx, 'Wassertemp. (2m)']
            
            if any(pd.isna([temp_05m, temp_1m, temp_2m])):
                continue
            
            # Temperaturgradienten
            gradient_upper = temp_05m - temp_1m  # Oberer Gradient
            gradient_lower = temp_1m - temp_2m    # Unterer Gradient
            
            # Inverse Schichtung (Tiefe wärmer als Oberfläche)
            if temp_2m > temp_05m + 0.5:
                if is_summer:
                    flags.loc[idx] = QartodFlags.BAD
                    reasons.loc[idx] = "Inverse Temperaturschichtung im Sommer (physikalisch unplausibel)"
                else:
                    flags.loc[idx] = QartodFlags.SUSPECT
                    reasons.loc[idx] = "Inverse Temperaturschichtung - für Jahreszeit prüfen"
            
            # Extreme Sprungschicht
            if gradient_upper > 3 or gradient_lower > 3:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = f"Extreme Temperatursprungschicht (>{3}°C/0.5m)"
            
            # Instabile Schichtung
            if 0 < temp_1m - temp_05m < 0.2 and 0 < temp_2m - temp_1m < 0.2:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = "Instabile Temperaturschichtung detektiert"
        
        return flags, reasons
    
    def _validate_algae_bloom_indicators(self, df: pd.DataFrame, timestamp: pd.Timestamp) -> Tuple[pd.Series, pd.Series]:
        """Erkennt Anzeichen für Algenblüten durch Kombination mehrerer Parameter."""
        flags = pd.Series(QartodFlags.GOOD, index=df.index)
        reasons = pd.Series("", index=df.index)
        
        hour = timestamp.hour
        is_daylight = 6 <= hour <= 20
        
        for idx in df.index:
            chl_a = df.loc[idx, 'Chl-a']
            ph = df.loc[idx, 'pH']
            o2 = df.loc[idx, 'Gelöster Sauerstoff']
            turbidity = df.loc[idx, 'Trübung']
            
            if any(pd.isna([chl_a, ph, o2, turbidity])):
                continue
            
            # Starke Algenblüte Indikatoren
            indicators = 0
            details = []
            
            if chl_a > 50:
                indicators += 1
                details.append(f"Chl-a hoch ({chl_a:.1f})")
            
            if ph > 8.5 and is_daylight:
                indicators += 1
                details.append(f"pH erhöht ({ph:.2f})")
            
            if o2 > 12 and is_daylight:
                indicators += 1
                details.append(f"O2 erhöht ({o2:.1f})")
            elif o2 < 4 and not is_daylight:
                indicators += 1
                details.append(f"O2 kritisch niedrig nachts ({o2:.1f})")
            
            if turbidity > 20 and chl_a > 30:
                indicators += 1
                details.append("Trübung algenbedingt")
            
            # Bewertung
            if indicators >= 3:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = f"Starke Algenblüte wahrscheinlich: {', '.join(details)}"
            elif indicators >= 2:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = f"Algenblüte möglich: {', '.join(details)}"
        
        return flags, reasons
    
    def _validate_conductivity_temperature(self, df: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
        """Prüft die Temperaturabhängigkeit der Leitfähigkeit."""
        flags = pd.Series(QartodFlags.GOOD, index=df.index)
        reasons = pd.Series("", index=df.index)
        
        temp_col = 'Wassertemp. (0.5m)' if 'Wassertemp. (0.5m)' in df.columns else 'Wassertemperatur'
        
        # Berechne temperaturkompensierte Leitfähigkeit (auf 25°C normiert)
        for idx in df.index:
            temp = df.loc[idx, temp_col]
            cond = df.loc[idx, 'Leitfähigkeit']
            
            if pd.isna(temp) or pd.isna(cond):
                continue
            
            # Temperaturkompensation (2% pro °C)
            cond_25 = cond / (1 + 0.02 * (temp - 25))
            
            # Prüfe ob kompensierte Leitfähigkeit in plausiblem Bereich
            if cond_25 < 50:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = f"Sehr niedrige Leitfähigkeit ({cond_25:.0f} µS/cm bei 25°C)"
            elif cond_25 > 1000:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = f"Hohe Leitfähigkeit ({cond_25:.0f} µS/cm bei 25°C) - Verschmutzung?"
            
            # Prüfe unrealistische Temperatur-Leitfähigkeits-Kombinationen
            expected_change = 0.02 * abs(temp - 25) * cond_25
            if abs(cond - cond_25) > expected_change * 2:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = "Leitfähigkeit-Temperatur-Beziehung unplausibel"
        
        return flags, reasons
    
    def _validate_redox_oxygen(self, df: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
        """Validiert die Beziehung zwischen Redoxpotential und Sauerstoff."""
        flags = pd.Series(QartodFlags.GOOD, index=df.index)
        reasons = pd.Series("", index=df.index)
        
        for idx in df.index:
            redox = df.loc[idx, 'Redoxpotential']
            o2 = df.loc[idx, 'Gelöster Sauerstoff']
            
            if pd.isna(redox) or pd.isna(o2):
                continue
            
            # Redox-Sauerstoff-Beziehung
            if redox > 300 and o2 < 2:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = "Hohes Redoxpotential bei niedrigem O2 (ungewöhnlich)"
            elif redox < 0 and o2 > 8:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = "Negatives Redoxpotential bei hohem O2 (widersprüchlich)"
            elif redox < -100:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = "Stark reduzierende Bedingungen - anaerobe Zone?"
        
        return flags, reasons
    
    def _validate_nutrient_algae_relationship(self, df: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
        """Prüft die Beziehung zwischen Nährstoffen und Algenwachstum."""
        flags = pd.Series(QartodFlags.GOOD, index=df.index)
        reasons = pd.Series("", index=df.index)
        
        for idx in df.index:
            nitrate = df.loc[idx, 'Nitrat']
            chl_a = df.loc[idx, 'Chl-a']
            phyco = df.loc[idx, 'Phycocyanin Abs.']
            
            if any(pd.isna([nitrate, chl_a, phyco])):
                continue
            
            # Nährstofflimitierung vs. Algenwachstum
            if nitrate < 0.5 and chl_a > 100:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = "Hohes Chl-a trotz Nitrat-Limitierung"
            
            # Cyanobakterien-Dominanz
            if phyco > 50 and chl_a < 20:
                flags.loc[idx] = QartodFlags.SUSPECT
                reasons.loc[idx] = "Hoher Phycocyanin bei niedrigem Chl-a - Cyanobakterien-Dominanz"
            
            # Verhältnis Phycocyanin zu Chlorophyll
            if chl_a > 0:
                phyco_chl_ratio = phyco / chl_a
                if phyco_chl_ratio > 0.5:
                    flags.loc[idx] = QartodFlags.SUSPECT
                    reasons.loc[idx] = f"Hohes Phycocyanin/Chl-a Verhältnis ({phyco_chl_ratio:.2f}) - Blaualgen"
        
        return flags, reasons
    
    def calculate_correlation_quality_metrics(self, df: pd.DataFrame, window_hours: int = 24) -> Dict[str, float]:
        """
        Berechnet Qualitätsmetriken für die Parameterkorrelatione über ein Zeitfenster.
        """
        metrics = {}
        
        # Berechne tatsächliche Korrelationen für das Zeitfenster
        for (param1, param2), expected in self.expected_correlations.items():
            if param1 in df.columns and param2 in df.columns:
                # Entferne NaN-Werte für Korrelationsberechnung
                data = df[[param1, param2]].dropna()
                
                if len(data) > 10:  # Mindestens 10 Datenpunkte
                    actual_corr = data[param1].corr(data[param2])
                    
                    # Prüfe ob Korrelation im erwarteten Bereich
                    if expected['min'] <= actual_corr <= expected['max']:
                        quality = 100
                    else:
                        # Berechne Abweichung vom erwarteten Bereich
                        if actual_corr < expected['min']:
                            deviation = expected['min'] - actual_corr
                        else:
                            deviation = actual_corr - expected['max']
                        quality = max(0, 100 - (deviation * 100))
                    
                    metrics[f"{param1}-{param2}_correlation_quality"] = quality
                    metrics[f"{param1}-{param2}_actual_correlation"] = actual_corr
        
        # Gesamtqualität
        if metrics:
            metrics['overall_correlation_quality'] = np.mean([v for k, v in metrics.items() if 'quality' in k])
        
        return metrics


# Integrationsfunktion für die bestehende Pipeline
def integrate_enhanced_correlation_validator(hourly_data: pd.DataFrame, timestamp: pd.Timestamp) -> Tuple[pd.Series, pd.Series]:
    """
    Wrapper-Funktion zur Integration in die bestehende Pipeline.
    """
    validator = EnhancedCorrelationValidator()
    return validator.validate_all_correlations(hourly_data, timestamp)


# Beispiel für die Nutzung in der main_pipeline.py
def run_enhanced_validation_example(df: pd.DataFrame):
    """
    Beispiel wie die erweiterte Validierung in die bestehende Pipeline integriert wird.
    """
    # Initialisiere Validator
    validator = EnhancedCorrelationValidator()
    
    # Führe Validierung für jeden Zeitstempel durch
    all_flags = []
    all_reasons = []
    
    for timestamp in df.index:
        # Hole Daten für diesen Zeitpunkt
        row_data = df.loc[[timestamp]]
        
        # Führe erweiterte Korrelationsvalidierung durch
        flags, reasons = validator.validate_all_correlations(row_data, timestamp)
        
        all_flags.append(flags)
        all_reasons.append(reasons)
    
    # Kombiniere Ergebnisse
    final_flags = pd.concat(all_flags)
    final_reasons = pd.concat(all_reasons)
    
    # Berechne Qualitätsmetriken für das gesamte Dataset
    quality_metrics = validator.calculate_correlation_quality_metrics(df)
    
    print("Korrelations-Qualitätsmetriken:")
    for metric, value in quality_metrics.items():
        print(f"  {metric}: {value:.2f}")
    
    return final_flags, final_reasons, quality_metrics