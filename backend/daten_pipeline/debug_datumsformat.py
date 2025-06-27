import os
import csv

def inspect_timestamps(input_directory):
    """
    Geht durch alle CSV-Dateien in einem Ordner, liest die zweite Zeile
    und gibt den Inhalt der ersten Spalte (den Zeitstempel) aus.
    """
    print("=" * 60)
    print("Starte die Untersuchung der Zeitstempel...")
    print("=" * 60)

    # Stelle sicher, dass der Pfad existiert
    if not os.path.isdir(input_directory):
        print(f"Fehler: Das Verzeichnis '{input_directory}' wurde nicht gefunden.")
        return

    # Hole alle Dateinamen, die auf .csv enden
    csv_files = [f for f in os.listdir(input_directory) if f.endswith('.csv')]

    if not csv_files:
        print("Keine CSV-Dateien im Input-Ordner gefunden.")
        return

    # Gehe jede CSV-Datei durch
    for filename in csv_files:
        full_path = os.path.join(input_directory, filename)
        try:
            with open(full_path, mode='r', encoding='utf-8') as infile:
                # Nutze den CSV-Reader, der mit dem Semikolon als Trennzeichen umgehen kann
                reader = csv.reader(infile, delimiter=';')
                
                # Versuche, die erste Zeile zu überspringen (könnte Header sein)
                next(reader)
                
                # Versuche, die zweite Zeile zu lesen
                second_line = next(reader)
                
                # Gib den ersten Eintrag der zweiten Zeile aus
                if second_line:
                    timestamp = second_line[0]
                    print(f"Datei: {filename:<65} | Zeitstempel: {timestamp}")
                else:
                    print(f"Datei: {filename:<65} | ZWEITE ZEILE IST LEER")

        except StopIteration:
            # Dieser Fehler tritt auf, wenn die Datei weniger als zwei Zeilen hat
            print(f"Datei: {filename:<65} | FEHLER: Datei hat weniger als zwei Zeilen.")
        except Exception as e:
            # Fange alle anderen möglichen Fehler ab
            print(f"Datei: {filename:<65} | FEHLER beim Lesen: {e}")

    print("=" * 60)
    print("Untersuchung abgeschlossen.")
    print("=" * 60)


if __name__ == '__main__':
    # Definiere den Pfad zu deinem Input-Ordner
    input_dir = r"F:\Projekte_SH\WAMO-Daten\daten_pipeline\input"
    inspect_timestamps(input_dir)