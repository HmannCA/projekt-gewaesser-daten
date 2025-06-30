"""
Debug-Skript für die Tageskonsolidierung
Hilft das Problem mit "Keine validen Tageswerte" zu finden
"""

import pandas as pd
import numpy as np
import os
import glob
from datetime import datetime

# Importiere die Module
from metadata_mapper import load_metadata, create_column_mapping, map_columns_to_names
from interpolating_consolidator import interpolate_and_aggregate

def debug_consolidation():
    """Debuggt Schritt für Schritt die Tageskonsolidierung"""
    
    print("=" * 60)
    print("DEBUG: Tageskonsolidierung")
    print("=" * 60)
    
    # 1. Lade Daten wie in main_pipeline
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    INPUT_DIR = os.path.join(BASE_DIR, "input")
    
    # Metadaten laden
    metadata_files = glob.glob(os.path.join(INPUT_DIR, "wamo*metadata*.json"))
    if not metadata_files:
        print("FEHLER: Keine Metadaten gefunden!")
        return
    
    metadata_path = metadata_files[0]
    metadata = load_metadata(metadata_path)
    column_mapping, _ = create_column_mapping(metadata)
    
    # CSV-Dateien laden
    csv_files = glob.glob(os.path.join(INPUT_DIR, "wamo00010*.csv"))
    if not csv_files:
        print("FEHLER: Keine CSV-Dateien für wamo00010 gefunden!")
        return
    
    print(f"\nGefundene CSV-Dateien: {len(csv_files)}")
    
    # Lade erste Datei für Debug
    test_file = csv_files[0]
    print(f"\nTeste mit Datei: {test_file}")
    
    # Lade Rohdaten
    raw_data = pd.read_csv(test_file, sep=',', header=None, index_col=0, on_bad_lines='skip', encoding='utf-8-sig')
    
    # Bereinige Header
    if raw_data.index.dtype == 'object':
        raw_data = raw_data[~raw_data.index.str.contains('Timestamp', na=False)]
    
    print(f"\nRohdaten Shape: {raw_data.shape}")
    print(f"Index-Typ: {raw_data.index.dtype}")
    print(f"Erste 5 Index-Werte:\n{raw_data.index[:5].tolist()}")
    
    # Konvertiere Index
    raw_data.index = pd.to_datetime(raw_data.index, errors='coerce')
    raw_data = raw_data[raw_data.index.notna()]
    
    print(f"\nNach Zeitkonvertierung:")
    print(f"Shape: {raw_data.shape}")
    print(f"Zeitbereich: {raw_data.index.min()} bis {raw_data.index.max()}")
    
    # Konvertiere zu numerisch und mappe Spalten
    processed_data = raw_data.apply(pd.to_numeric, errors='coerce')
    processed_data = map_columns_to_names(processed_data, column_mapping)
    
    print(f"\nNach Mapping:")
    print(f"Spalten: {list(processed_data.columns)}")
    print(f"Shape: {processed_data.shape}")
    
    # 2. Füge Test-Flags hinzu (wie sie von der Pipeline erstellt würden)
    print("\n" + "-" * 40)
    print("Füge Test-Flags hinzu...")
    
    for param in processed_data.columns:
        # Simuliere Flags (meistens GOOD=1)
        processed_data[f'flag_{param}'] = 1
        processed_data[f'reason_{param}'] = ""
        
        # Setze einige auf SUSPECT für Test
        if param == 'Nitrat' and param in processed_data.columns:
            processed_data.loc[processed_data[param] > 20, f'flag_{param}'] = 3
            processed_data.loc[processed_data[param] > 20, f'reason_{param}'] = "Erhöht"
    
    print(f"Spalten nach Flag-Hinzufügung: {len(processed_data.columns)}")
    print("Beispiel Flag-Spalten:", [c for c in processed_data.columns if 'flag_' in c][:5])
    
    # 3. Teste Resample
    print("\n" + "-" * 40)
    print("Teste Tages-Resampling...")
    
    for day, group_df in processed_data.resample('D'):
        print(f"\nTag: {day}")
        print(f"Anzahl Stunden: {len(group_df)}")
        print(f"Shape: {group_df.shape}")
        
        if len(group_df) > 0:
            # Definiere Test-Regeln
            aggregation_rules = {
                'Nitrat': ['mean', 'min', 'max'],
                'pH': ['mean', 'min', 'max'],
                'Wassertemperatur': ['mean', 'min', 'max']
            }
            
            precision_rules = {
                'Nitrat': 1,
                'pH': 2,
                'Wassertemperatur': 2,
                'default': 2
            }
            
            # Versuche Aggregation
            print("\nVersuche interpolate_and_aggregate...")
            try:
                result = interpolate_and_aggregate(
                    group_df,
                    parameter_rules=aggregation_rules,
                    precision_rules=precision_rules
                )
                
                if result is not None and not result.empty:
                    print(f"ERFOLG! Ergebnis hat {len(result)} Werte")
                    print(f"Erste Werte: {list(result.items())[:5]}")
                else:
                    print("PROBLEM: Ergebnis ist None oder leer!")
                    
                    # Debug interpolate_and_aggregate
                    print("\nDebugge interpolate_and_aggregate Parameter:")
                    for param in aggregation_rules.keys():
                        if param in group_df.columns:
                            print(f"\n{param}:")
                            print(f"  - Werte vorhanden: {group_df[param].notna().sum()}")
                            print(f"  - Flag-Spalte: {'flag_' + param in group_df.columns}")
                            print(f"  - Reason-Spalte: {'reason_' + param in group_df.columns}")
                            
                            if f'flag_{param}' in group_df.columns:
                                flags = group_df[f'flag_{param}']
                                print(f"  - Flag-Werte: {flags.value_counts().to_dict()}")
                                good_count = (flags == 1).sum()
                                print(f"  - Gute Werte: {good_count}")
                        else:
                            print(f"\n{param}: NICHT IN DATEN!")
                
            except Exception as e:
                print(f"FEHLER bei interpolate_and_aggregate: {e}")
                import traceback
                traceback.print_exc()
        
        # Nur ersten Tag für Debug
        break
    
    # 4. Prüfe die interpolating_consolidator.py Logik
    print("\n" + "-" * 40)
    print("Prüfe consolidator Logik...")
    
    # Simuliere direkt die Funktion
    test_param = 'Nitrat'
    if test_param in processed_data.columns:
        test_data = processed_data.head(24).copy()  # Erste 24 Stunden
        
        print(f"\nTest mit {test_param}:")
        print(f"Daten vorhanden: {test_data[test_param].notna().sum()} von {len(test_data)}")
        
        # Check was consolidator erwartet
        flag_col = f'flag_{test_param}'
        reason_col = f'reason_{test_param}'
        
        print(f"Flag-Spalte '{flag_col}' vorhanden: {flag_col in test_data.columns}")
        print(f"Reason-Spalte '{reason_col}' vorhanden: {reason_col in test_data.columns}")
        
        if flag_col in test_data.columns:
            print(f"Flag-Verteilung: {test_data[flag_col].value_counts().to_dict()}")


