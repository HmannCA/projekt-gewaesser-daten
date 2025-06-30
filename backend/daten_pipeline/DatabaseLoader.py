import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv

# Lade Umgebungsvariablen aus der .env-Datei (wichtig für die lokale Entwicklung)
load_dotenv()

class DatabaseLoader:
    """
    Diese Klasse ist für die Verbindung zur PostgreSQL-Datenbank und das Speichern
    der validierten und aufbereiteten Wasserqualitätsdaten verantwortlich.
    """

    def __init__(self):
        """
        Stellt die Verbindung zur Datenbank her, indem die Zugangsdaten aus den
        Umgebungsvariablen gelesen werden.
        """
        try:
            self.conn = psycopg2.connect(
                dbname=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                host=os.getenv("DB_HOST"),
                port=os.getenv("DB_PORT", "5432") # Standard-Postgres-Port
            )
            self.cur = self.conn.cursor()
            print("Datenbankverbindung erfolgreich hergestellt.")
        except Exception as e:
            print(f"Fehler bei der Herstellung der Datenbankverbindung: {e}")
            self.conn = None
            self.cur = None

    def insert_validated_data(self, data: pd.DataFrame):
        """
        Fügt die validierten Daten aus dem DataFrame in die Zieltabelle ein.

        Args:
            data (pd.DataFrame): Der DataFrame, der die aufbereiteten Zeitreihendaten
                                 und die Qualitäts-Flags enthält.
        """
        if not self.conn:
            print("Keine Datenbankverbindung vorhanden. Daten können nicht eingefügt werden.")
            return

        # Annahme: Eine Tabelle namens 'messwerte' existiert mit passenden Spalten
        # Beispiel: (timestamp, parameter, value, quality_flag, station_id)
        # HINWEIS: Dies muss an Ihre exakte Tabellenstruktur angepasst werden!

        try:
            for index, row in data.iterrows():
                # Beispielhafter INSERT-Befehl. Die Spaltennamen ('zeitstempel', 'parameter', 'wert' etc.)
                # und der Tabellenname ('messwerte') müssen exakt mit Ihrer Datenbank übereinstimmen.
                self.cur.execute(
                    """
                    INSERT INTO messwerte (zeitstempel, see, parameter, wert, qualitaets_flag)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (zeitstempel, see, parameter) DO UPDATE
                    SET wert = EXCLUDED.wert, qualitaets_flag = EXCLUDED.qualitaets_flag;
                    """,
                    (
                        index, # Der DataFrame-Index ist der Zeitstempel
                        row['see'],          # Annahme: Es gibt eine Spalte 'see'
                        row['parameter'],    # Annahme: Es gibt eine Spalte 'parameter'
                        row['wert'],         # Annahme: Es gibt eine Spalte 'wert'
                        row['qualitaets_flag'] # Annahme: Es gibt eine Spalte 'qualitaets_flag'
                    )
                )
            self.conn.commit()
            print(f"{len(data)} Datensätze erfolgreich in die Datenbank eingefügt/aktualisiert.")
        except Exception as e:
            print(f"Fehler beim Einfügen der Daten: {e}")
            self.conn.rollback() # Änderungen im Fehlerfall zurückrollen

    def __del__(self):
        """
        Schließt die Datenbankverbindung, wenn das Objekt zerstört wird.
        """
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()
            print("Datenbankverbindung geschlossen.")