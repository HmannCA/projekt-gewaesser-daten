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

    def insert_daily_aggregations(self, station_id: str, daily_results_df):
        print("\n=== PYTHON SCHREIBT IN daily_aggregations ===")
        print(f"Station: {station_id}")
        print(f"Anzahl Zeilen: {len(daily_results_df)}")
        if not daily_results_df.empty:
            print(f"Erster Index: {daily_results_df.index[0]}")
        print("============================================\n")
        if not self.conn or daily_results_df.empty:
            return
        
        data_tuples = []
        
        for date_idx, row in daily_results_df.iterrows():
            # Konvertiere zu lokalem Datum (wie bei messwerte)
            # datum = pd.to_datetime(date_idx).date()
            datum = pd.to_datetime(date_idx).strftime('%Y-%m-%d')

                    
            # DEBUG: Zeige was wir senden
            if date_idx == daily_results_df.index[0]:  # Nur beim ersten
                print(f"date_idx: {date_idx}")
                print(f"pd.to_datetime(date_idx): {pd.to_datetime(date_idx)}")
                print(f"datum (was wir senden): {datum}")
                print(f"Typ von datum: {type(datum)}")
            
            # Extrahiere Parameter aus den Spaltennamen
            for col in daily_results_df.columns:
                if '_Mittelwert' in col:
                    param = col.replace('_Mittelwert', '')
                    
                    # Sammle alle Werte für diesen Parameter
                    mittelwert = row.get(f'{param}_Mittelwert')
                    min_wert = row.get(f'{param}_Min')
                    max_wert = row.get(f'{param}_Max')
                    std_abw = row.get(f'{param}_StdAbw')
                    median = row.get(f'{param}_Median')
                    anteil_gut = row.get(f'{param}_Anteil_Guter_Werte_Prozent', 100)
                    flag = row.get(f'{param}_Aggregat_QARTOD_Flag', 1)
                    gruende = row.get(f'{param}_Aggregat_Gruende', '')
                    
                    if mittelwert is not None:
                        data_tuples.append((
                            station_id, datum, param,
                            mittelwert, min_wert, max_wert,
                            std_abw, median,
                            24, int(anteil_gut * 24 / 100),  # hourly_count, good_values_count
                            anteil_gut, flag, gruende
                        ))

                        # DEBUG: Zeige ersten Datensatz
                        if len(data_tuples) == 1:
                            print(f"\n=== ERSTER DATENSATZ ===")
                            print(f"Position 0 (station_id): {data_tuples[0][0]}")
                            print(f"Position 1 (DATUM): {data_tuples[0][1]}")
                            print(f"Position 2 (parameter): {data_tuples[0][2]}")
                            print(f"Typ des Datums: {type(data_tuples[0][1])}")
                            print("=====================\n")
        
        if data_tuples:
            sql = """
                INSERT INTO daily_aggregations 
                (station_id, date, parameter, mean_value, min_value, max_value, 
                std_dev, median_value, hourly_count, good_values_count, 
                good_values_percentage, aggregated_flag, aggregated_reasons)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (station_id, date, parameter) DO UPDATE SET
                    mean_value = EXCLUDED.mean_value,
                    min_value = EXCLUDED.min_value,
                    max_value = EXCLUDED.max_value,
                    std_dev = EXCLUDED.std_dev,
                    median_value = EXCLUDED.median_value,
                    good_values_percentage = EXCLUDED.good_values_percentage,
                    aggregated_flag = EXCLUDED.aggregated_flag,
                    aggregated_reasons = EXCLUDED.aggregated_reasons
            """
            
            try:
                # DEBUG VOR DEM INSERT
                print(f"\n=== VOR DEM INSERT ===")
                print(f"Sende {len(data_tuples)} Datensätze")
                print(f"Erster Datensatz komplett: {data_tuples[0]}")
                print(f"SQL: {sql}")
                print("====================\n")
                self.cur.executemany(sql, data_tuples)
                self.conn.commit()
                print(f"{len(data_tuples)} Tagesaggregationen direkt in daily_aggregations eingefügt.")
            except Exception as e:
                print(f"Fehler beim Einfügen in daily_aggregations: {e}")
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