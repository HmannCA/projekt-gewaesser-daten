import json
import glob

def analyze_datastreams():
    """Analysiert die datastream-Zuordnung in den Metadaten"""
    
    metadata_files = glob.glob("input/wamo*metadata*.json")
    if not metadata_files:
        print("Keine Metadaten gefunden!")
        return
        
    with open(metadata_files[0], 'r') as f:
        metadata = json.load(f)
    
    print("=== DATASTREAM ANALYSE ===\n")
    
    # Erstelle Mapping: datastream ID -> Parameter Name
    datastream_to_param = {}
    for param in metadata.get('parameterMetadata', []):
        ds_id = param.get('datastream')
        name = param.get('nameCustom') or param.get('name', 'Unknown')
        datastream_to_param[ds_id] = name
        
        # Suche speziell nach Temperatur-Parametern
        if 'temp' in name.lower() or 'lufttemperatur' in name.lower():
            print(f"Temperatur-Parameter gefunden:")
            print(f"  Name: {name}")
            print(f"  Datastream: {ds_id}")
            print(f"  Unit: {param.get('unitOfMeasurement')}")
            print()
    
    # Prüfe CSV-Spalten 28 und 30
    print("\n=== SPALTEN-ZUORDNUNG ===")
    for col_info in metadata.get('csvColumns', []):
        col_num = col_info.get('column')
        ds_id = col_info.get('datastream')
        
        if col_num in [28, 30]:
            param_name = datastream_to_param.get(ds_id, 'UNBEKANNT')
            print(f"\nSpalte {col_num}:")
            print(f"  Datastream: {ds_id}")
            print(f"  Parameter: {param_name}")
            
            if col_num == 28 and 'Lufttemperatur' not in param_name:
                print(f"  ⚠️ FEHLER: Spalte 28 sollte Lufttemperatur sein, ist aber {param_name}")
            elif col_num == 30 and 'Supply' not in param_name:
                print(f"  ⚠️ FEHLER: Spalte 30 sollte Supply Voltage sein, ist aber {param_name}")
    
    # Zeige alle datastreams
    print("\n=== ALLE DATASTREAMS ===")
    for ds_id, name in sorted(datastream_to_param.items()):
        if ds_id in [50, 51]:  # Die relevanten IDs
            print(f"  Datastream {ds_id}: {name}")

if __name__ == "__main__":
    analyze_datastreams()