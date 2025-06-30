import pandas as pd
import numpy as np
import os
import sys
import json
from datetime import datetime
import re
import warnings
from html_dashboard_generator import generate_html_dashboard
from typing import Dict, List, Tuple
from config_file import PRECISION_RULES, CONSOLIDATION_RULES

def check_station_data_quality(station_id: str, station_config: Dict) -> None:
    """Prüft und warnt bei unverifizierten Stationsdaten"""
    data_status = station_config.get('daten_status', {})
    status_level = data_status.get('gesamt', 'UNBEKANNT')
    
    if status_level in ['GESCHÄTZT', 'TEILVERIFIZIERT', 'UNBEKANNT']:
        print(f"\n⚠️  DATENQUALITÄTS-WARNUNG für Station {station_id}")
        print(f"Status: {status_level}")

warnings.filterwarnings('ignore')

# Importiere die bekannten Validierungs-Skripte
from metadata_mapper import load_metadata, create_column_mapping, map_columns_to_names
from validator import WaterQualityValidator
from stuck_value_validator import check_stuck_values
from spike_validator import check_spikes
from multivariate_validator import check_multivariate_anomalies
from interpolating_consolidator import interpolate_and_aggregate

# NEU - Importiere die erweiterten Validatoren
try:
    from enhanced_correlation_validator import EnhancedCorrelationValidator
    CORRELATION_AVAILABLE = True
except ImportError:
    print("WARNUNG: enhanced_correlation_validator nicht gefunden - wird übersprungen")
    CORRELATION_AVAILABLE = False

try:
    from agricultural_runoff_detector import AgriculturalRunoffDetector
    AGRICULTURAL_AVAILABLE = True
except ImportError:
    print("WARNUNG: agricultural_runoff_detector nicht gefunden - wird übersprungen")
    AGRICULTURAL_AVAILABLE = False

try:
    from regional_config_mv import RegionalConfigMV
    REGIONAL_AVAILABLE = True
except ImportError:
    print("WARNUNG: regional_config_mv nicht gefunden - wird übersprungen")
    REGIONAL_AVAILABLE = False

# Konfiguration
VALIDATION_MODULES = {
    'basic': True,
    'correlation': CORRELATION_AVAILABLE,
    'agricultural': AGRICULTURAL_AVAILABLE,
    'regional': REGIONAL_AVAILABLE
}

def berechne_gesamtbewertung(ergebnisse):
    """Berechnet Gesamtstatus aus allen Validierungsergebnissen"""
    bewertung = {
        "status": "gut",
        "hauptprobleme": [],
        "sofortmassnahmen": [],
        "meldepflichten": []
    }
    
    # Prüfe landwirtschaftliche Einträge
    if "landwirtschaftliche_eintraege" in ergebnisse.get("erweiterte_analysen", {}):
        risk = ergebnisse["erweiterte_analysen"]["landwirtschaftliche_eintraege"]["risiko_index"]
        if risk > 60:
            bewertung["status"] = "warnung"
            bewertung["hauptprobleme"].append("Hoher landwirtschaftlicher Einfluss")
            bewertung["sofortmassnahmen"].append("Kontakt mit Landwirtschaftsbehörde aufnehmen")
        
        # Prüfe auf kritische Ereignisse
        for ereignis in ergebnisse["erweiterte_analysen"]["landwirtschaftliche_eintraege"]["erkannte_ereignisse"]:
            if ereignis.get("severity") == "high":
                bewertung["status"] = "kritisch"
                bewertung["meldepflichten"].append("Untere Wasserbehörde informieren")
    
    # Prüfe Korrelationsqualität
    if "korrelations_qualitaet" in ergebnisse.get("erweiterte_analysen", {}):
        if ergebnisse["erweiterte_analysen"]["korrelations_qualitaet"]["gesamtqualitaet"] < 50:
            bewertung["hauptprobleme"].append("Sensorplausibilität fraglich")
            bewertung["sofortmassnahmen"].append("Sensorkalibrierung prüfen")
    
    # Prüfe Basis-Validierung auf kritische Flags
    for datum, werte in ergebnisse.get("basis_validierung", {}).items():
        for param, wert in werte.items():
            if "QARTOD_Flag" in param and wert == 4:  # BAD
                if bewertung["status"] != "kritisch":
                    bewertung["status"] = "warnung"
                param_name = param.replace("_Aggregat_QARTOD_Flag", "")
                if param_name not in str(bewertung["hauptprobleme"]):
                    bewertung["hauptprobleme"].append(f"{param_name} außerhalb Grenzwerte")
    
    return bewertung

