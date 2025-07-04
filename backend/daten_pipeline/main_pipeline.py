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
import argparse
# from config_file import CONSOLIDATION_RULES, PRECISION_RULES
from db_config_loader import DbConfigLoader # NEU
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
from DatabaseLoader import DatabaseLoader

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

    # 1. Lade die gesamte Konfiguration aus der Datenbank
    try:
        config_loader = DbConfigLoader()
    except ValueError as e:
        sys.exit(f"ABBRUCH: Konnte Konfiguration nicht laden. Fehler: {e}")

    # 1b. Daten laden und aufbereiten (bestehende Logik)
    metadata = load_metadata(metadata_path)

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
        # STATIONS wird jetzt aus der Datenbank geladen - siehe unten
        # Lade Station-Metadaten aus Datenbank
        try:
            from db_config_loader import load_config_from_db
            config = load_config_from_db()
            station_metadata = config.get('stations', {}).get(station_id, {})
        except Exception as e:
            print(f"Fehler beim Laden der Station-Metadaten: {e}")
            station_metadata = {}
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
        
        # 2. Lade Konfiguration für DIESE Station aus dem ConfigLoader
        print(f"Lade Konfiguration für Station {station_id} aus der Datenbank...")
        station_config_db = config_loader.get_station(station_id)
        rules_for_station = config_loader.get_rules_for_station(station_id)

        # Baue die Regel-Dictionaries dynamisch aus den DB-Daten auf
        validation_rules = {}
        spike_rules = {}

        for rule in rules_for_station:
            if rule['rule_type'] == 'RANGE' or rule['rule_type'] == 'RANGE_REGIONAL':
                validation_rules[rule['parameter_name']] = rule['config_json']
            elif rule['rule_type'] == 'SPIKE':
                spike_rules[rule['parameter_name']] = rule['config_json']['threshold']
        
        print(f"  - {len(validation_rules)} Range-Regeln und {len(spike_rules)} Spike-Regeln für diese Station geladen.")        

        """
        Diese Werte werden zukünftig in der Datenbank gepflegt.
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
            """
        
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
            # Filtere die relevanten Regeln aus dem DB-Loader
            regional_db_rules = [r for r in rules_for_station if r['rule_type'] in ['SEASONAL_EVENT', 'RANGE_REGIONAL']]
            # Initialisiere die Klasse mit den Datenbank-Regeln
            regional_config = RegionalConfigMV(regional_db_rules)
            
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

        # Nach der Tageskonsolidierung hinzufügen:
        hourly_filename = save_hourly_data_for_db(processed_data, station_id, output_dir)
        
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


        # 13. DATEN IN DIE DATENBANK SCHREIBEN (Korrigierte, robuste Version)
        if not daily_results.empty:
            print("\nStarte das Laden der Daten in die Datenbank...")
            db_loader = DatabaseLoader()
            if db_loader.conn:
                try:
                    # Schritt 1: Daten aufbereiten (wie zuvor)
                    wert_cols = {col: col.replace('_Mittelwert', '') for col in daily_results.columns if col.endswith('_Mittelwert')}
                    flag_cols = {col: col.replace('_Aggregat_QARTOD_Flag', '') for col in daily_results.columns if col.endswith('_Aggregat_QARTOD_Flag')}

                    wert_df = daily_results[list(wert_cols.keys())].rename(columns=wert_cols)
                    wert_df = wert_df.reset_index().melt(id_vars=['Datum'], var_name='parameter', value_name='wert')

                    flag_df = daily_results[list(flag_cols.keys())].rename(columns=flag_cols)
                    flag_df = flag_df.reset_index().melt(id_vars=['Datum'], var_name='parameter', value_name='qualitaets_flag')

                    merged_data = pd.merge(wert_df, flag_df, on=['Datum', 'parameter'], how='outer')
                    
                    merged_data.rename(columns={'Datum': 'zeitstempel'}, inplace=True)
                    merged_data['see'] = station_id
                    
                    db_data = merged_data.dropna(subset=['wert'])
                    
                    # Schritt 2: Sicherstellen, dass der Zeitstempel ein Python-DateTime-Objekt ist
                    db_data['zeitstempel'] = pd.to_datetime(db_data['zeitstempel'])

                    # Schritt 3: Daten in eine Liste von Tupeln umwandeln - das ist der sicherste Weg
                    records_to_insert = [tuple(x) for x in db_data[['zeitstempel', 'see', 'parameter', 'wert', 'qualitaets_flag']].to_numpy()]

                    # Schritt 4: Die fertige Liste an den Loader übergeben
                    db_loader.insert_validated_data(records_to_insert)

                except Exception as e:
                    print(f"\n[FEHLER] Bei der Aufbereitung der Daten für die Datenbank ist ein Fehler aufgetreten: {e}")
        else:
            print("\nKeine Tagesergebnisse zum Speichern in der Datenbank vorhanden.")
        # =====================================================================        
        
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