def check_consolidator_function():
    """Prüft die interpolating_consolidator.py Datei"""
    print("\n" + "=" * 60)
    print("Prüfe interpolating_consolidator.py")
    print("=" * 60)
    
    try:
        from interpolating_consolidator import interpolate_and_aggregate, QartodFlags
        print("✓ Import erfolgreich")
        
        # Erstelle Testdaten
        test_df = pd.DataFrame({
            'Nitrat': [15.0, 16.0, 17.0, 22.0, 23.0],
            'flag_Nitrat': [1, 1, 1, 3, 3],
            'reason_Nitrat': ['', '', '', 'Erhöht', 'Erhöht']
        }, index=pd.date_range('2024-01-01', periods=5, freq='h'))
        
        test_rules = {'Nitrat': ['mean', 'min', 'max']}
        test_precision = {'Nitrat': 1}
        
        print("\nTeste mit Beispieldaten...")
        result = interpolate_and_aggregate(test_df, test_rules, test_precision)
        
        if result is not None:
            print(f"✓ Funktion gibt Ergebnis zurück: {len(result)} Werte")
            print(f"Ergebnis: {dict(result)}")
        else:
            print("✗ Funktion gibt None zurück!")
            
    except Exception as e:
        print(f"✗ Fehler: {e}")


if __name__ == "__main__":
    # Führe Debug aus
    debug_consolidation()
    
    # Prüfe auch die Funktion selbst
    check_consolidator_function()
    
    print("\n" + "=" * 60)
    print("Debug abgeschlossen!")
    print("=" * 60)