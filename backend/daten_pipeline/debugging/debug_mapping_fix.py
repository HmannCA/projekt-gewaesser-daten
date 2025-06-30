import pandas as pd
import json
import glob

def debug_and_fix_mapping():
    """Findet die korrekte Spalten-Zuordnung"""
    
    # Lade eine Test-CSV mit Header
    test_file = "input/wamo00019_24313817_parameter_20250425T090000_1116.csv"
    df_with_header = pd.read_csv(test_file, sep=',', nrows=0)  # Nur Header
    
    print("=== CSV-HEADER ANALYSE ===")
    print("\nTatsächliche Spalten in der CSV:")
    for i, col in enumerate(df_with_header.columns):
        print(f"  Spalte {i+1}: {col}")
    
    # Finde Lufttemperatur-Spalte
    lufttemp_col = None
    for i, col in enumerate(df_with_header.columns):
        if col == 'Lufttemperatur':
            lufttemp_col = i + 1  # 1-basiert für Metadaten
            print(f"\n✓ Lufttemperatur gefunden in Spalte {lufttemp_col}")
            break
    
    # Prüfe Metadaten
    metadata_files = glob.glob("input/wamo*metadata*.json")
    if metadata_files:
        with open(metadata_files[0], 'r') as f:
            metadata = json.load(f)
        
        print("\n=== METADATEN-CHECK ===")
        
        # Was sagen die Metadaten über Spalte 28 und 30?
        for col_info in metadata.get('csvColumns', []):
            if col_info.get('column') in [28, 30]:
                print(f"\nSpalte {col_info.get('column')} in Metadaten:")
                print(f"  datastream: {col_info.get('datastream')}")
                print(f"  dataType: {col_info.get('dataType')}")
        
        # Finde Lufttemperatur in parameterMetadata
        print("\n=== PARAMETER-METADATEN ===")
        for param in metadata.get('parameterMetadata', []):
            name = param.get('name', '')
            if 'Lufttemperatur' in name or 'Air' in name:
                print(f"\nGefunden: {name}")
                print(f"  datastream: {param.get('datastream')}")
                print(f"  nameCustom: {param.get('nameCustom')}")
    
    # Vergleiche mit echten Werten
    print("\n=== WERTE-VERGLEICH ===")
    df_data = pd.read_csv(test_file, sep=',')
    if len(df_data) > 0:
        print(f"\nErste Datenzeile:")
        print(f"  Spalte 28 (Lufttemperatur laut CSV): {df_data.iloc[0, 27]}")
        print(f"  Spalte 30 (Was ist das?): {df_data.iloc[0, 29] if len(df_data.columns) > 29 else 'N/A'}")
        
        # Zeige auch Wassertemperaturen
        print(f"\nWassertemperaturen zum Vergleich:")
        for col_name in ['Wassertemp. (0.5m)', 'Wassertemp. (1m)', 'Wassertemp. (2m)']:
            if col_name in df_data.columns:
                idx = df_data.columns.get_loc(col_name)
                print(f"  {col_name} (Spalte {idx+1}): {df_data.iloc[0][col_name]}")

if __name__ == "__main__":
    debug_and_fix_mapping()