def save_hourly_data_for_db(processed_data, station_id, output_dir):
    """
    Speichert stündliche Roh- und validierte Daten für die Datenbank
    """
    hourly_data = []
    
    # Sammle alle Parameter (ohne flag_ und reason_ Spalten)
    parameters = [col for col in processed_data.columns 
                 if not col.startswith('flag_') and not col.startswith('reason_')]
    
    for timestamp, row in processed_data.iterrows():
        for param in parameters:
            hourly_entry = {
                'station_id': station_id,
                'timestamp': timestamp.isoformat(),
                'parameter': param,
                'raw_value': float(row[param]) if pd.notna(row[param]) else None,
                'validated_value': float(row[param]) if pd.notna(row[param]) else None,  # Später unterscheiden
                'validation_flag': int(row[f'flag_{param}']) if f'flag_{param}' in row else 1,
                'validation_reason': str(row[f'reason_{param}']) if f'reason_{param}' in row and pd.notna(row[f'reason_{param}']) else ''
            }
            hourly_data.append(hourly_entry)
    
    # Speichere als JSON
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    hourly_filename = f"stundenwerte_{station_id}_{timestamp_str}.json"
    hourly_filepath = os.path.join(output_dir, hourly_filename)
    
    with open(hourly_filepath, 'w', encoding='utf-8') as f:
        json.dump({
            'station_id': station_id,
            'zeitraum': {
                'von': processed_data.index.min().isoformat(),
                'bis': processed_data.index.max().isoformat()
            },
            'stundenwerte': hourly_data
        }, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"Stundenwerte gespeichert in: {hourly_filepath}")
    return hourly_filename

if __name__ == '__main__':
    # Argument-Parser einrichten, um die Pfade von Node.js zu empfangen
    parser = argparse.ArgumentParser(description='Führt die Wasserqualitäts-Validierungspipeline aus.')
    parser.add_argument('--input-dir', required=True, help='Verzeichnis mit den Eingabe-CSV-Dateien.')
    parser.add_argument('--output-dir', required=True, help='Verzeichnis, in dem die Ergebnisdateien gespeichert werden.')
    parser.add_argument('--metadata-path', required=True, help='Pfad zur Metadaten-JSON-Datei.')
    
    args = parser.parse_args()

    # Erstelle Output-Verzeichnis falls nicht vorhanden (wird vom Node-Server gemacht, aber sicher ist sicher)
    os.makedirs(args.output_dir, exist_ok=True)

    # Zeige aktive Module
    print("\nAktive Validierungsmodule:")
    for module, active in VALIDATION_MODULES.items():
        status = "✓" if active else "✗"
        print(f"  {status} {module}")
    
    print(f"\nVerwende Metadaten-Datei: {args.metadata_path}")

    # Starte die Pipeline mit den übergebenen Pfaden
    run_validation_pipeline(
        input_dir=args.input_dir,
        output_dir=args.output_dir,
        metadata_path=args.metadata_path
    )