def erstelle_opendata_version(vollstaendige_ergebnisse):
    """Erstellt anonymisierte Version für Open Data Portal"""
    opendata = {
        "station_id": vollstaendige_ergebnisse["station_id"],
        "zeitraum": vollstaendige_ergebnisse["zeitraum"],
        "qualitaetsindex": 80,  # Vereinfacht
        "status": vollstaendige_ergebnisse["zusammenfassung"]["status"],
        "lizenz": {
            "name": "CC BY-NC 4.0",
            "vollstaendiger_name": "Creative Commons Attribution-NonCommercial 4.0 International",
            "url": "https://creativecommons.org/licenses/by-nc/4.0/",
            "hinweis": "Nutzung nur für nicht-kommerzielle Zwecke. Bei Verwendung bitte angeben: 'Datenquelle: Landkreis Vorpommern-Greifswald'"
        },
        "tageswerte": {}
    }
    
    # Nur aggregierte Tageswerte ohne kritische Details
    for datum, werte in vollstaendige_ergebnisse.get("basis_validierung", {}).items():
        tageswerte = {}
        
        # Gehe durch alle Werte und filtere intelligent
        for key, value in werte.items():
            # Überspringe detaillierte Gründe und interne Flags
            if any(skip in key for skip in ["Grund", "Anzahl"]):
                continue
            
            # Erlaube QARTOD-Flags explizit
            if "Aggregat_QARTOD_Flag" in key:
                tageswerte[key] = value
            # Oder wenn es eine erlaubte Statistik ist
            elif any(stat in key for stat in ["Mittelwert", "Min", "Max", "Median", "StdAbw", "Anteil_Guter_Werte_Prozent"]):
                tageswerte[key] = value
        
        opendata["tageswerte"][datum] = tageswerte
    
    return opendata

