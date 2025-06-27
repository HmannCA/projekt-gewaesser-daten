# data_pipeline.py - Finale Version mit korrigierten Regeln und Bugfixes

import pandas as pd
import json
import os
import glob
import numpy as np

# --- Konfiguration ---
INPUT_DIR = 'input'
OUTPUT_DIR = 'output'
METADATA_FILE_PATTERN = os.path.join(INPUT_DIR, 'wamo*metadata*.json')

# 1. VALIDATION_RULES - Mit angepassten Regeln für Phycocyanin
VALIDATION_RULES = {
    'Wassertemperatur': {'min': -2.0, 'max': 40.0}, 'Lufttemperatur': {'min': -30.0, 'max': 50.0},
    'pH': {'min': 4.0, 'max': 11.0}, 'Sauerstoff': {'min': 0.0, 'max': 25.0},
    'Leitfähigkeit': {'min': 5.0, 'max': 1500.0}, 'Redoxpotential': {'min': -300.0, 'max': 700.0},
    'Nitrat': {'min': 0.0, 'max': 150.0}, 'Trübung': {'min': 0.0, 'max': 3000.0},
    'Chl-a': {'min': 0.0, 'max': 500.0},
    'Phycocyanin': {'min': 0.0, 'max': 500.0}, # WIEDER ANGEPASST AUF 0-500
    'TOC': {'min': 0.0, 'max': 100.0}, 'DOC': {'min': 0.0, 'max': 100.0}
}

# 2. PRECISION_RULES - Wissenschaftliche Genauigkeit
PRECISION_RULES = {
    'Phycocyanin Abs.': 3, 'Phycocyanin Abs. (comp)': 3, 'Chl-a': 2, 'Trübung': 2,
    'TOC': 2, 'DOC': 2, 'Nitrat': 3, 'Gelöster Sauerstoff': 2, 'Leitfähigkeit': 1,
    'pH': 2, 'Redoxpotential': 1, 'Wassertemperatur': 2, 'Lufttemperatur': 2,
    'Supply Current': 3, 'Supply Voltage': 2, 'default': 2
}

# 3. CONSOLIDATION_RULES - Regeln für Tageskonsolidierung gemäß Gutachten
CONSOLIDATION_RULES = {
    'default': ['min', 'max', 'mean', 'std'],
    'Wassertemperatur': ['min', 'max', 'mean'], 'TOC': ['min', 'max', 'mean'],
    'DOC': ['min', 'max', 'mean'], 'Nitrat': ['min', 'max', 'mean'],
    'Gelöster Sauerstoff': ['min', 'max', 'mean'],
    'pH': ['min', 'max', 'mean', 'std', 'median']
}

def transform_raw_data(csv_path, metadata):
    raw_df = pd.read_csv(csv_path, sep=',', header=0)
    datastreams_map = {ds['datastream']: ds for ds in metadata['parameterMetadata']}
    processed_dfs = []
    for col_info in metadata['csvColumns']:
        if col_info.get('dataType') == 'result':
            datastream_id = col_info.get('datastream')
            if not datastream_id: continue
            datastream_details = datastreams_map.get(datastream_id)
            if not datastream_details: continue
            col_index = col_info['column'] - 1
            if col_index < len(raw_df.columns):
                col_name = raw_df.columns[col_index]
                if col_name == 'Timestamp': continue
                temp_df = raw_df[['Timestamp', col_name]].copy()
                temp_df.rename(columns={col_name: 'Value'}, inplace=True)
                temp_df['ParameterName'] = datastream_details.get('nameCustom') or datastream_details.get('name')
                temp_df['Unit'] = datastream_details.get('unitOfMeasurementCustom') or datastream_details.get('unitOfMeasurement')
                processed_dfs.append(temp_df)
    return pd.concat(processed_dfs, ignore_index=True) if processed_dfs else pd.DataFrame()

def validate_and_enrich_data(df):
    df['quality_flag'] = 'plausible'
    df['valid_range_min'] = pd.NA
    df['valid_range_max'] = pd.NA
    for parameter, rules in VALIDATION_RULES.items():
        min_val, max_val = rules.get('min'), rules.get('max')
        param_mask = df['ParameterName'].str.contains(parameter, case=False, na=False, regex=False)
        df.loc[param_mask, 'valid_range_min'] = min_val
        df.loc[param_mask, 'valid_range_max'] = max_val
        if min_val is not None:
            df.loc[param_mask & (df['Value'] < min_val), 'quality_flag'] = 'implausible_low'
        if max_val is not None:
            df.loc[param_mask & (df['Value'] > max_val), 'quality_flag'] = 'implausible_high'
    return df

