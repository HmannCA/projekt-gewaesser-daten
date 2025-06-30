import json
import pandas as pd
import glob
import os

def load_metadata(metadata_path: str):
    """Lädt die Metadaten-JSON-Datei."""
    try:
        with open(metadata_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Fehler: Metadaten-Datei nicht gefunden unter {metadata_path}")
        return None

def create_column_mapping(metadata: dict):
    """
    Erstellt ein Mapping von der Spaltenposition zum menschenlesbaren Parameternamen.
    """
    column_map = {}
    param_details = {}
    key_to_try = 'parameterMetadata'
    if key_to_try not in metadata:
        print(f"Fehler: Konnte den Schlüssel '{key_to_try}' in den Metadaten nicht finden.")
        return None, None

    datastream_info = {ds['datastream']: ds for ds in metadata[key_to_try]}
    for col_info in metadata.get('csvColumns', []):
        col_idx = col_info.get('column')
        if col_info.get('dataType') == 'result' and 'datastream' in col_info:
            ds_id = col_info['datastream']
            if ds_id in datastream_info:
                stream_meta = datastream_info[ds_id]
                param_name = stream_meta.get('nameCustom') or stream_meta.get('name')
                column_map[col_idx] = param_name
                param_details[param_name] = {
                    'unit': stream_meta.get('unitOfMeasurementCustom') or stream_meta.get('unitOfMeasurement'),
                    'description': stream_meta.get('description')
                }
    
    # NEU: Automatische Validierung und Korrektur
    try:
        # Prüfe ob metadata_validator existiert
        if os.path.exists('metadata_validator.py'):
            # Finde eine Beispiel-CSV für Validierung
            csv_files = glob.glob("input/*.csv")
            if csv_files:
                from metadata_validator import auto_validate_metadata
                
                # Validiere mit erster CSV-Datei
                print("\nPrüfe Metadaten-Korrektheit...")
                corrections = auto_validate_metadata(csv_files[0], metadata)
                
                if corrections:
                    print("Wende automatische Korrekturen an...")
                    # Überschreibe fehlerhaftes Mapping mit korrigiertem
                    old_map_size = len(column_map)
                    column_map = corrections
                    print(f"Korrigiert: {old_map_size} → {len(column_map)} Spalten")
                else:
                    print("Metadaten scheinen korrekt zu sein.")
        else:
            # Fallback: Verwende den alten WORKAROUND
            print("metadata_validator.py nicht gefunden - verwende einfachen Workaround")
            
            # WORKAROUND für bekannte falsche Spalten-Zuordnung
            if 28 in column_map and column_map[28] == 'Wassertemp. (2m)':
                if 30 in column_map and column_map[30] == 'Lufttemperatur':
                    # Vertausche die beiden
                    column_map[28] = 'Lufttemperatur'
                    column_map[30] = 'Wassertemp. (2m)'
                    print("INFO: Spalten-Mapping korrigiert (Lufttemperatur <-> Wassertemp. 2m)")
                    
    except Exception as e:
        print(f"Automatische Validierung fehlgeschlagen: {e}")
        print("Verwende Original-Metadaten...")
        
        # Bei Fehler: Verwende wenigstens den bekannten Workaround
        if 28 in column_map and column_map[28] == 'Wassertemp. (2m)':
            if 30 in column_map and column_map[30] == 'Lufttemperatur':
                column_map[28] = 'Lufttemperatur'
                column_map[30] = 'Wassertemp. (2m)'
                print("INFO: Basis-Korrektur angewendet")
    
    return column_map, param_details

def map_columns_to_names(df: pd.DataFrame, column_mapping: dict):
    """
    Benennt die Spalten eines DataFrames anhand des Mappings um.
    Diese Version behebt den "Off-by-One"-Fehler.
    """
    rename_map = {}
    # df.columns enthält die Spaltennamen aus pandas (1, 2, 3, ...),
    # die den CSV-Spalten 2, 3, 4, ... entsprechen.
    for df_col_name in df.columns:
        # Wir müssen 1 addieren, um die ursprüngliche CSV-Spaltennummer zu erhalten.
        original_csv_col_number = df_col_name + 1
        
        # Suchen wir diese korrigierte Nummer in unserem Mapping.
        if original_csv_col_number in column_mapping:
            rename_map[df_col_name] = column_mapping[original_csv_col_number]

    df.rename(columns=rename_map, inplace=True)
    # Behalte nur die Spalten, die erfolgreich umbenannt wurden
    return df[list(rename_map.values())].copy()