def run_validation_pipeline(input_dir: str, output_dir: str, metadata_path: str):
    """
    Führt die vollständige Validierungspipeline aus.
    Integriert alle Basis- und erweiterten Validierungen.
    """
    print("=" * 60)
    print("Starte erweiterte Pipeline mit allen Validierungsmodulen...")
    print("=" * 60)

    # 1. Daten laden und aufbereiten
    metadata = load_metadata(metadata_path)
    if not metadata: 
        sys.exit("Abbruch: Metadaten-Datei konnte nicht geladen werden.")
    
    column_mapping, _ = create_column_mapping(metadata)
    if not column_mapping: 
        sys.exit("Abbruch: Spalten-Mapping konnte nicht erstellt werden.")
    
    all_files = [f for f in os.listdir(input_dir) if f.endswith('.csv')]
    if not all_files: 
        sys.exit("Keine CSV-Dateien gefunden.")
        
    files_by_station = {}
    for filename in all_files:
        match = re.search(r'(wamo\d+)', filename)
        if match:
            station_id = match.group(1)
            if station_id not in files_by_station:
                files_by_station[station_id] = []
            files_by_station[station_id].append(os.path.join(input_dir, filename))

    print(f"Gefundene Stationen zur Verarbeitung: {list(files_by_station.keys())}")

    # Verarbeite jede Station
    for station_id, station_files in files_by_station.items():
        print("-" * 60)
        print(f"Verarbeite Daten für Station: {station_id}")

        # Station-Metadaten laden und prüfen
        from config_file import STATIONS
        station_metadata = STATIONS.get(station_id, {})
        check_station_data_quality(station_id, station_metadata)
        
        try:
            # Lade Rohdaten
            df_list = [pd.read_csv(f, sep=',', header=None, index_col=0, on_bad_lines='skip', encoding='utf-8-sig') 
                      for f in station_files]
            raw_data = pd.concat(df_list)
            
            # Bereinige Header-Zeilen
            if raw_data.index.dtype == 'object':
                raw_data = raw_data[~raw_data.index.str.contains('Timestamp', na=False)]
            
            # Konvertiere Index zu DateTime
            raw_data.index = pd.to_datetime(raw_data.index, errors='coerce').tz_localize(None)
            raw_data = raw_data[raw_data.index.notna()]
            raw_data.sort_index(inplace=True)
        except Exception as e:
            print(f"FEHLER bei Station {station_id}: {e}")
            continue

        if raw_data.empty:
            print(f"WARNUNG bei Station {station_id}: Keine validen Daten nach Bereinigung.")
            continue

        # Konvertiere zu numerischen Werten und mappe Spaltennamen
        processed_data = raw_data.apply(pd.to_numeric, errors='coerce')
        processed_data = map_columns_to_names(processed_data, column_mapping)
        
        # 2. Definition der Validierungsregeln
        validation_rules = {
            'Phycocyanin Abs.': {'min': 0.0, 'max': 200.0},
            'Phycocyanin Abs. (comp)': {'min': 0.0, 'max': 200.0},
            'TOC': {'min': 1.0, 'max': 70.0},
            'Trübung': {'min': 0.0, 'max': 150.0},
            'Chl-a': {'min': 0.0, 'max': 250.0},
            'DOC': {'min': 1.0, 'max': 60.0},
            'Nitrat': {'min': 0.0, 'max': 50.0},
            'Gelöster Sauerstoff': {'min': 0.0, 'max': 20.0},
            'Leitfähigkeit': {'min': 100, 'max': 1500},
            'pH': {'min': 6.0, 'max': 10.0},
            'Redoxpotential': {'min': -300, 'max': 600},
            'Wassertemp. (0.5m)': {'min': -0.5, 'max': 32.0},
            'Wassertemp. (1m)': {'min': -0.5, 'max': 32.0},
            'Wassertemp. (2m)': {'min': -0.5, 'max': 32.0},
            'Lufttemperatur': {'min': -25.0, 'max': 40.0}
        }
        
        spike_rules = {
            'Wassertemp. (0.5m)': 2.0, 'Wassertemp. (1m)': 2.0, 'Wassertemp. (2m)': 2.0,
            'pH': 0.5, 'Trübung': 50.0, 'Gelöster Sauerstoff': 5.0,
            'Leitfähigkeit': 100.0, 'Nitrat': 10.0
        }

        # Station-spezifische Anpassungen
        if station_id == 'wamo00019':  # Löcknitzer See
            validation_rules.update({
                'Lufttemperatur': {'min': -10.0, 'max': 35.0},
                'Phycocyanin Abs.': {'min': 0.0, 'max': 500.0},
                'Phycocyanin Abs. (comp)': {'min': 0.0, 'max': 500.0},
                'Chl-a': {'min': 0.0, 'max': 400.0},
                'Trübung': {'min': 0.0, 'max': 300.0},
                'pH': {'min': 6.0, 'max': 11.0},
                'Nitrat': {'min': 0.0, 'max': 50.0},
                'DOC': {'min': 5.0, 'max': 50.0},
                'TOC': {'min': 5.0, 'max': 80.0},
                'Gelöster Sauerstoff': {'min': 0.0, 'max': 20.0},
                'Leitfähigkeit': {'min': 200, 'max': 2000},
                'Redoxpotential': {'min': -400, 'max': 800},
                'Wassertemp. (0.5m)': {'min': -1.0, 'max': 35.0},
                'Wassertemp. (1m)': {'min': -1.0, 'max': 35.0},
                'Wassertemp. (2m)': {'min': -1.0, 'max': 35.0},
                'Supply Current': {'min': 0, 'max': 1000}
            })
            
            # Angepasste Spike-Regeln
            spike_rules = {
                'Wassertemp. (0.5m)': 5.0,
                'Wassertemp. (1m)': 5.0,
                'Wassertemp. (2m)': 5.0,
                'pH': 1.0,
                'Trübung': 100.0,
                'Gelöster Sauerstoff': 8.0,
                'Leitfähigkeit': 200.0,
                'Nitrat': 20.0
            }
                
            print(f"Verwende angepasste Grenzwerte für Löcknitzer See (eutropher Flachsee)")
        
        # 3. Basis-Validierungen durchführen
        print("Führe Basis-Validierungen durch...")
        validator = WaterQualityValidator()
        flags_per_test = pd.DataFrame(index=processed_data.index)
        reasons_per_test = pd.DataFrame(index=processed_data.index)

        # Range Validation
        for param_name in processed_data.columns:
            if param_name in validation_rules:
                rules = validation_rules[param_name]
                flags, reasons = validator.validate_range(processed_data[param_name], rules['min'], rules['max'])
                flags_per_test[f'flag_{param_name}_range'] = flags
                reasons_per_test[f'reason_{param_name}_range'] = reasons
            
            # Stuck Values
            flags, reasons = check_stuck_values(processed_data[param_name], tolerance=3)
            flags_per_test[f'flag_{param_name}_stuck'] = flags
            reasons_per_test[f'reason_{param_name}_stuck'] = reasons
            
            # Spike Detection
            if param_name in spike_rules:
                max_change = spike_rules[param_name]
                flags, reasons = check_spikes(processed_data[param_name], max_rate_of_change=max_change)
                flags_per_test[f'flag_{param_name}_spike'] = flags
                reasons_per_test[f'reason_{param_name}_spike'] = reasons

        # 4. Multivariate Validierung
        cross_validation_cols = ['Wassertemp. (0.5m)', 'pH', 'Gelöster Sauerstoff', 'Leitfähigkeit', 'Trübung']
        cols_to_check = [col for col in cross_validation_cols if col in processed_data.columns]
        
        if len(cols_to_check) > 1:
            print("Führe multivariate Validierung durch...")
            multi_flags_dict, multi_reasons_dict = check_multivariate_anomalies(processed_data, cols_to_check)
            for col_name in cols_to_check:
                if col_name in multi_flags_dict:
                    flags_per_test[f'flag_{col_name}_multivariate'] = multi_flags_dict[col_name]
                    reasons_per_test[f'reason_{col_name}_multivariate'] = multi_reasons_dict[col_name]
        
        # 5. Erweiterte Korrelationsvalidierung (wenn verfügbar)
        correlation_results = None
        if VALIDATION_MODULES['correlation']:
            print("Führe erweiterte Korrelationsvalidierung durch...")
            correlation_validator = EnhancedCorrelationValidator()
            
            for timestamp in processed_data.index:
                hour_data = processed_data.loc[[timestamp]]
                corr_flags, corr_reasons = correlation_validator.validate_all_correlations(
                    hour_data, timestamp
                )
                
                for param in processed_data.columns:
                    if param in hour_data.columns:
                        if param in corr_flags.index and len(corr_flags) > 0:
                            if corr_flags.loc[param] != 1:  # 1 = GOOD
                                flags_per_test.loc[timestamp, f'flag_{param}_correlation'] = corr_flags.loc[param]
                                flags_per_test.loc[timestamp, f'reason_{param}_correlation'] = corr_reasons.loc[param]
                        else:
                            flags_per_test.loc[timestamp, f'flag_{param}_correlation'] = 1
                            flags_per_test.loc[timestamp, f'reason_{param}_correlation'] = ""
            
            # Berechne Qualitätsmetriken
            correlation_results = correlation_validator.calculate_correlation_quality_metrics(
                processed_data.last('24H')
            )
            print(f"Korrelationsqualität: {correlation_results.get('overall_correlation_quality', 0):.1f}%")
        
        # 6. Landwirtschaftliche Einträge erkennen (wenn verfügbar)
        agricultural_results = None
        if VALIDATION_MODULES['agricultural']:
            print("Prüfe auf landwirtschaftliche Einträge...")
            agri_detector = AgriculturalRunoffDetector()
            agri_flags, agri_reasons, agri_analysis = agri_detector.detect_agricultural_runoff(
                processed_data,
                weather_data=None,
                lookback_hours=72
            )
            agricultural_results = agri_analysis
            
            # Integriere Agricultural Flags
            for idx in agri_flags.index:
                if agri_flags[idx] != 1:  # Nicht GOOD
                    for param in processed_data.columns:
                        flags_per_test.loc[idx, f'flag_{param}_agricultural'] = agri_flags[idx]
                        if agri_reasons[idx]:
                            reasons_per_test.loc[idx, f'reason_{param}_agricultural'] = agri_reasons[idx]
            
            print(f"Landwirtschaftlicher Risiko-Index: {agri_analysis['risk_indicators'].get('overall_agricultural_risk', 0):.1f}")
        
        # 7. Regionale Anpassungen (wenn verfügbar)
        regional_results = None
        current_season = None
        if VALIDATION_MODULES['regional']:
            print("Wende regionale Konfiguration an...")
            regional_config = RegionalConfigMV()
            
            # Hole saisonale Faktoren
            current_season = regional_config.get_season_factor(processed_data.index[-1])
            print(f"Landwirtschaftliche Phase: {current_season['aktivität']}")
            
            # Regionale Interpretationen
            latest_values = processed_data.iloc[-1]
            regional_results = {}
            
            for param in ['Nitrat', 'DOC', 'Leitfähigkeit']:
                if param in latest_values and not pd.isna(latest_values[param]):
                    status, interpretation = regional_config.get_regional_interpretation(
                        param.lower(),
                        latest_values[param],
                        processed_data.index[-1],
                        station_id
                    )
                    regional_results[param] = {
                        "wert": float(latest_values[param]),
                        "status": status,
                        "interpretation": interpretation
                    }
        
        # 8. Finale Flags und Gründe pro Parameter erstellen
        print("Kombiniere alle Validierungsergebnisse...")

        for param_name in processed_data.columns:
            relevant_flag_cols = [col for col in flags_per_test.columns if f"_{param_name}_" in col]
            relevant_reason_cols = [col for col in reasons_per_test.columns if f"_{param_name}_" in col]
            
            if relevant_flag_cols:
                final_flags, final_reasons = validator.combine_flags_and_reasons(
                    flags_per_test[relevant_flag_cols],
                    reasons_per_test[relevant_reason_cols]
                )

                processed_data[f'flag_{param_name}'] = final_flags
                processed_data[f'reason_{param_name}'] = final_reasons

        # NEU: Generiere Validierungs-Detailbericht NACH ALLEN Validierungen
        try:
            from validation_detail_report import generate_validation_details
            detail_report_path = generate_validation_details(
                processed_data, 
                station_id, 
                output_dir
            )
            print(f"Vollständiger Validierungsbericht: {detail_report_path}")
        except Exception as e:
            print(f"Fehler beim Erstellen des Detail-Berichts: {e}")

        # 9. Tageskonsolidierung
        print("Erstelle Tageskonsolidierung...")

        # Verfügbare Parameter
        actual_params = [col for col in processed_data.columns 
                        if not col.startswith('flag_') and not col.startswith('reason_')]
        print(f"\nVerfügbare Parameter: {len(actual_params)}")

        # Erstelle Aggregationsregeln NUR für vorhandene Parameter
        precision_rules = {
            'Phycocyanin Abs.': 1, 
            'Phycocyanin Abs. (comp)': 1, 
            'TOC': 1, 
            'Trübung': 1, 
            'Chl-a': 1, 
            'DOC': 1, 
            'Nitrat': 1, 
            'Gelöster Sauerstoff': 2, 
            'Leitfähigkeit': 0, 
            'pH': 2, 
            'Redoxpotential': 0, 
            'Wassertemp. (0.5m)': 2, 
            'Wassertemp. (1m)': 2, 
            'Wassertemp. (2m)': 2,
            'Wassertemperatur': 2, 
            'Lufttemperatur': 1, 
            'default': 2
        }
        
        aggregation_rules = {}
        for param in actual_params:
            # Verwende die Regeln aus config_file.py
            if param in CONSOLIDATION_RULES:
                aggregation_rules[param] = CONSOLIDATION_RULES[param]
            else:
                # Fallback auf default
                aggregation_rules[param] = CONSOLIDATION_RULES.get('default', ['min', 'max', 'mean'])
        
        # Tagesweise Aggregation
        daily_results_list = []
        
        for day, group_df in processed_data.groupby(processed_data.index.date):
            day = pd.Timestamp(day)  # Konvertiere date zu Timestamp
            hours_in_day = len(group_df)
            
            if hours_in_day == 0:
                continue
            
            try:
                from interpolating_consolidator import interpolate_and_aggregate
                
                daily_summary = interpolate_and_aggregate(
                    group_df,
                    parameter_rules=aggregation_rules,
                    precision_rules=precision_rules
                )
                
                if daily_summary is not None and not daily_summary.empty:
                    daily_summary.name = day
                    daily_results_list.append(daily_summary)
                    
            except Exception as e:
                print(f"Fehler bei Tagesaggregation für {day}: {str(e)}")
        
        print(f"\nTageskonsolidierung: {len(daily_results_list)} Tage erfolgreich aggregiert")
        
        # Rest der Pipeline
        if not daily_results_list:
            print(f"\nWARNUNG: Keine validen Tageswerte gefunden!")
            daily_results = pd.DataFrame()
        else:
            daily_results = pd.concat(daily_results_list, axis=1).T
            daily_results.index.name = "Datum"
            print(f"Tageskonsolidierung erfolgreich: {len(daily_results)} Tage")

        # 10. Erweiterte Ergebnisse zusammenstellen
        erweiterte_ergebnisse = {
            "station_id": station_id,
            "zeitraum": {
                "von": processed_data.index.min().isoformat(),
                "bis": processed_data.index.max().isoformat()
            },
            "basis_validierung": {date.isoformat(): values for date, values in daily_results.to_dict(orient='index').items()} if not daily_results.empty else {},
            "erweiterte_analysen": {}
        }
        
        # Füge erweiterte Analysen hinzu
        if correlation_results:
            erweiterte_ergebnisse["erweiterte_analysen"]["korrelations_qualitaet"] = {
                "metriken": correlation_results,
                "gesamtqualitaet": correlation_results.get('overall_correlation_quality', 0),
                "auffaellige_korrelationen": []
            }
            
            # Finde auffällige Korrelationen
            for key, value in correlation_results.items():
                if 'actual_correlation' in key and 'quality' not in key:
                    param_pair = key.replace('_actual_correlation', '')
                    quality_key = f"{param_pair}_correlation_quality"
                    if quality_key in correlation_results and correlation_results[quality_key] < 50:
                        erweiterte_ergebnisse["erweiterte_analysen"]["korrelations_qualitaet"]["auffaellige_korrelationen"].append({
                            "parameter": param_pair,
                            "korrelation": round(value, 3),
                            "qualitaet": round(correlation_results[quality_key], 1)
                        })
        
        if agricultural_results:
            erweiterte_ergebnisse["erweiterte_analysen"]["landwirtschaftliche_eintraege"] = {
                "risiko_index": agricultural_results['risk_indicators'].get('overall_agricultural_risk', 0),
                "erkannte_ereignisse": agricultural_results['detected_events'],
                "risiko_indikatoren": agricultural_results['risk_indicators'],
                "langzeit_trends": agricultural_results.get('long_term_trends', {})
            }
            
            # Generiere Textbericht
            if agricultural_results['detected_events'] and VALIDATION_MODULES['agricultural']:
                bericht = agri_detector.generate_report(
                    agricultural_results,
                    processed_data.index[0],
                    processed_data.index[-1]
                )
                # Speichere Bericht separat
                bericht_path = os.path.join(output_dir, f"landwirtschaft_bericht_{station_id}_{datetime.now().strftime('%Y%m%d')}.txt")
                with open(bericht_path, 'w', encoding='utf-8') as f:
                    f.write(bericht)
                print(f"Landwirtschaftsbericht erstellt: {bericht_path}")
        
        if regional_results:
            erweiterte_ergebnisse["erweiterte_analysen"]["regionale_bewertung"] = {
                "saison_faktoren": current_season,
                "parameter_bewertungen": regional_results
            }
            
            # Füge regionale Empfehlungen hinzu
            if VALIDATION_MODULES['regional'] and agricultural_results:
                empfehlungen = regional_config.generate_regional_recommendations(
                    agricultural_results,
                    station_id,
                    processed_data.index[-1]
                )
                erweiterte_ergebnisse["erweiterte_analysen"]["regionale_bewertung"]["empfehlungen"] = empfehlungen
        
        # 11. Zusammenfassung und Handlungsempfehlungen
        gesamtbewertung = berechne_gesamtbewertung(erweiterte_ergebnisse)
        erweiterte_ergebnisse["zusammenfassung"] = gesamtbewertung
        
        # 12. Ergebnisse speichern
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Hauptergebnis-Datei (vollständig)
        output_filename = f"erweiterte_analyse_{station_id}_{timestamp_str}.json"
        output_filepath = os.path.join(output_dir, output_filename)
        
        with open(output_filepath, 'w', encoding='utf-8') as f:
            json.dump(erweiterte_ergebnisse, f, indent=4, ensure_ascii=False, default=str)
        
        print(f"\nErweiterte Analyse gespeichert in: {output_filepath}")
        
        # Open-Data Version (anonymisiert)
        opendata_ergebnisse = erstelle_opendata_version(erweiterte_ergebnisse)
        opendata_filepath = os.path.join(output_dir, f"opendata_{station_id}_{timestamp_str}.json")
        
        with open(opendata_filepath, 'w', encoding='utf-8') as f:
            json.dump(opendata_ergebnisse, f, indent=4, ensure_ascii=False, default=str)
        
        print(f"Open-Data Version gespeichert in: {opendata_filepath}")
        
        # CSV-Export für Excel-Nutzer
        csv_filepath = os.path.join(output_dir, f"tageswerte_{station_id}_{timestamp_str}.csv")
        daily_results.to_csv(csv_filepath, sep=';', decimal=',', encoding='utf-8-sig')
        print(f"CSV-Export gespeichert in: {csv_filepath}")

        # HTML-Dashboard generieren
        html_filepath = generate_html_dashboard(erweiterte_ergebnisse, output_dir, station_id)
        
        # Textbasierte Zusammenfassung erstellen
        zusammenfassung_filepath = os.path.join(output_dir, f"zusammenfassung_{station_id}_{timestamp_str}.txt")
        with open(zusammenfassung_filepath, 'w', encoding='utf-8') as f:
            f.write(f"WAMO GEWÄSSERMONITORING - ZUSAMMENFASSUNG\n")
            f.write(f"{'=' * 50}\n\n")
            f.write(f"Station: {station_id}\n")
            f.write(f"Zeitraum: {erweiterte_ergebnisse['zeitraum']['von']} bis {erweiterte_ergebnisse['zeitraum']['bis']}\n")
            f.write(f"Erstellt: {datetime.now().strftime('%d.%m.%Y %H:%M Uhr')}\n\n")
            
            f.write(f"GESAMTSTATUS: {gesamtbewertung['status'].upper()}\n")
            f.write(f"{'=' * 50}\n\n")
            
            if gesamtbewertung['hauptprobleme']:
                f.write("IDENTIFIZIERTE PROBLEME:\n")
                for problem in gesamtbewertung['hauptprobleme']:
                    f.write(f"• {problem}\n")
                f.write("\n")
            
            if gesamtbewertung['sofortmassnahmen']:
                f.write("ERFORDERLICHE SOFORTMASSNAHMEN:\n")
                for massnahme in gesamtbewertung['sofortmassnahmen']:
                    f.write(f"→ {massnahme}\n")
                f.write("\n")
            
            if gesamtbewertung['meldepflichten']:
                f.write("MELDEPFLICHTEN:\n")
                for meldung in gesamtbewertung['meldepflichten']:
                    f.write(f"! {meldung}\n")
                f.write("\n")
            
            # Risiko-Indikatoren
            f.write("RISIKO-INDIKATOREN:\n")
            if 'landwirtschaftliche_eintraege' in erweiterte_ergebnisse['erweiterte_analysen']:
                risk = erweiterte_ergebnisse['erweiterte_analysen']['landwirtschaftliche_eintraege']['risiko_index']
                f.write(f"• Landwirtschaftlicher Einfluss: {risk:.1f}/100\n")
            if 'korrelations_qualitaet' in erweiterte_ergebnisse['erweiterte_analysen']:
                quality = erweiterte_ergebnisse['erweiterte_analysen']['korrelations_qualitaet']['gesamtqualitaet']
                f.write(f"• Sensorplausibilität: {quality:.1f}%\n")
            f.write("\n")
            
            f.write("KONTAKTE FÜR RÜCKFRAGEN:\n")
            f.write("• Untere Wasserbehörde LK VG: 03834-8760-0\n")
            f.write("• Gesundheitsamt LK VG: 03834-8760-2301\n")
            f.write("• StALU MS: 0395-380-0\n")
        
        print(f"Zusammenfassung gespeichert in: {zusammenfassung_filepath}")
        
        # OPTIONAL: E-Mail-Versand bei kritischen Zuständen
        if gesamtbewertung['status'] in ['warnung', 'kritisch']:
            print(f"\n⚠️  ACHTUNG: Status '{gesamtbewertung['status'].upper()}' erfordert Benachrichtigung!")

        # Status-Zusammenfassung ausgeben
        print(f"\n=== ZUSAMMENFASSUNG Station {station_id} ===")
        print(f"Gesamtstatus: {gesamtbewertung['status'].upper()}")
        if gesamtbewertung['hauptprobleme']:
            print(f"Hauptprobleme: {', '.join(gesamtbewertung['hauptprobleme'])}")
        if gesamtbewertung['sofortmassnahmen']:
            print(f"Sofortmaßnahmen: {', '.join(gesamtbewertung['sofortmassnahmen'])}")
        if gesamtbewertung['meldepflichten']:
            print(f"Meldepflichten: {', '.join(gesamtbewertung['meldepflichten'])}")

    print("\n" + "=" * 60)
    print("Pipeline-Durchlauf abgeschlossen.")
    print("=" * 60)


if __name__ == '__main__':
    # Konfiguration der Pfade
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    INPUT_DIR = os.path.join(BASE_DIR, "input")
    OUTPUT_DIR = os.path.join(BASE_DIR, "output")
    
    # Erstelle Output-Verzeichnis falls nicht vorhanden
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Suche Metadaten-Datei
    import glob
    metadata_files = glob.glob(os.path.join(INPUT_DIR, "wamo*metadata*.json"))
    
    if not metadata_files:
        print("FEHLER: Keine Metadaten-Datei im Input-Verzeichnis gefunden!")
        print(f"Gesucht in: {INPUT_DIR}")
        sys.exit(1)
    
    METADATA_FILE = metadata_files[0]
    print(f"Verwende Metadaten-Datei: {METADATA_FILE}")
    
    # Zeige aktive Module
    print("\nAktive Validierungsmodule:")
    for module, active in VALIDATION_MODULES.items():
        status = "✓" if active else "✗"
        print(f"  {status} {module}")
    
    # Starte Pipeline
    run_validation_pipeline(
        input_dir=INPUT_DIR,
        output_dir=OUTPUT_DIR,
        metadata_path=METADATA_FILE
    )