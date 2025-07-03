# regional_config_mv.py
"""
Regionsspezifische Konfiguration für Badeseen in:
- Landkreis Vorpommern-Greifswald  
- Landkreis Mecklenburgische Seenplatte

Basierend auf typischen landwirtschaftlichen Praktiken und 
hydrologischen Bedingungen in Mecklenburg-Vorpommern.
"""

from typing import Dict, List, Tuple
import pandas as pd
from datetime import datetime

class RegionalConfigMV:
    """Regionale Anpassungen für Mecklenburg-Vorpommern"""
    
    def __init__(self, regional_rules: List[Dict] = None):
        """
        Initialisiert die Klasse. Wenn Regeln übergeben werden, nutzt sie diese.
        Ansonsten greift sie auf die hartcodierten Fallback-Werte zurück.
        """
        # NEU: Initialisiere die Ziel-Dictionaries als leer
        self.agricultural_calendar = {}
        self.regional_thresholds = {}
        self.lake_specific_thresholds = {}

        # NEU: Verarbeite die übergebenen Regeln aus der Datenbank
        if regional_rules:
            for rule in regional_rules:
                config = rule['config_json']
                if rule['rule_type'] == 'SEASONAL_EVENT':
                    event_name = config.get('event_name')
                    if event_name:
                        self.agricultural_calendar[event_name] = config
                elif rule['rule_type'] == 'RANGE_REGIONAL':
                    station_code = rule['station_code']
                    param_name = rule['parameter_name']
                    if station_code not in self.lake_specific_thresholds:
                        self.lake_specific_thresholds[station_code] = {}
                    self.lake_specific_thresholds[station_code][param_name] = config
        
        # Die alten, hartcodierten Werte werden auskommentiert, bleiben aber als Referenz erhalten.
        """
        # Regionale landwirtschaftliche Kalender
        self.agricultural_calendar = {
            'gülle_sperrfrist': {
                'start': '01-11',  # 1. November
                'end': '31-01',    # 31. Januar
                'description': 'Gesetzliche Sperrfrist für Gülle auf Ackerland'
            },
            'frühjahrs_düngung': {
                'start': '01-02',  # Februar
                'end': '30-04',    # April
                'peak': '15-03',   # Mitte März
                'description': 'Hauptdüngephase Getreide/Raps'
            },
            'mais_düngung': {
                'start': '15-04',  # Mitte April
                'end': '15-06',    # Mitte Juni
                'peak': '01-05',   # Anfang Mai
                'description': 'Maisaussaat und Düngung'
            },
            'sommer_düngung': {
                'start': '01-06',  # Juni
                'end': '31-07',    # Juli
                'peak': '15-06',   # Mitte Juni
                'description': 'Kopfdüngung, Gülleausbringung auf Grünland'
            },
            'ernte_phase': {
                'start': '15-07',  # Mitte Juli
                'end': '30-09',    # Ende September
                'description': 'Ernte - erhöhte Erosionsgefahr'
            }
        }
        """
        # Typische Anbaukulturen in MV
        self.typical_crops = {
            'winterweizen': {'anteil': 0.25, 'n_bedarf': 180},  # kg N/ha
            'winterraps': {'anteil': 0.20, 'n_bedarf': 200},
            'wintergerste': {'anteil': 0.15, 'n_bedarf': 160},
            'mais': {'anteil': 0.20, 'n_bedarf': 220},
            'grünland': {'anteil': 0.15, 'n_bedarf': 150},
            'sonstige': {'anteil': 0.05, 'n_bedarf': 100}
        }
        
        # Angepasste Schwellenwerte für die Region
        self.regional_thresholds = {
            'nitrat': {
                'background': 5.0,      # mg/L - typischer Hintergrundwert
                'erhöht': 15.0,        # mg/L - deutlich erhöht
                'kritisch': 25.0,      # mg/L - kritisch für Badeseen
                'spike_relativ': 0.4,  # 40% Anstieg = verdächtig
                'spike_absolut': 8.0   # mg/L absoluter Anstieg
            },
            'doc': {
                'background': 8.0,      # mg/L - typisch für MV-Seen
                'erhöht': 15.0,
                'kritisch': 20.0,
                'spike_relativ': 0.3,
                'spike_absolut': 4.0
            },
            'leitfähigkeit': {
                'background': 300,      # µS/cm - typisch für MV
                'erhöht': 600,
                'kritisch': 900,
                'spike_relativ': 0.25,
                'spike_absolut': 150
            },
            'trübung': {
                'klar': 5,             # NTU
                'leicht_trüb': 15,
                'trüb': 30,
                'sehr_trüb': 50,
                'spike_relativ': 0.6,  # 60% bei Erosion normal
                'spike_absolut': 20
            },
            'chl_a': {
                'oligotroph': 10,      # µg/L
                'mesotroph': 30,
                'eutroph': 60,
                'hypertroph': 100
            }
        }

        # See-spezifische Schwellenwerte (können Dummy/Schätzwerte sein)
        self.lake_specific_thresholds = {
            'wamo00019': {  # Löcknitzer See
                'status': 'GESCHÄTZT',  # Kennzeichnung als Dummy-Werte
                'nitrat': {
                    'background': 8.0,      # mg/L - erhöht für belasteten See
                    'erhöht': 15.0,        
                    'kritisch': 20.0,      # Niedriger als Standard
                },
                'chl_a': {
                    'oligotroph': 20,      # Unrealistisch für diesen See
                    'mesotroph': 40,
                    'eutroph': 80,        # Normalzustand
                    'hypertroph': 150     # Häufig im Sommer
                },
                'sichttiefe': {
                    'klar': 1.0,          # m - selten erreicht
                    'normal': 0.5,        # m - typisch
                    'trüb': 0.3,          # m - häufig
                    'sehr_trüb': 0.2      # m - Algenblüte
                }
            },
            'wamo00020': {  # Wolgastsee
                'status': 'GESCHÄTZT',  # Kennzeichnung als Dummy-Werte
                'nitrat': {
                    'background': 3.0,      # mg/L - niedriger für sauberen Badesee
                    'erhöht': 10.0,        
                    'kritisch': 15.0,      # Streng für Badenutzung
                },
                'chl_a': {
                    'oligotroph': 10,      
                    'mesotroph': 25,       # Zielzustand
                    'eutroph': 50,         # Warnstufe
                    'hypertroph': 80       # Kritisch für Badebetrieb
                },
                'sichttiefe': {
                    'klar': 2.5,           # m - Zielwert Badesaison
                    'normal': 1.5,         # m - akzeptabel
                    'trüb': 1.0,           # m - Grenzwert
                    'sehr_trüb': 0.5       # m - Badeverbot prüfen
                }
            }
        }
        
        # Wetterabhängige Faktoren
        self.weather_response = {
            'starkregen_schwelle': 15,    # mm/h - ab hier Erosion
            'dauerregen_schwelle': 30,    # mm/24h - Auswaschung
            'trockenperiode_tage': 14,    # Tage - danach erhöhte Auswaschung
            'frost_gülle_risiko': True    # Gülleausbringung auf gefrorenem Boden
        }
        
        # Seen-spezifische Eigenschaften
        self.lake_types = {
            'flachsee': {
                'max_tiefe': 5,
                'mixing': 'polymiktisch',
                'sensitivität': 'hoch',
                'puffer': 'niedrig'
            },
            'tiefensee': {
                'max_tiefe': 20,
                'mixing': 'dimiktisch', 
                'sensitivität': 'mittel',
                'puffer': 'mittel'
            },
            'moorsee': {
                'doc_natural': 15,      # Natürlich hoher DOC
                'ph_range': (5.5, 7.0),
                'sensitivität': 'sehr_hoch',
                'puffer': 'sehr_niedrig'
            }
        }

    def get_season_factor(self, date: pd.Timestamp) -> Dict[str, float]:
        """
        Berechnet saisonale Risikofaktoren basierend auf dem landwirtschaftlichen Kalender.
        """
        factors = {
            'dünger_risiko': 0.2,      # Basis-Risiko
            'gülle_risiko': 0.2,
            'erosions_risiko': 0.3,
            'aktivität': 'normal'
        }
        
        # Prüfe landwirtschaftlichen Kalender
        for phase, info in self.agricultural_calendar.items():
            # Parse Tag-Monat Format korrekt
            start_parts = info['start'].split('-')
            end_parts = info['end'].split('-')
            
            start_day, start_month = int(start_parts[0]), int(start_parts[1])
            end_day, end_month = int(end_parts[0]), int(end_parts[1])
            
            # Erstelle Datetime-Objekte mit korrektem Jahr
            current_year = date.year
            start = datetime(current_year, start_month, start_day)
            end = datetime(current_year, end_month, end_day)
            
            # Berücksichtige Jahreswechsel (z.B. Nov-Jan)
            if start > end:  # Sperrfrist geht über Jahreswechsel
                if date.month >= start_month or date.month <= end_month:
                    if date.month >= start_month:
                        in_phase = date >= start
                    else:  # date.month <= end_month
                        # Im neuen Jahr
                        end = datetime(current_year, end_month, end_day)
                        in_phase = date <= end
                else:
                    in_phase = False
            else:
                in_phase = start <= date.replace(tzinfo=None) <= end
            
            if in_phase:
                if 'düngung' in phase:
                    factors['dünger_risiko'] = 0.8
                    factors['aktivität'] = 'düngung'
                    if 'peak' in info:
                        peak_parts = info['peak'].split('-')
                        peak_day, peak_month = int(peak_parts[0]), int(peak_parts[1])
                        if date.day == peak_day and date.month == peak_month:
                            factors['dünger_risiko'] = 1.0
                elif 'gülle' in phase:
                    factors['gülle_risiko'] = 0.1  # Sperrfrist = niedriges Risiko
                elif 'ernte' in phase:
                    factors['erosions_risiko'] = 0.7
                    factors['aktivität'] = 'ernte'
        
        # Winter-Faktoren
        if date.month in [12, 1, 2]:
            factors['frost_gülle'] = 0.8  # Illegale Ausbringung auf Frost
        
        return factors

    def adjust_thresholds_for_lake(self, base_thresholds: Dict, 
                                   lake_name: str, 
                                   lake_metadata: Dict) -> Dict:
        """
        Passt Schwellenwerte an den spezifischen See-Typ an.
        """
        adjusted = base_thresholds.copy()
        
        # Bestimme See-Typ
        lake_type = lake_metadata.get('type', 'standard')
        max_depth = lake_metadata.get('max_depth', 10)
        
        if lake_type == 'moorsee' or 'moor' in lake_name.lower():
            # Moorseen haben natürlich hohen DOC
            adjusted['doc']['background'] = 15.0
            adjusted['doc']['erhöht'] = 25.0
            adjusted['ph']['min'] = 5.0  # Saurer
            
        elif max_depth < 5:  # Flachsee
            # Flachseen reagieren schneller
            adjusted['nitrat']['spike_relativ'] = 0.3  # Sensibler
            adjusted['chl_a']['mesotroph'] = 20      # Niedrigere Schwelle
            
        elif 'strom' in lake_name.lower() or 'fluss' in lake_name.lower():
            # Flussseen haben mehr Durchmischung
            adjusted['trübung']['spike_relativ'] = 0.8  # Weniger sensibel
            
        return adjusted

    def get_regional_interpretation(self, parameter: str, value: float, 
                               date: pd.Timestamp, station_id: str = None) -> Tuple[str, str]:
            """
            Gibt regionsspezifische Interpretation der Messwerte.
            
            Returns:
                Tuple[status, interpretation]
            """
            # NEU: Prüfe ob see-spezifische Schwellenwerte existieren
            if station_id and hasattr(self, 'lake_specific_thresholds') and station_id in self.lake_specific_thresholds:
                lake_thresholds = self.lake_specific_thresholds[station_id]
                
                # Verwende see-spezifische Werte falls vorhanden
                if parameter in lake_thresholds:
                    thresholds = lake_thresholds[parameter]
                else:
                    thresholds = self.regional_thresholds.get(parameter, {})
            else:
                # Standard-Schwellenwerte
                thresholds = self.regional_thresholds.get(parameter, {})
            
            # Ab hier ist der Original-Code, aber mit 'thresholds' statt 'self.regional_thresholds'
            season_factors = self.get_season_factor(date)
            
            if parameter == 'nitrat':
                if value < thresholds.get('background', 5.0):
                    return 'gut', 'Typischer Hintergrundwert für MV-Seen'
                elif value < thresholds.get('erhöht', 15.0):
                    if season_factors['dünger_risiko'] > 0.6:
                        return 'aufmerksam', f"Leicht erhöht während {season_factors['aktivität']}-Phase"
                    else:
                        return 'normal', 'Mäßig erhöht, aber saisonal unauffällig'
                elif value < thresholds.get('kritisch', 25.0):
                    return 'warnung', 'Deutlich erhöht - möglicher Düngereintrag'
                else:
                    return 'kritisch', 'Kritisch hoch - akuter landwirtschaftlicher Eintrag wahrscheinlich'
                    
            elif parameter == 'doc':
                if value < thresholds.get('background', 8.0):
                    return 'gut', 'Normaler DOC für klare MV-Seen'
                elif value < thresholds.get('erhöht', 15.0):
                    if date.month in [7, 8, 9]:  # Sommer
                        return 'normal', 'Sommerlich erhöhter DOC durch Algenabbau'
                    else:
                        return 'aufmerksam', 'Erhöhter DOC - mögliche organische Einträge'
                else:
                    return 'warnung', 'Hoher DOC - Verdacht auf Gülle/Mist-Eintrag'
                    
            elif parameter == 'leitfähigkeit':
                if value < thresholds.get('background', 300):
                    return 'gut', 'Typisch für nährstoffarme MV-Seen'
                elif value < thresholds.get('erhöht', 600):
                    return 'normal', 'Normale Mineralisation'
                else:
                    if season_factors['dünger_risiko'] > 0.6:
                        return 'warnung', 'Hohe Leitfähigkeit - Düngersalze wahrscheinlich'
                    else:
                        return 'aufmerksam', 'Erhöhte Mineralisation'
            
            # NEU: Zusätzliche Parameter für see-spezifische Bewertung
            elif parameter == 'chl_a' and 'chl_a' in thresholds:
                if value < thresholds.get('oligotroph', 10):
                    return 'gut', 'Nährstoffarmer Zustand'
                elif value < thresholds.get('mesotroph', 30):
                    return 'normal', 'Mäßig nährstoffreich'
                elif value < thresholds.get('eutroph', 60):
                    return 'aufmerksam', 'Nährstoffreich - Algenentwicklung beobachten'
                elif value < thresholds.get('hypertroph', 100):
                    return 'warnung', 'Sehr nährstoffreich - Algenblüte wahrscheinlich'
                else:
                    return 'kritisch', 'Extreme Eutrophierung - Massenvermehrung von Algen'
            
            elif parameter == 'sichttiefe' and 'sichttiefe' in thresholds:
                if value > thresholds.get('klar', 2.0):
                    return 'gut', 'Klares Wasser'
                elif value > thresholds.get('normal', 1.0):
                    return 'normal', 'Normale Sichttiefe'
                elif value > thresholds.get('trüb', 0.5):
                    return 'aufmerksam', 'Eingeschränkte Sichttiefe'
                elif value > thresholds.get('sehr_trüb', 0.3):
                    return 'warnung', 'Stark eingeschränkte Sichttiefe - Badenutzung prüfen'
                else:
                    return 'kritisch', 'Extrem trüb - Badeverbot empfohlen'
            
            return 'unbekannt', 'Keine regionale Interpretation verfügbar'

    def calculate_agricultural_pressure_index(self, catchment_data: Dict) -> float:
        """
        Berechnet einen Index für den landwirtschaftlichen Druck im Einzugsgebiet.
        """
        pressure = 0.0
        
        # Flächennutzung
        agrar_anteil = catchment_data.get('agricultural_percentage', 50) / 100
        pressure += agrar_anteil * 30
        
        # Viehdichte (GV/ha)
        vieh_dichte = catchment_data.get('livestock_density', 1.0)
        if vieh_dichte > 2.0:  # Obergrenze in MV
            pressure += 20
        else:
            pressure += vieh_dichte * 10
            
        # Anbaustruktur
        mais_anteil = catchment_data.get('mais_percentage', 20) / 100
        pressure += mais_anteil * 20  # Mais = hoher N-Bedarf
        
        # Hangneigung
        hang_anteil = catchment_data.get('slope_percentage', 5) / 100
        pressure += hang_anteil * 15  # Erosionsrisiko
        
        # Gewässerrandstreifen
        randstreifen = catchment_data.get('buffer_strip_compliance', 50) / 100
        pressure += (1 - randstreifen) * 15  # Fehlende Puffer
        
        return min(100, pressure)

    def generate_regional_recommendations(self, 
                                        analysis_results: Dict,
                                        lake_name: str,
                                        date: pd.Timestamp) -> List[str]:
        """
        Erstellt regionsspezifische Handlungsempfehlungen.
        """
        recommendations = []
        season = self.get_season_factor(date)
        
        # Saisonale Empfehlungen
        if season['aktivität'] == 'düngung':
            recommendations.append(
                f"Erhöhte Aufmerksamkeit: Aktuell {season['aktivität']}-Phase. "
                "Verstärkte Probenahme nach Niederschlägen empfohlen."
            )
        
        # Kritische Zeiträume
        if date.month in [2, 3]:  # Schneeschmelze
            recommendations.append(
                "Schneeschmelze-Phase: Erhöhtes Risiko für Nährstoffauswaschung. "
                "Tägliche Überwachung von Nitrat und Leitfähigkeit empfohlen."
            )
            
        if date.month in [11, 12, 1]:  # Gülle-Sperrfrist
            recommendations.append(
                "Gülle-Sperrfrist aktiv: Bei Einträgen Ordnungsamt informieren, "
                "da illegale Ausbringung wahrscheinlich."
            )
        
        # See-spezifische Empfehlungen
        if 'flach' in lake_name.lower() or 'weiher' in lake_name.lower():
            recommendations.append(
                "Flachsee-Management: Prüfung von Belüftungsmaßnahmen bei "
                "O2 < 6 mg/L. Kontakt zum Angelverein wegen Fischbestand."
            )
        
        # Regionale Kontakte
        recommendations.append(
            "Regionale Ansprechpartner: "
            "Untere Wasserbehörde LK VG (03834-8760-0), "
            "Untere Wasserbehörde LK MSE (0395-57087-0), "
            "StALU MS Neubrandenburg (0395-380-0)"
        )
        
        # Maßnahmen-Katalog
        risk_score = analysis_results.get('risk_indicators', {}).get('overall_agricultural_risk', 0)
        
        if risk_score > 60:
            recommendations.extend([
                "SOFORTMASSNAHMEN ERFORDERLICH:",
                "1. Gewässerschau mit Landwirtschaftsbehörde vereinbaren",
                "2. Anlieger-Gespräch über Förderung von Gewässerrandstreifen (5m)",
                "3. Prüfung AUKM-Förderung (Agrarumwelt- und Klimamaßnahmen MV)",
                "4. Erosionsschutzberatung durch LMS Agrarberatung anbieten"
            ])
        
        return recommendations


