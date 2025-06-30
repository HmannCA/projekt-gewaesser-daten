import pandas as pd
import glob
import json
import os

def debug_87_percent_issue():
    """Findet heraus warum alle Parameter 87.5% haben"""
    
    print("=== DEBUG 87.5% PROBLEM ===\n")
    
    # 1. Finde die richtigen CSV-Dateien
    print("1. SUCHE CSV-DATEIEN:")
    all_csv = sorted(glob.glob("input/wamo00019*.csv"))
    print(f"   Gefunden: {len(all_csv)} Dateien insgesamt")
    
    if all_csv:
        print(f"   Erste Datei: {os.path.basename(all_csv[0])}")
        print(f"   Letzte Datei: {os.path.basename(all_csv[-1])}")
        
        # Analysiere Dateinamen-Muster
        for i, f in enumerate(all_csv[:5]):
            print(f"   Beispiel {i+1}: {os.path.basename(f)}")
    
    # 2. Prüfe Zeitstempel
    print("\n2. PRÜFE ZEITSTEMPEL IN CSV:")
    if all_csv:
        # Lade erste Datei
        df = pd.read_csv(all_csv[0], sep=',', nrows=2)
        print(f"   Zeitstempel erste Datei: {df.iloc[0, 0] if len(df) > 0 else 'N/A'}")
        
        # Extrahiere Datum aus Zeitstempel
        try:
            ts = pd.to_datetime(df.iloc[0, 0])
            print(f"   Datum: {ts.date()}")
            
            # Finde alle Dateien vom gleichen Tag
            same_day_files = []
            for f in all_csv:
                try:
                    temp_df = pd.read_csv(f, sep=',', nrows=2)
                    temp_ts = pd.to_datetime(temp_df.iloc[0, 0])
                    if temp_ts.date() == ts.date():
                        same_day_files.append(f)
                except:
                    continue
            
            print(f"   Dateien vom {ts.date()}: {len(same_day_files)}")
            
        except Exception as e:
            print(f"   Fehler beim Parsen: {e}")
    
    # 3. Debug die Aggregation
    print("\n3. DEBUG AGGREGATION:")
    
    # Schaue in die Konsolidierungs-Logik
    from metadata_mapper import load_metadata, create_column_mapping, map_columns_to_names
    
    if all_csv:
        # Lade und verarbeite erste 8 Dateien
        test_files = all_csv[:8]  # Vermutung: nur 8 werden verarbeitet
        
        print(f"   Teste mit {len(test_files)} Dateien")
        
        # Simuliere was die Pipeline macht
        dfs = []
        for f in test_files:
            try:
                df = pd.read_csv(f, sep=',', header=None, index_col=0)
                if df.index.dtype == 'object' and 'Timestamp' in str(df.index[0]):
                    df = df.iloc[1:]
                dfs.append(df)
            except:
                continue
        
        if dfs:
            combined = pd.concat(dfs)
            print(f"   Kombinierte Daten: {len(combined)} Zeilen")
            
            # Das ist der Schlüssel: Wie viele unique Stunden?
            combined.index = pd.to_datetime(combined.index, errors='coerce')
            unique_hours = combined.index.hour.unique()
            print(f"   Unique Stunden: {sorted(unique_hours)}")
            print(f"   Anzahl unique Stunden: {len(unique_hours)}")
            
            if len(unique_hours) == 8:
                print("\n   💡 GEFUNDEN: Es werden nur 8 verschiedene Stunden verarbeitet!")
                print("      7 von 8 = 87.5%")
    
    # 4. Prüfe die erweiterte Analyse
    print("\n4. PRÜFE ERWEITERTE ANALYSE:")
    analysis_files = glob.glob("output/erweiterte_analyse_wamo00019_*.json")
    if analysis_files:
        with open(analysis_files[-1], 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Zeitraum
        zeitraum = data.get('zeitraum', {})
        print(f"   Zeitraum: {zeitraum.get('von')} bis {zeitraum.get('bis')}")
        
        # Wie ist die Struktur der basis_validierung?
        basis = data.get('basis_validierung', {})
        print(f"   Anzahl Einträge in basis_validierung: {len(basis)}")
        
        if len(basis) == 1:
            print("   ⚠️  Nur 1 aggregierter Tageswert statt stündliche Werte!")
            print("      Die Tageskonsolidierung fasst alles zu EINEM Wert zusammen.")

if __name__ == "__main__":
    debug_87_percent_issue()