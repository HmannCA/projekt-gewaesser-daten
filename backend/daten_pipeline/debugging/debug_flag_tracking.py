"""
Debug-Skript um zu verfolgen, welcher Validator welche Flags setzt
Zeigt genau wo Flag=1 zu Flag=2 wird
"""

import pandas as pd
import numpy as np
import os
import glob
from datetime import datetime

# Importiere alle Validatoren
from metadata_mapper import load_metadata, create_column_mapping, map_columns_to_names
from validator import WaterQualityValidator
from stuck_value_validator import check_stuck_values
from spike_validator import check_spikes
from multivariate_validator import check_multivariate_anomalies

def track_flag_changes():
    """Verfolgt Schritt für Schritt welche Flags gesetzt werden"""
    
    print("=" * 80)
    print("FLAG-TRACKING: Welcher Validator setzt welche Flags?")
    print("=" * 80)
    
    # 1. Lade Testdaten (erste paar Stunden)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    INPUT_DIR = os.path.join(BASE_DIR, "input")
    
    # Metadaten
    metadata_files = glob.glob(os.path.join(INPUT_DIR, "wamo*metadata*.json"))
    metadata = load_metadata(metadata_files[0])
    column_mapping, _ = create_column_mapping(metadata)
    
    # Lade erste 5 CSV-Dateien
    csv_files = sorted(glob.glob(os.path.join(INPUT_DIR, "wamo00010*.csv")))[:5]
    
    dfs = []
    for f in csv_files:
        df = pd.read_csv(f, sep=',', header=None, index_col=0)
        if df.index.dtype == 'object' and 'Timestamp' in str(df.index[0]):
            df = df.iloc[1:]
        dfs.append(df)
    
    raw_data = pd.concat(dfs)
    raw_data.index = pd.to_datetime(raw_data.index, errors='coerce')
    raw_data = raw_data[raw_data.index.notna()]
    
    # Konvertiere und mappe
    processed_data = raw_data.apply(pd.to_numeric, errors='coerce')
    processed_data = map_columns_to_names(processed_data, column_mapping)
    
    print(f"Testdaten: {len(processed_data)} Stunden")
    print(f"Parameter: {list(processed_data.columns)[:5]}...")
    
    # 2. Teste jeden Validator einzeln
    test_param = 'Nitrat'  # Beispielparameter
    test_series = processed_data[test_param]
    
    print(f"\n{'='*60}")
    print(f"TESTE PARAMETER: {test_param}")
    print(f"Wertebereich: {test_series.min():.2f} - {test_series.max():.2f}")
    print(f"{'='*60}")
    
    # Tracking-DataFrame
    flag_tracking = pd.DataFrame(index=test_series.index)
    flag_tracking['Originalwert'] = test_series
    
    # A) RANGE VALIDATION
    print("\n1. RANGE VALIDATION")
    validator = WaterQualityValidator()
    
    # Verschiedene Grenzwerte testen
    test_ranges = [
        {'min': 0.0, 'max': 50.0},
        {'min': 0.0, 'max': 10.0},
        {'min': 0.0, 'max': 5.0}
    ]
    
    for i, range_rule in enumerate(test_ranges):
        flags, reasons = validator.validate_range(
            test_series, 
            range_rule['min'], 
            range_rule['max']
        )
        
        flag_counts = flags.value_counts().to_dict()
        print(f"  Range {range_rule}: {flag_counts}")
        
        if i == 0:  # Speichere erste Range-Flags
            flag_tracking['Range_Flag'] = flags
            flag_tracking['Range_Reason'] = reasons
    
    # B) STUCK VALUES
    print("\n2. STUCK VALUE VALIDATION")
    flags_stuck, reasons_stuck = check_stuck_values(test_series, tolerance=3)
    flag_tracking['Stuck_Flag'] = flags_stuck
    flag_tracking['Stuck_Reason'] = reasons_stuck
    print(f"  Stuck Flags: {flags_stuck.value_counts().to_dict()}")
    
    # C) SPIKE DETECTION
    print("\n3. SPIKE VALIDATION")
    flags_spike, reasons_spike = check_spikes(test_series, max_rate_of_change=10.0)
    flag_tracking['Spike_Flag'] = flags_spike
    flag_tracking['Spike_Reason'] = reasons_spike
    print(f"  Spike Flags: {flags_spike.value_counts().to_dict()}")
    
    # D) MULTIVARIATE (simuliert)
    print("\n4. MULTIVARIATE VALIDATION")
    # Erstelle Test-DataFrame mit mehreren Parametern
    test_params = ['Nitrat', 'pH', 'Gelöster Sauerstoff', 'Leitfähigkeit', 'Trübung']
    available_params = [p for p in test_params if p in processed_data.columns]
    
    if len(available_params) > 1:
        test_df = processed_data[available_params].copy()
        multi_flags, multi_reasons = check_multivariate_anomalies(test_df, available_params)
        flag_tracking['Multi_Flag'] = multi_flags
        flag_tracking['Multi_Reason'] = multi_reasons
        print(f"  Multivariate Flags: {multi_flags.value_counts().to_dict()}")
    
    # E) COMBINATION (wie in main_pipeline)
    print("\n5. KOMBINATION (wie in main_pipeline.py)")
    
    # Sammle alle Flag-Spalten
    flag_columns = [col for col in flag_tracking.columns if '_Flag' in col and col != 'Originalwert']
    reason_columns = [col for col in flag_tracking.columns if '_Reason' in col]
    
    if flag_columns:
        final_flags, final_reasons = validator.combine_flags_and_reasons(
            flag_tracking[flag_columns],
            flag_tracking[reason_columns] if reason_columns else pd.DataFrame()
        )
        flag_tracking['FINAL_Flag'] = final_flags
        flag_tracking['FINAL_Reason'] = final_reasons
        
        print(f"  Finale Flags: {final_flags.value_counts().to_dict()}")
    
    # 3. Zeige Beispiele wo sich Flags ändern
    print(f"\n{'='*60}")
    print("BEISPIELE: Wo ändern sich die Flags?")
    print(f"{'='*60}")
    
    # Zeige erste 10 Zeilen
    print("\nFlag-Entwicklung (erste 10 Werte):")
    display_cols = ['Originalwert', 'Range_Flag', 'Stuck_Flag', 'Spike_Flag', 'FINAL_Flag']
    display_cols = [col for col in display_cols if col in flag_tracking.columns]
    
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    print(flag_tracking[display_cols].head(10))
    
    # 4. Analysiere wo Flag=1 verloren geht
    print(f"\n{'='*60}")
    print("ANALYSE: Wo geht Flag=1 verloren?")
    print(f"{'='*60}")
    
    if 'Range_Flag' in flag_tracking.columns:
        range_has_1 = (flag_tracking['Range_Flag'] == 1).sum()
        print(f"\nRange Validation: {range_has_1} Werte mit Flag=1")
        
        if range_has_1 > 0 and 'FINAL_Flag' in flag_tracking.columns:
            # Wo wurde Flag=1 überschrieben?
            was_1_now_not = (flag_tracking['Range_Flag'] == 1) & (flag_tracking['FINAL_Flag'] != 1)
            overwritten_count = was_1_now_not.sum()
            
            if overwritten_count > 0:
                print(f"PROBLEM: {overwritten_count} Flag=1 Werte wurden überschrieben!")
                print("\nBeispiele:")
                examples = flag_tracking[was_1_now_not].head(5)
                for idx, row in examples.iterrows():
                    print(f"\n  Zeit: {idx}")
                    print(f"  Wert: {row['Originalwert']:.2f}")
                    print(f"  Range Flag: {row['Range_Flag']} → Final Flag: {row['FINAL_Flag']}")
                    if 'FINAL_Reason' in row:
                        print(f"  Grund: {row['FINAL_Reason']}")
    
    # 5. Teste die combine_flags_and_reasons Funktion direkt
    print(f"\n{'='*60}")
    print("TESTE combine_flags_and_reasons DIREKT")
    print(f"{'='*60}")
    
    # Erstelle Test-Szenario
    test_flags_df = pd.DataFrame({
        'test1': [1, 1, 1, 2, 3],  # Mostly GOOD
        'test2': [1, 2, 2, 2, 2],  # Mix
        'test3': [1, 1, 3, 1, 1]   # One SUSPECT
    })
    
    test_reasons_df = pd.DataFrame({
        'test1': ['', '', '', 'Not evaluated', 'Suspect'],
        'test2': ['', 'Not eval', 'Not eval', 'Not eval', 'Not eval'],
        'test3': ['', '', 'High value', '', '']
    })
    
    combined_flags, combined_reasons = validator.combine_flags_and_reasons(
        test_flags_df, test_reasons_df
    )
    
    print("\nTest-Eingabe:")
    print(test_flags_df)
    print("\nKombinierte Flags:")
    print(combined_flags.tolist())
    print("\nPROBLEM?: combine_flags nimmt IMMER den höchsten (schlechtesten) Flag!")
    
    return flag_tracking