def apply_regional_config(lake_name: str, station_data: pd.DataFrame) -> Dict:
    """
    Wendet die regionalen Anpassungen auf die Analyse an.
    """
    config = RegionalConfigMV()
    
    # Station-ID aus Lake-Name ableiten
    lake_to_station = {
        'Löcknitzer See': 'wamo00019',
        'Wolgastsee': 'wamo00020',
        'Greifswalder Bodden': 'wamo00010',
        'Tollensesee': 'wamo00011',
        'Galenbecker See': 'wamo00012'
    }
    station_id = lake_to_station.get(lake_name, 'unknown')
    
    # Beispiel-Metadaten für einen See
    lake_metadata = {
        'name': lake_name,
        'type': 'flachsee' if 'teich' in lake_name.lower() else 'standard',
        'max_depth': 3.5,
        'catchment': {
            'agricultural_percentage': 65,
            'livestock_density': 1.8,
            'mais_percentage': 25,
            'slope_percentage': 8,
            'buffer_strip_compliance': 40
        }
    }
    
    # Berechne landwirtschaftlichen Druck
    pressure_index = config.calculate_agricultural_pressure_index(lake_metadata['catchment'])
    
    print(f"\nRegionale Analyse für: {lake_name}")
    print(f"Landwirtschaftlicher Druck-Index: {pressure_index:.1f}/100")
    print(f"See-Typ: {lake_metadata['type']}")
    
    # Interpretiere aktuelle Werte
    latest_data = station_data.iloc[-1]  # Neueste Messung
    current_date = station_data.index[-1]
    
    interpretations = {}
    for param in ['Nitrat', 'DOC', 'Leitfähigkeit']:
        if param in station_data.columns:
            value = latest_data[param]
            # HIER IST DIE WICHTIGE ÄNDERUNG - station_id als 4. Parameter:
            status, interpretation = config.get_regional_interpretation(
                param.lower(), value, current_date, station_id
            )
            interpretations[param] = {
                'value': value,
                'status': status,
                'interpretation': interpretation
            }
            print(f"\n{param}: {value:.2f}")
            print(f"  Status: {status}")
            print(f"  Bewertung: {interpretation}")
    
    return {
        'pressure_index': pressure_index,
        'interpretations': interpretations,
        'config': config
    }