import os
import pandas as pd

def extract_and_convert_timestamps(input_directory):
    """
    Liest die zweite Zeile jeder CSV-Datei, extrahiert den Zeitstempel
    und konvertiert ihn in das native pandas-Timestamp-Format.
    """
    print("=" * 60)
    print("Starte Extraktion und Konvertierung der Zeitstempel...")
    print("=" * 60)

    csv_files = [f for f in os.listdir(input_directory) if f.endswith('.csv')]

    if not csv_files:
        print("Keine CSV-Dateien im Input-Ordner gefunden.")
        return

    for filename in csv_files:
        full_path = os.path.join(input_directory, filename)
        try:
            with open(full_path, mode='r', encoding='utf-8') as infile:
                # Lese die ersten beiden Zeilen
                next(infile)  # Überspringe erste Zeile
                second_line_full = next(infile).strip() # Lese zweite Zeile und entferne Whitespace

                if second_line_full:
                    # Spalte den String beim ERSTEN Komma und nimm den Teil davor
                    timestamp_str = second_line_full.split(',', 1)[0]
                    
                    # Konvertiere den extrahierten String in ein pandas Timestamp-Objekt
                    # Pandas erkennt dieses Format automatisch, wenn es sauber ist.
                    pd_timestamp = pd.to_datetime(timestamp_str)
                    
                    print(pd_timestamp)
                else:
                    print(f"Datei: {filename} -> ZWEITE ZEILE IST LEER")

        except StopIteration:
            print(f"Datei: {filename} -> FEHLER: Datei hat weniger als zwei Zeilen.")
        except Exception as e:
            print(f"Datei: {filename} -> FEHLER beim Verarbeiten: {e}")

    print("=" * 60)
    print("Konvertierung abgeschlossen.")
    print("=" * 60)


if __name__ == '__main__':
    # Definiere den Pfad zu deinem Input-Ordner
    input_dir = r"F:\Projekte_SH\WAMO-Daten\daten_pipeline\input"
    extract_and_convert_timestamps(input_dir)