import pandas as pd
import json
import glob
import os

def check_raw_vs_output():
    """Vergleicht Rohdaten mit Ausgabewerten"""
    
    # Definiere mögliche Speicherorte (NICHT im input-Ordner!)
    possible_locations = [
        'wamo00019_24313817_Zusammenfassung_20250611.csv',  # Hauptverzeichnis
        'temp/wamo00019_24313817_Zusammenfassung_20250611.csv',  # temp-Ordner
        '../wamo00019_24313817_Zusammenfassung_20250611.csv',  # Eine Ebene höher
    ]
    
    csv_file = None
    for location in possible_locations:
        if os.path.exists(location):
            csv_file = location
            break
    
    if csv_file:
        print(f"Zusammenfassungs-CSV gefunden: {csv_file}")
        
        # Analysiere die Zusammenfassungsdatei
        raw_df = pd.read_csv(csv_file, parse_dates=['Timestamp'], index_col='Timestamp')
        
        print("\n=== ROHDATEN ANALYSE (aus Zusammenfassung) ===")
        print(f"Zeitraum: {raw_df.index.min()} bis {raw_df.index.max()}")
        print(f"Anzahl Zeilen: {len(raw_df)}")
        
        # Prüfe Lufttemperatur
        if 'Lufttemperatur' in raw_df.columns:
            print(f"\nLufttemperatur ECHTE Rohdaten:")
            print(f"  Min: {raw_df['Lufttemperatur'].min():.1f}°C")
            print(f"  Max: {raw_df['Lufttemperatur'].max():.1f}°C")
            print(f"  Mittel: {raw_df['Lufttemperatur'].mean():.1f}°C")
            print(f"  Std.Abw.: {raw_df['Lufttemperatur'].std():.2f}")
            print(f"\n  Alle 24 Werte:")
            for i, (time, temp) in enumerate(raw_df['Lufttemperatur'].items()):
                print(f"    {time.strftime('%H:%M')}: {temp:.1f}°C")
        
        # Prüfe andere wichtige Parameter
        print("\n=== WEITERE PARAMETER (Rohdaten) ===")
        for param in ['Wassertemp. (0.5m)', 'pH', 'Nitrat', 'Gelöster Sauerstoff']:
            if param in raw_df.columns:
                print(f"\n{param}:")
                print(f"  Min: {raw_df[param].min():.2f}")
                print(f"  Max: {raw_df[param].max():.2f}")
                print(f"  Mittel: {raw_df[param].mean():.2f}")
    else:
        print("Zusammenfassungs-CSV nicht gefunden.")
        print("Bitte legen Sie die Datei ins Hauptverzeichnis (NICHT in input/)!")
    
    # Analysiere trotzdem die Einzel-CSVs zum Vergleich
    print("\n" + "="*60)
    analyze_hourly_files_detailed()

def analyze_hourly_files_detailed():
    """Detaillierte Analyse der stündlichen Dateien"""
    print("\n=== ANALYSE DER EINZELNEN STUNDEN-DATEIEN ===")
    
    from metadata_mapper import load_metadata, create_column_mapping, map_columns_to_names
    
    # Finde Dateien für 11. Juni
    files = sorted(glob.glob("input/wamo00019*_162_*.csv") + 
                   glob.glob("input/wamo00019*_163_*.csv"))  # Tag 162-163 = 11. Juni
    
    if not files:
        # Versuche allgemeiner
        files = sorted(glob.glob("input/wamo00019*.csv"))[:24]  # Erste 24 Dateien
    
    print(f"Gefunden: {len(files)} Dateien")
    
    if not files:
        return
    
    # Lade Metadaten
    metadata_files = glob.glob("input/wamo*metadata*.json")
    if not metadata_files:
        return
        
    metadata = load_metadata(metadata_files[0])
    column_mapping, _ = create_column_mapping(metadata)
    
    # Sammle Lufttemperatur-Werte
    temp_values = []
    timestamps = []
    
    for file in files[:24]:  # Max 24 Stunden
        try:
            df = pd.read_csv(file, sep=',', header=None, index_col=0)
            
            # Entferne Header
            if df.index.dtype == 'object' and 'Timestamp' in str(df.index[0]):
                df = df.iloc[1:]
            
            # Konvertiere
            df.index = pd.to_datetime(df.index)
            df = df.apply(pd.to_numeric, errors='coerce')
            df_mapped = map_columns_to_names(df, column_mapping)
            
            if 'Lufttemperatur' in df_mapped.columns and len(df_mapped) > 0:
                temp = df_mapped['Lufttemperatur'].iloc[0]
                time = df_mapped.index[0]
                temp_values.append(temp)
                timestamps.append(time)
        except:
            continue
    
    if temp_values:
        print(f"\nLufttemperatur aus {len(temp_values)} Einzel-Dateien:")
        print(f"  Min: {min(temp_values):.1f}°C")
        print(f"  Max: {max(temp_values):.1f}°C")
        print(f"  Mittel: {sum(temp_values)/len(temp_values):.1f}°C")
        
        print("\n  Vergleich mit Pipeline-Output:")
        print("  Pipeline sagt: Min=11.7, Max=12.0, Mittel=11.9")
        print(f"  Differenz: {sum(temp_values)/len(temp_values) - 11.9:.1f}°C")
        
        # Zeige die tatsächlichen Werte
        print("\n  Erste 10 Einzel-Werte:")
        for i, (time, temp) in enumerate(zip(timestamps[:10], temp_values[:10])):
            print(f"    {time}: {temp:.1f}°C")

if __name__ == "__main__":
    check_raw_vs_output()