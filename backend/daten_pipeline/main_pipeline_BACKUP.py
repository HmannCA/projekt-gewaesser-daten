import pandas as pd
import os
import sys
from datetime import datetime
import re

# Importiere die bekannten und die NEUEN Validierungs-Skripte
from metadata_mapper import load_metadata, create_column_mapping, map_columns_to_names
from validator import WaterQualityValidator
from stuck_value_validator import check_stuck_values
from spike_validator import check_spikes
from multivariate_validator import check_multivariate_anomalies
from interpolating_consolidator import interpolate_and_aggregate

def run_validation_pipeline(input_dir: str, output_dir: str, metadata_path: str):
    """
    Führt die vollständige Validierungspipeline aus. Diese Version nutzt die
    korrekten Parameternamen für eine vollständige Verarbeitung.
    """
    print("Starte finale Pipeline mit korrekter Parameter-Konfiguration...")

    # 1. Daten laden und aufbereiten
    metadata = load_metadata(metadata_path)
    if not metadata: sys.exit("Abbruch: Metadaten-Datei konnte nicht geladen werden.")
    column_mapping, _ = create_column_mapping(metadata)
    if not column_mapping: sys.exit("Abbruch: Spalten-Mapping konnte nicht erstellt werden.")
    
    all_files = [f for f in os.listdir(input_dir) if f.endswith('.csv')]
    if not all_files: sys.exit("Keine CSV-Dateien gefunden.")
        
    files_by_station = {}
    for filename in all_files:
        match = re.search(r'(wamo\d+)', filename)
        if match:
            station_id = match.group(1)
            if station_id not in files_by_station:
                files_by_station[station_id] = []
            files_by_station[station_id].append(os.path.join(input_dir, filename))

    print(f"Gefundene Stationen zur Verarbeitung: {list(files_by_station.keys())}")

    for station_id, station_files in files_by_station.items():
        print("-" * 60)
        print(f"Verarbeite Daten für Station: {station_id}")
        
        try:
            df_list = [pd.read_csv(f, sep=',', header=None, index_col=0, on_bad_lines='skip', encoding='utf-8-sig') for f in station_files]
            raw_data = pd.concat(df_list)
            if raw_data.index.dtype == 'object':
                 raw_data = raw_data[~raw_data.index.str.contains('Timestamp', na=False)]
            raw_data.index = pd.to_datetime(raw_data.index, errors='coerce')
            raw_data = raw_data[raw_data.index.notna()]
            raw_data.sort_index(inplace=True)
        except Exception as e:
            print(f"FEHLER bei Station {station_id}: Kritischer Fehler beim Einlesen der CSV-Dateien: {e}")
            continue

        if raw_data.empty:
            print(f"WARNUNG bei Station {station_id}: Nach Einlesen sind keine validen Daten mehr übrig.")
            continue

        processed_data = raw_data.apply(pd.to_numeric, errors='coerce')
        processed_data = map_columns_to_names(processed_data, column_mapping)
        
        # 2. Definition der Validierungsregeln (MIT ALLEN KORREKTEN NAMEN)
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
            'pH': {'min': 6.0, 'max': 10.0}, # KORREKTER NAME laut Metadaten
            'Redoxpotential': {'min': -300, 'max': 600},
            'Wassertemp. (0.5m)': {'min': -0.5, 'max': 32.0},
            'Wassertemp. (1m)': {'min': -0.5, 'max': 32.0},
            'Wassertemp. (2m)': {'min': -0.5, 'max': 32.0},
            'Lufttemperatur': {'min': -25.0, 'max': 40.0}
        }
        spike_rules = {
            'Wassertemp. (0.5m)': 2.0, 'Wassertemp. (1m)': 2.0, 'Wassertemp. (2m)': 2.0,
            'pH': 0.5, # KORREKTER NAME
            'Trübung': 50.0, 
            'Gelöster Sauerstoff': 5.0,
            'Leitfähigkeit': 100.0, 
            'Nitrat': 10.0
        }
        
        # 3. Alle Validierungen durchführen
        validator = WaterQualityValidator()
        flags_per_test = pd.DataFrame(index=processed_data.index)
        reasons_per_test = pd.DataFrame(index=processed_data.index)

        for param_name in processed_data.columns:
            if param_name in validation_rules:
                rules = validation_rules[param_name]
                flags, reasons = validator.validate_range(processed_data[param_name], rules['min'], rules['max'])
                flags_per_test[f'flag_{param_name}_range'] = flags
                reasons_per_test[f'reason_{param_name}_range'] = reasons
            
            flags, reasons = check_stuck_values(processed_data[param_name], tolerance=3)
            flags_per_test[f'flag_{param_name}_stuck'] = flags
            reasons_per_test[f'reason_{param_name}_stuck'] = reasons
            
            if param_name in spike_rules:
                max_change = spike_rules[param_name]
                flags, reasons = check_spikes(processed_data[param_name], max_rate_of_change=max_change)
                flags_per_test[f'flag_{param_name}_spike'] = flags
                reasons_per_test[f'reason_{param_name}_spike'] = reasons

        # 4. Multivariate Kreuz-Validierung
        cross_validation_cols = [
            'Wassertemp. (0.5m)', 'pH', 'Gelöster Sauerstoff', 'Leitfähigkeit', 'Trübung' # KORREKTER NAME
        ]
        cols_to_check_exist = [col for col in cross_validation_cols if col in processed_data.columns]
        
        if len(cols_to_check_exist) > 1:
            print(f"Führe Kreuz-Validierung für {len(cols_to_check_exist)} Parameter durch...")
            multi_flags, multi_reasons = check_multivariate_anomalies(processed_data, cols_to_check_exist)
            for col_name in cols_to_check_exist:
                flags_per_test[f'flag_{col_name}_multivariate'] = multi_flags
                reasons_per_test[f'reason_{col_name}_multivariate'] = multi_reasons
        
        # 5. Finale Flags und Gründe pro Parameter erstellen
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

        # 6. Tageskonsolidierung
        precision_rules = {
            'Phycocyanin Abs.': 1, 'Phycocyanin Abs. (comp)': 1, 'TOC': 1, 'Trübung': 1, 'Chl-a': 1, 'DOC': 1, 'Nitrat': 1,
            'Gelöster Sauerstoff': 2, 'Leitfähigkeit': 0, 'pH': 2, 'Redoxpotential': 0, 
            'Wassertemp. (0.5m)': 2, 'Wassertemp. (1m)': 2, 'Wassertemp. (2m)': 2,
            'Lufttemperatur': 1
        }
        aggregation_rules = {param: ['mean', 'min', 'max', 'std', 'median'] for param in validation_rules.keys()}
        
        daily_results_list = []
        for day, group_df in processed_data.resample('D'):
            daily_summary = interpolate_and_aggregate(
                group_df,
                parameter_rules=aggregation_rules,
                precision_rules=precision_rules
            )
            if daily_summary is not None and not daily_summary.empty:
                daily_summary.name = day
                daily_results_list.append(daily_summary)

        if not daily_results_list:
            print(f"WARNUNG bei Station {station_id}: Keine validen Tageswerte zur Konsolidierung gefunden.")
            continue
            
        daily_results = pd.concat(daily_results_list, axis=1).T
        daily_results.index.name = "Datum"

        # 7. Ergebnisse speichern
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"tageskonsolidierung_final_{station_id}_{timestamp_str}.json"
        output_filepath = os.path.join(output_dir, output_filename)
        
        daily_results.to_json(output_filepath, orient='index', indent=4, date_format='iso', force_ascii=False)
        print(f"Pipeline für Station {station_id} erfolgreich. Ergebnisse gespeichert in: {output_filepath}")

    print("-" * 60)
    print("Alle Stationen verarbeitet.")


if __name__ == '__main__':
    BASE_DIR = r"F:\Projekte_SH\WAMO-Daten\daten_pipeline"
    INPUT_DIR = os.path.join(BASE_DIR, "input")
    OUTPUT_DIR = os.path.join(BASE_DIR, "output")
    METADATA_FILE = os.path.join(INPUT_DIR, "wamo00010_24313808_parameter-metadata_20250416T090000.json")
    run_validation_pipeline(
        input_dir=INPUT_DIR,
        output_dir=OUTPUT_DIR,
        metadata_path=METADATA_FILE
    )