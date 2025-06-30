"""
Schnelltest um zu sehen was wirklich in den Daten ist
"""

import pandas as pd
import glob
import os

# Lade eine Beispiel-CSV
input_dir = os.path.join(os.path.dirname(__file__), "input")
csv_files = sorted(glob.glob(os.path.join(input_dir, "wamo00010*.csv")))

if csv_files:
    # Lade erste 5 Dateien
    dfs = []
    for f in csv_files[:5]:
        df = pd.read_csv(f, sep=',', header=None, index_col=0)
        if df.index.dtype == 'object' and 'Timestamp' in str(df.index[0]):
            df = df.iloc[1:]
        dfs.append(df)
    
    combined = pd.concat(dfs)
    
    print("ROHDATEN STRUKTUR:")
    print(f"Shape: {combined.shape}")
    print(f"\nSpalten-Indizes: {list(combined.columns)}")
    print(f"\nErste Zeile:")
    print(combined.iloc[0])
    
    # Lade mit Mapping
    from metadata_mapper import load_metadata, create_column_mapping, map_columns_to_names
    
    metadata_files = glob.glob(os.path.join(input_dir, "wamo*metadata*.json"))
    if metadata_files:
        metadata = load_metadata(metadata_files[0])
        column_mapping, _ = create_column_mapping(metadata)
        
        # Konvertiere und mappe
        combined_numeric = combined.apply(pd.to_numeric, errors='coerce')
        mapped = map_columns_to_names(combined_numeric, column_mapping)
        
        print("\n" + "="*60)
        print("GEMAPPTE DATEN:")
        print(f"Spalten: {list(mapped.columns)}")
        print(f"\nBeispielwerte:")
        for col in list(mapped.columns)[:5]:
            print(f"{col}: {mapped[col].iloc[0]}")