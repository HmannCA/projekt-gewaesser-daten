"""
Diagnose-Skript für WAMO CSV-Dateien
Prüft die Struktur und Verteilung der Daten
"""

import pandas as pd
import os
import glob
from datetime import datetime
from collections import defaultdict

def analyze_csv_structure(input_dir: str):
    """Analysiert die Struktur aller CSV-Dateien"""
    
    print("=" * 70)
    print("CSV-STRUKTUR-ANALYSE")
    print("=" * 70)
    
    # Finde alle CSV-Dateien
    csv_files = glob.glob(os.path.join(input_dir, "wamo*.csv"))
    print(f"\nGefundene CSV-Dateien: {len(csv_files)}")
    
    if not csv_files:
        print("FEHLER: Keine CSV-Dateien gefunden!")
        return
    
    # Analysiere jede Datei
    file_info = []
    all_timestamps = []
    rows_per_file = []
    
    print("\nAnalysiere Dateien...")
    for i, csv_file in enumerate(csv_files):
        try:
            # Lade Datei
            df = pd.read_csv(csv_file, sep=',', header=None, index_col=0, nrows=10)
            
            # Anzahl Zeilen (ohne Header)
            full_df = pd.read_csv(csv_file, sep=',', header=None, index_col=0)
            if full_df.index.dtype == 'object' and 'Timestamp' in str(full_df.index[0]):
                n_rows = len(full_df) - 1  # Minus Header
            else:
                n_rows = len(full_df)
            
            rows_per_file.append(n_rows)
            
            # Zeitstempel extrahieren
            if n_rows > 0:
                # Erste Datenzeile (nicht Header)
                if df.index.dtype == 'object' and 'Timestamp' in str(df.index[0]):
                    timestamp_str = str(df.index[1]) if len(df) > 1 else "N/A"
                else:
                    timestamp_str = str(df.index[0])
                
                try:
                    timestamp = pd.to_datetime(timestamp_str)
                    all_timestamps.append(timestamp)
                except:
                    pass
            
            file_info.append({
                'file': os.path.basename(csv_file),
                'rows': n_rows,
                'timestamp': timestamp_str
            })
            
            # Fortschritt
            if (i + 1) % 50 == 0:
                print(f"  Verarbeitet: {i + 1}/{len(csv_files)} Dateien...")
                
        except Exception as e:
            print(f"  FEHLER bei {os.path.basename(csv_file)}: {e}")
    
    # Statistiken
    print("\n" + "-" * 70)
    print("ZUSAMMENFASSUNG:")
    print("-" * 70)
    
    print(f"\nZeilen pro Datei:")
    print(f"  Minimum: {min(rows_per_file) if rows_per_file else 0}")
    print(f"  Maximum: {max(rows_per_file) if rows_per_file else 0}")
    print(f"  Durchschnitt: {sum(rows_per_file)/len(rows_per_file) if rows_per_file else 0:.1f}")
    
    # Zeige Beispiele
    print(f"\nBeispiel-Dateien:")
    for info in file_info[:5]:
        print(f"  {info['file']}: {info['rows']} Zeilen, Zeit: {info['timestamp']}")
    
    # Zeitanalyse
    if all_timestamps:
        all_timestamps = sorted(all_timestamps)
        print(f"\nZeitbereich:")
        print(f"  Von: {all_timestamps[0]}")
        print(f"  Bis: {all_timestamps[-1]}")
        
        # Tage-Verteilung
        days_data = defaultdict(int)
        for ts in all_timestamps:
            if pd.notna(ts):
                days_data[ts.date()] += 1
        
        print(f"\nDaten-Verteilung pro Tag:")
        for day, count in sorted(days_data.items())[:10]:  # Erste 10 Tage
            print(f"  {day}: {count} Stunden")
        
        if len(days_data) > 10:
            print(f"  ... und {len(days_data) - 10} weitere Tage")
    
    # Empfehlung
    print("\n" + "=" * 70)
    print("EMPFEHLUNG:")
    print("=" * 70)
    
    if rows_per_file and max(rows_per_file) == 1:
        print("⚠️  Jede CSV-Datei enthält nur EINE Stunde Daten!")
        print("   Dies ist normal für WAMO-Systeme, die stündlich exportieren.")
        print("   Die Pipeline sollte alle Dateien korrekt zusammenführen.")
        print("\n   LÖSUNG: Die main_pipeline.py wurde bereits angepasst,")
        print("   um mit dieser Struktur umzugehen. Führen Sie sie erneut aus!")
    else:
        print("✓  CSV-Dateien enthalten mehrere Datensätze.")
    
    return file_info, days_data


def create_consolidated_csv(input_dir: str, output_file: str = "consolidated_data.csv"):
    """
    Erstellt eine konsolidierte CSV-Datei aus allen Einzel-CSVs
    (Optional, falls Sie lieber eine große Datei hätten)
    """
    print("\n" + "=" * 70)
    print("ERSTELLE KONSOLIDIERTE CSV-DATEI")
    print("=" * 70)
    
    csv_files = sorted(glob.glob(os.path.join(input_dir, "wamo*.csv")))
    
    if not csv_files:
        print("Keine CSV-Dateien gefunden!")
        return
    
    print(f"Konsolidiere {len(csv_files)} Dateien...")
    
    all_data = []
    for i, csv_file in enumerate(csv_files):
        try:
            df = pd.read_csv(csv_file, sep=',', header=None, index_col=0)
            
            # Entferne Header-Zeilen
            if df.index.dtype == 'object' and len(df) > 0:
                if 'Timestamp' in str(df.index[0]):
                    df = df.iloc[1:]  # Skip header
            
            all_data.append(df)
            
            if (i + 1) % 50 == 0:
                print(f"  Verarbeitet: {i + 1}/{len(csv_files)}")
                
        except Exception as e:
            print(f"  Fehler bei {os.path.basename(csv_file)}: {e}")
    
    if all_data:
        # Kombiniere alle Daten
        consolidated = pd.concat(all_data)
        consolidated.index = pd.to_datetime(consolidated.index, errors='coerce')
        consolidated = consolidated[consolidated.index.notna()]
        consolidated.sort_index(inplace=True)
        
        # Speichere
        output_path = os.path.join(input_dir, output_file)
        consolidated.to_csv(output_path, sep=',')
        
        print(f"\n✓ Konsolidierte Datei erstellt: {output_path}")
        print(f"  Größe: {consolidated.shape}")
        print(f"  Zeitraum: {consolidated.index.min()} bis {consolidated.index.max()}")
        
        return consolidated
    else:
        print("Keine Daten zum Konsolidieren!")
        return None


if __name__ == "__main__":
    # Pfade
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    INPUT_DIR = os.path.join(BASE_DIR, "input")
    
    # Analysiere CSV-Struktur
    file_info, days_data = analyze_csv_structure(INPUT_DIR)
    
    # Optional: Erstelle konsolidierte Datei
    print("\n" + "=" * 70)
    answer = input("Möchten Sie eine konsolidierte CSV-Datei erstellen? (j/n): ")
    if answer.lower() == 'j':
        create_consolidated_csv(INPUT_DIR)