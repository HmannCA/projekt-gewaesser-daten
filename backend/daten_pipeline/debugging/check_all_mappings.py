import pandas as pd
import json
import glob

def check_all_column_mappings():
    """Prüft ALLE Spalten-Zuordnungen systematisch"""
    
    # 1. Lade CSV mit Header
    test_file = "input/wamo00019_24313817_parameter_20250425T090000_1116.csv"
    df = pd.read_csv(test_file, sep=',')
    
    # 2. Lade Metadaten
    metadata_files = glob.glob("input/wamo*metadata*.json")
    with open(metadata_files[0], 'r') as f:
        metadata = json.load(f)
    
    # 3. Erstelle Mappings
    csv_reality = {}  # Was wirklich in der CSV steht
    metadata_claims = {}  # Was die Metadaten behaupten
    
    # CSV-Reality (aus Header)
    for i, col_name in enumerate(df.columns):
        if not col_name.startswith('Flags'):
            csv_reality[i+1] = col_name  # 1-basiert
    
    # Metadata-Claims
    datastream_to_name = {}
    for param in metadata.get('parameterMetadata', []):
        ds_id = param.get('datastream')
        name = param.get('nameCustom') or param.get('name')
        datastream_to_name[ds_id] = name
    
    for col_info in metadata.get('csvColumns', []):
        if col_info.get('dataType') == 'result':
            col_num = col_info.get('column')
            ds_id = col_info.get('datastream')
            if ds_id in datastream_to_name:
                metadata_claims[col_num] = datastream_to_name[ds_id]
    
    # 4. Vergleiche und zeige Diskrepanzen
    print("=== SPALTEN-VERGLEICH: CSV vs METADATEN ===\n")
    print(f"{'Spalte':<8} {'CSV-Header':<25} {'Metadaten sagen':<25} {'Status':<10}")
    print("-" * 70)
    
    mismatches = 0
    for col_num in sorted(set(csv_reality.keys()) | set(metadata_claims.keys())):
        csv_val = csv_reality.get(col_num, "---")
        meta_val = metadata_claims.get(col_num, "---")
        
        # Normalisiere Namen für Vergleich
        csv_norm = csv_val.lower().replace(' ', '').replace('.', '')
        meta_norm = meta_val.lower().replace(' ', '').replace('.', '')
        
        if csv_norm != meta_norm and csv_val != "---" and meta_val != "---":
            status = "❌ FALSCH"
            mismatches += 1
        elif csv_val == "---" or meta_val == "---":
            status = "⚠️ FEHLT"
        else:
            status = "✓ OK"
        
        print(f"{col_num:<8} {csv_val:<25} {meta_val:<25} {status}")
    
    print(f"\n=== ZUSAMMENFASSUNG ===")
    print(f"Fehlerhafte Zuordnungen: {mismatches}")
    
    # 5. Versuche Muster zu erkennen
    print("\n=== MUSTER-ANALYSE ===")
    offsets = []
    for csv_col, csv_name in csv_reality.items():
        for meta_col, meta_name in metadata_claims.items():
            if csv_name.lower() == meta_name.lower():
                offset = meta_col - csv_col
                offsets.append(offset)
                if offset != 0:
                    print(f"{csv_name}: CSV Spalte {csv_col} → Metadaten Spalte {meta_col} (Versatz: {offset:+d})")
    
    if offsets:
        most_common_offset = max(set(offsets), key=offsets.count)
        print(f"\nHäufigster Versatz: {most_common_offset:+d}")
        if abs(most_common_offset) > 0:
            print("➡️ Die Metadaten sind systematisch verschoben!")

if __name__ == "__main__":
    check_all_column_mappings()