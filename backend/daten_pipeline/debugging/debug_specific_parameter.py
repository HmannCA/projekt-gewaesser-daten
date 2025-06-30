"""
Debug-Skript speziell für Phycocyanin Abs.
Findet heraus, wo Flag=2 herkommt
"""

import pandas as pd
import numpy as np
import os
import glob
from datetime import datetime

# Importiere alle Module
from metadata_mapper import load_metadata, create_column_mapping, map_columns_to_names
from validator import WaterQualityValidator

def debug_phycocyanin():
    """Debug speziell für Phycocyanin Abs."""
    
    print("=" * 80)
    print("DEBUG: Phycocyanin Abs. - Woher kommt Flag=2?")
    print("=" * 80)
    
    # Lade Daten
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    INPUT_DIR = os.path.join(BASE_DIR, "input")
    
    # Metadaten
    metadata_files = glob.glob(os.path.join(INPUT_DIR, "wamo*metadata*.json"))
    metadata = load_metadata(metadata_files[0])
    column_mapping, _ = create_column_mapping(metadata)
    
    # Lade Dateien für 21.05. (wo wir Flag=2 gesehen haben)
    csv_files = glob.glob(os.path.join(INPUT_DIR, "wamo00010*_177.csv"))  # bis _200 für 24 Stunden
    csv_files.extend(glob.glob(os.path.join(INPUT_DIR, "wamo00010*_17?.csv")))
    csv_files.extend(glob.glob(os.path.join(INPUT_DIR, "wamo00010*_18?.csv")))
    csv_files.extend(glob.glob(os.path.join(INPUT_DIR, "wamo00010*_19?.csv")))
    csv_files.extend(glob.glob(os.path.join(INPUT_DIR, "wamo00010*_200.csv")))
    csv_files = sorted(list(set(csv_files)))[:24]  # Max 24 Stunden
    
    print(f"Lade {len(csv_files)} Dateien für 21.05.2025")
    
    dfs = []
    for f in csv_files:
        df = pd.read_csv(f, sep=',', header=None, index_col=0)
        if df.index.dtype == 'object' and 'Timestamp' in str(df.index[0]):
            df = df.iloc[1:]
        dfs.append(df)
    
    if not dfs:
        print("FEHLER: Keine Dateien gefunden!")
        return
    
    raw_data = pd.concat(dfs)
    raw_data.index = pd.to_datetime(raw_data.index, errors='coerce')
    raw_data = raw_data[raw_data.index.notna()]
    raw_data.sort_index(inplace=True)
    
    # Konvertiere und mappe
    processed_data = raw_data.apply(pd.to_numeric, errors='coerce')
    processed_data = map_columns_to_names(processed_data, column_mapping)
    
    # Fokus auf Phycocyanin
    param = 'Phycocyanin Abs.'
    if param not in processed_data.columns:
        print(f"FEHLER: {param} nicht in Daten!")
        return
    
    test_series = processed_data[param]
    
    print(f"\nParameter: {param}")
    print(f"Anzahl Werte: {len(test_series)}")
    print(f"Wertebereich: {test_series.min():.3f} - {test_series.max():.3f}")
    print(f"Erste 10 Werte: {test_series.head(10).tolist()}")
    
    # Prüfe Validierungsregeln aus main_pipeline
    print("\n" + "="*60)
    print("VALIDIERUNGSREGELN aus main_pipeline.py:")
    print("="*60)
    
    validation_rules = {
        'Phycocyanin Abs.': {'min': 0.0, 'max': 200.0},
    }
    
    rule = validation_rules[param]
    print(f"Range: {rule['min']} - {rule['max']}")
    
    # Teste Range Validation
    validator = WaterQualityValidator()
    flags_range, reasons_range = validator.validate_range(
        test_series, rule['min'], rule['max']
    )
    
    print(f"\nRange Validation Ergebnis:")
    print(f"Flag-Verteilung: {flags_range.value_counts().to_dict()}")
    
    # Zeige wo Flag != 1
    not_good = flags_range != 1
    if not_good.any():
        print(f"\n{not_good.sum()} Werte haben Flag != 1:")
        bad_examples = test_series[not_good].head(10)
        for idx, value in bad_examples.items():
            print(f"  Zeit: {idx}, Wert: {value:.3f}, Flag: {flags_range[idx]}, Grund: {reasons_range[idx]}")
    
    # WICHTIG: Prüfe ob die Werte wirklich numerisch sind
    print("\n" + "="*60)
    print("DATENTYP-PRÜFUNG:")
    print("="*60)
    
    print(f"Series dtype: {test_series.dtype}")
    print(f"Enthält NaN: {test_series.isna().any()}")
    print(f"NaN-Anzahl: {test_series.isna().sum()}")
    
    # Prüfe ob es String-Werte gibt
    try:
        numeric_check = pd.to_numeric(test_series, errors='coerce')
        non_numeric = test_series[numeric_check.isna() & test_series.notna()]
        if len(non_numeric) > 0:
            print(f"\nNICHT-NUMERISCHE WERTE gefunden: {len(non_numeric)}")
            print(non_numeric.head())
    except:
        pass
    
    # Simuliere main_pipeline Logik
    print("\n" + "="*60)
    print("SIMULIERE MAIN_PIPELINE LOGIK:")
    print("="*60)
    
    # Erstelle leeren flags_per_test DataFrame
    flags_per_test = pd.DataFrame(index=processed_data.index)
    reasons_per_test = pd.DataFrame(index=processed_data.index)
    
    # Range Check
    flags_per_test[f'flag_{param}_range'] = flags_range
    reasons_per_test[f'reason_{param}_range'] = reasons_range
    
    print("Nach Range Check:")
    print(f"  flags_per_test Spalten: {list(flags_per_test.columns)}")
    print(f"  Flag-Verteilung: {flags_per_test[f'flag_{param}_range'].value_counts().to_dict()}")
    
    # Stuck Values Check
    from stuck_value_validator import check_stuck_values
    flags_stuck, reasons_stuck = check_stuck_values(test_series, tolerance=3)
    flags_per_test[f'flag_{param}_stuck'] = flags_stuck
    reasons_per_test[f'reason_{param}_stuck'] = reasons_stuck
    
    print("\nNach Stuck Check:")
    print(f"  Stuck Flag-Verteilung: {flags_stuck.value_counts().to_dict()}")
    
    # Spike Check (für Phycocyanin gibt es keine spike_rules in main_pipeline)
    print("\nSpike Check: ÜBERSPRUNGEN (keine Regel für Phycocyanin)")
    
    # Multivariate (wenn genug Parameter)
    print("\nMultivariate Check...")
    from multivariate_validator import check_multivariate_anomalies
    
    test_params = ['Phycocyanin Abs.', 'pH', 'Gelöster Sauerstoff', 'Leitfähigkeit', 'Trübung']
    available = [p for p in test_params if p in processed_data.columns]
    
    if len(available) > 1:
        multi_flags, multi_reasons = check_multivariate_anomalies(
            processed_data[available], available
        )
        print(f"  Multivariate Flag-Verteilung: {multi_flags.value_counts().to_dict()}")
        
        # HIER IST DER TRICK: multi_flags gilt für ALLE Parameter!
        for col_name in available:
            flags_per_test[f'flag_{col_name}_multivariate'] = multi_flags
            reasons_per_test[f'reason_{col_name}_multivariate'] = multi_reasons
    
    # Kombiniere Flags
    print("\nKOMBINIERE FLAGS:")
    relevant_flag_cols = [col for col in flags_per_test.columns if f"_{param}_" in col]
    print(f"  Relevante Flag-Spalten: {relevant_flag_cols}")
    
    if relevant_flag_cols:
        final_flags, final_reasons = validator.combine_flags_and_reasons(
            flags_per_test[relevant_flag_cols],
            reasons_per_test[[col.replace('flag_', 'reason_') for col in relevant_flag_cols]]
        )
        
        print(f"\nFINALE FLAG-VERTEILUNG:")
        print(f"{final_flags.value_counts().to_dict()}")
        
        # Zeige Beispiele wo Flag=2
        flag_2_mask = final_flags == 2
        if flag_2_mask.any():
            print(f"\n{flag_2_mask.sum()} Werte haben finalen Flag=2!")
            print("Aber KEINER der Validatoren hat Flag=2 gesetzt!")
            print("Das ist ein FEHLER in der Pipeline!")


if __name__ == "__main__":
    debug_phycocyanin()