def consolidate_daily_summary(df, consolidation_rules, precision_rules):
    df['date'] = pd.to_datetime(df['Timestamp']).dt.date
    all_summaries = []
    
    for group_keys, group in df.groupby(['date', 'ParameterName', 'Unit']):
        name = group_keys[1]
        
        agg_rule_key = next((key for key in consolidation_rules if key in name), 'default')
        agg_funcs = consolidation_rules[agg_rule_key]
        
        precision_key = next((key for key in precision_rules if key in name), 'default')
        precision = precision_rules[precision_key]
        
        plausible_values = group[group['quality_flag'] == 'plausible']['Value']
        
        total_count, plausible_count = len(group), len(plausible_values)
        plausible_ratio = plausible_count / total_count if total_count > 0 else 0
        qartod_flag = 4
        if plausible_ratio > 0.95: qartod_flag = 1
        elif plausible_ratio > 0.75: qartod_flag = 3
        
        if plausible_count > 0:
            stats = plausible_values.agg(agg_funcs).round(precision)
        else:
            stats = {func: np.nan for func in agg_funcs}
        
        result_row = {
            'date': group_keys[0], 'ParameterName': name, 'Unit': group_keys[2],
            'qartod_flag': qartod_flag, 'applied_precision': precision,
            'measurement_count': plausible_count
        }
        result_row.update(stats)
        all_summaries.append(pd.DataFrame([result_row]))

    if not all_summaries: return pd.DataFrame()

    daily_summary = pd.concat(all_summaries, ignore_index=True)
    rename_map = {'mean': 'mean_value', 'min': 'min_value', 'max': 'max_value', 'std': 'std_dev', 'median': 'median_value'}
    daily_summary.rename(columns=rename_map, inplace=True)
    
    final_columns = [
        'date', 'ParameterName', 'Unit', 'mean_value', 'min_value', 'max_value', 
        'std_dev', 'median_value', 'measurement_count', 'qartod_flag', 'applied_precision'
    ]
    existing_final_columns = [col for col in final_columns if col in daily_summary.columns]
    
    return daily_summary[existing_final_columns]

def apply_precision_to_cleaned(df, precision_rules):
    """Eine separate, einfachere Funktion zum Runden der Rohdaten."""
    df_copy = df.copy()
    for parameter, precision in precision_rules.items():
        param_mask = df_copy['ParameterName'].str.contains(parameter, case=False, na=False, regex=False)
        if 'Value' in df_copy.columns:
            df_copy.loc[param_mask, 'Value'] = pd.to_numeric(df_copy.loc[param_mask, 'Value'], errors='coerce').round(precision)
    return df_copy

def main_pipeline():
    print("Starte Daten-Pipeline...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    metadata_files = glob.glob(METADATA_FILE_PATTERN)
    if not metadata_files:
        print(f"FATALER FEHLER: Metadaten-Datei nicht im Ordner '{INPUT_DIR}' gefunden.")
        return
    
    metadata_path = metadata_files[0]
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
        
    all_csv_files = glob.glob(os.path.join(INPUT_DIR, 'wamo*.csv'))
    if not all_csv_files:
        print(f"Fehler: Keine CSV-Dateien im Ordner '{INPUT_DIR}' gefunden.")
        return

    all_cleaned_data = []
    print(f"\n--- Schritt 1: Transformiere {len(all_csv_files)} Rohdaten-Dateien ---")
    for csv_file in all_csv_files:
        cleaned_df = transform_raw_data(csv_file, metadata)
        all_cleaned_data.append(cleaned_df)
    
    combined_df = pd.concat(all_cleaned_data, ignore_index=True)
    combined_df['Timestamp'] = pd.to_datetime(combined_df['Timestamp'], errors='coerce')
    combined_df['Value'] = pd.to_numeric(combined_df['Value'], errors='coerce')
    combined_df.dropna(subset=['Value', 'Timestamp'], inplace=True)
    
    cleaned_rounded_df = apply_precision_to_cleaned(combined_df.copy(), PRECISION_RULES)
    output_cleaned_path = os.path.join(OUTPUT_DIR, '1_cleaned_data.csv')
    cleaned_rounded_df.to_csv(output_cleaned_path, index=False, sep=';', decimal=',')
    print(f"-> Schritt 1 abgeschlossen.")

    print("\n--- Schritt 2: Validiere Daten & reichere sie an ---")
    validated_df = validate_and_enrich_data(combined_df) 
    validated_rounded_df = apply_precision_to_cleaned(validated_df.copy(), PRECISION_RULES)
    output_validated_path = os.path.join(OUTPUT_DIR, '2_validated_data.csv')
    validated_rounded_df.to_csv(output_validated_path, index=False, sep=';', decimal=',')
    print(f"-> Schritt 2 abgeschlossen.")
    
    print("\n--- Schritt 3: Erstelle tägliche Zusammenfassung ---")
    daily_summary_df = consolidate_daily_summary(validated_df, CONSOLIDATION_RULES, PRECISION_RULES)
    output_summary_path = os.path.join(OUTPUT_DIR, '3_daily_summary.csv')
    daily_summary_df.to_csv(output_summary_path, index=False, sep=';', decimal=',')
    print(f"-> Schritt 3 abgeschlossen.")

    print("\nPipeline erfolgreich durchgelaufen!")

if __name__ == '__main__':
    main_pipeline()