def check_validator_code():
    """Prüft den Code der Validatoren"""
    print(f"\n{'='*80}")
    print("CODE-ANALYSE: Was macht combine_flags_and_reasons?")
    print(f"{'='*80}")
    
    # Schaue in validator.py
    validator_path = os.path.join(os.path.dirname(__file__), 'validator.py')
    if os.path.exists(validator_path):
        with open(validator_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Finde combine_flags_and_reasons
        if 'combine_flags_and_reasons' in content:
            start = content.find('def combine_flags_and_reasons')
            end = content.find('\n    def', start + 1)
            if end == -1:
                end = len(content)
            
            method_code = content[start:end]
            
            # Finde die kritische Zeile
            if 'max(axis=1)' in method_code:
                print("\nGEFUNDEN! Die Methode nimmt IMMER den MAXIMUM (schlechtesten) Flag:")
                print("  final_flags = df_flags.max(axis=1)")
                print("\nDas bedeutet:")
                print("  - Wenn IRGENDEIN Validator Flag>1 setzt")
                print("  - Wird Flag=1 IMMER überschrieben!")
                print("  - Selbst wenn nur EIN Test 'NOT_EVALUATED' sagt!")


if __name__ == "__main__":
    # Führe Flag-Tracking aus
    tracking_result = track_flag_changes()
    
    # Prüfe Validator-Code
    check_validator_code()
    
    print(f"\n{'='*80}")
    print("FAZIT: Die combine_flags_and_reasons Funktion ist das Problem!")
    print("Sie nimmt IMMER den schlechtesten Flag von allen Tests.")
    print("Wenn auch nur EIN Test Flag=2 setzt, ist der finale Flag=2!")
    print(f"{'='*80}")