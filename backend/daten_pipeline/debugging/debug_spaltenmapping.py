import pandas as pd
import glob
from metadata_mapper import load_metadata, create_column_mapping

def debug_column_mapping():
    """Findet heraus, welche Spalte tatsächlich gelesen wird"""
    
    print("=== DEBUG SPALTEN-MAPPING ===\n")
    
    # 1. Lade eine Einzel-CSV direkt
    files = sorted(glob.glob("input/wamo00019*.csv"))
    if not files:
        return
        
    test_file = files[0]
    print(f"Teste mit Datei: {test_file}")
    
    # Lade OHNE Header-Behandlung
    raw_df = pd.read_csv(test_file, sep=',', header=None)
    print(f"\nROHE CSV-STRUKTUR:")
    print(f"Shape: {raw_df.shape}")
    print(f"Erste Zeile (möglicher Header):")
    print(raw_df.iloc[0].to_dict())
    
    # 2. Lade mit Index
    df_with_index = pd.read_csv(test_file, sep=',', header=None, index_col=0)
    print(f"\nMIT INDEX-SPALTE:")
    print(f"Shape: {df_with_index.shape}")
    
    # 3. Prüfe Metadaten-Mapping
    metadata_files = glob.glob("input/wamo*metadata*.json")
    if metadata_files:
        metadata = load_metadata(metadata_files[0])
        mapping, details = create_column_mapping(metadata)
        
        print(f"\nMETADATEN-MAPPING:")
        # Suche Lufttemperatur
        for col_idx, param_name in sorted(mapping.items()):
            if 'Lufttemperatur' in param_name or 'lufttemperatur' in param_name.lower():
                print(f"  Spalte {col_idx} → {param_name}")
                
                # WICHTIG: Prüfe den tatsächlichen Wert
                if col_idx <= len(df_with_index.columns):
                    # Beachte: pandas zählt ab 0, CSV ab 1
                    # und index_col=0 verschiebt alles um 1
                    pandas_col = col_idx - 2  # -1 für 0-basiert, -1 für index_col
                    if 0 <= pandas_col < len(df_with_index.columns):
                        value = df_with_index.iloc[1, pandas_col]  # Zweite Zeile (erste Daten)
                        print(f"    → Wert in dieser Spalte: {value}")
        
        # Zeige ALLE Spalten mit Werten
        print(f"\nALLE SPALTEN (erste Datenzeile):")
        for i in range(min(30, len(df_with_index.columns))):
            value = df_with_index.iloc[1, i] if len(df_with_index) > 1 else 'N/A'
            mapped_name = "?"
            # Finde mapping
            for col_idx, name in mapping.items():
                if col_idx - 2 == i:  # Adjustiert für index_col und 0-basiert
                    mapped_name = name
                    break
            print(f"  Spalte {i} (CSV {i+2}): {value} → {mapped_name}")
    
    # 4. Vergleiche mit Zusammenfassung
    summary_file = 'wamo00019_24313817_Zusammenfassung_20250611.csv'
    if os.path.exists(summary_file):
        summary_df = pd.read_csv(summary_file)
        if 'Lufttemperatur' in summary_df.columns:
            print(f"\nERWARTETER WERT (aus Zusammenfassung):")
            print(f"  Lufttemperatur um 00:00: {summary_df['Lufttemperatur'].iloc[0]}°C")

if __name__ == "__main__":
    import os
    debug_column_mapping()