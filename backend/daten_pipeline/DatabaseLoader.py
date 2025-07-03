# VOLLSTÄNDIGE & FINALE VERSION der DatabaseLoader.py

import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv

# Lade Umgebungsvariablen aus der .env-Datei
load_dotenv()

class DatabaseLoader:
    """
    Diese Klasse ist für die Verbindung zur PostgreSQL-Datenbank und das Speichern
    der validierten und aufbereiteten Wasserqualitätsdaten verantwortlich.
    """

    def __init__(self):
        """Stellt die Verbindung zur Datenbank her"""
        try:
            # Verwende dieselbe URL wie db_config_loader
            self.db_url = "postgresql://postgres:vaqRCrh9ry1PHd9@localhost:5433/postgres"
            self.conn = psycopg2.connect(self.db_url)
            self.cur = self.conn.cursor()
            print("Datenbankverbindung erfolgreich hergestellt.")
        except Exception as e:
            print(f"Fehler bei der Herstellung der Datenbankverbindung: {e}")
            self.conn = None
            self.cur = None

    def insert_validated_data(self, data_tuples: list):
        """
        Fügt die validierten Daten aus einer Liste von Tupeln in die Zieltabelle ein.
        Verwendet executemany für hohe Effizienz.

        Args:
            data_tuples (list): Eine Liste von Tupeln, wobei jedes Tupel eine Zeile
                                in der Datenbank darstellt.
                                Reihenfolge: (zeitstempel, see, parameter, wert, qualitaets_flag)
        """
        if not self.conn:
            print("Keine Datenbankverbindung vorhanden. Daten können nicht eingefügt werden.")
            return
        if not data_tuples:
            print("Keine Daten zum Einfügen vorhanden.")
            return

        sql_insert_query = """
            INSERT INTO messwerte (zeitstempel, see, parameter, wert, qualitaets_flag)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (zeitstempel, see, parameter) DO UPDATE
            SET wert = EXCLUDED.wert, qualitaets_flag = EXCLUDED.qualitaets_flag;
        """
        
        try:
            self.cur.executemany(sql_insert_query, data_tuples)
            self.conn.commit()
            print(f"{len(data_tuples)} Datensätze erfolgreich in die Datenbank eingefügt/aktualisiert.")
        except Exception as e:
            print(f"Fehler beim Einfügen der Daten mit executemany: {e}")
            self.conn.rollback()

    def __del__(self):
        """
        Schließt die Datenbankverbindung, wenn das Objekt zerstört wird.
        """
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()
            print("Datenbankverbindung geschlossen.")