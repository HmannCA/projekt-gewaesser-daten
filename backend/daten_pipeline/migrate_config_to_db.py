# backend/daten_pipeline/migrate_config_to_db.py (Version 3 - Normalisierte Struktur)

import os
import psycopg2
import json
from dotenv import load_dotenv

# Importiere die Konfigurationen direkt aus den Projektdateien
from config_file import STATIONS, VALIDATION_RULES, SPIKE_THRESHOLDS
from regional_config_mv import RegionalConfigMV

# Lade die DATABASE_URL sicher aus den Umgebungsvariablen
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def migrate_data():
    """
    Liest die Konfigurationswerte aus den Python-Dateien und migriert sie
    in die neue, normalisierte Datenbankstruktur.
    """
    conn = None
    try:
        # 1. Verbindung zur Datenbank herstellen
        print("Verbinde mit der PostgreSQL-Datenbank...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        print("Verbindung erfolgreich.")

        # 2. Parameter einfügen
        # =======================
        print("\nFüge Parameter ein...")
        param_names = set(VALIDATION_RULES.keys()) | set(SPIKE_THRESHOLDS.keys())
        param_units = {
            'Wassertemperatur': '°C', 'Lufttemperatur': '°C', 'pH': None,
            'Gelöster Sauerstoff': 'mg/L', 'Leitfähigkeit': 'µS/cm', 'Nitrat': 'mg/L',
            'Trübung': 'NTU', 'Chl-a': 'µg/L', 'DOC': 'mg/L', 'TOC': 'mg/L',
            'Phycocyanin Abs.': 'Abs/m', 'Phycocyanin Abs. (comp)': 'Abs/m', 'Redoxpotential': 'mV'
        }
        for name in sorted(list(param_names)):
            unit = param_units.get(name, 'unknown')
            cur.execute("INSERT INTO parameters (parameter_name, unit) VALUES (%s, %s) ON CONFLICT (parameter_name) DO NOTHING;", (name, unit))
        print(f"{len(param_names)} Parameter in Datenbank geschrieben.")

        # 3. Stationen und ihre Detaildaten einfügen
        # =========================================
        print("\nFüge Stationen und zugehörige Metadaten ein...")
        for station_code, station_data in STATIONS.items():
            # 3.1 Basisdaten in die 'stations'-Tabelle einfügen
            cur.execute(
                """
                INSERT INTO stations (station_code, station_name, gemeinde, see_typ, max_tiefe_meter)
                VALUES (%s, %s, %s, %s, %s) RETURNING station_id;
                """,
                (
                    station_code,
                    station_data.get('name'),
                    station_data.get('gemeinde'),
                    station_data.get('typ'),
                    station_data.get('max_tiefe')
                )
            )
            station_id = cur.fetchone()[0]
            print(f"  - Station '{station_data.get('name')}' mit ID {station_id} eingefügt.")

            # 3.2 Koordinaten einfügen
            coords = station_data.get('koordinaten')
            if coords:
                cur.execute(
                    "INSERT INTO station_coordinates (station_id, latitude, longitude) VALUES (%s, %s, %s);",
                    (station_id, coords.get('lat'), coords.get('lng'))
                )

            # 3.3 Einzugsgebietsdaten einfügen
            catchment = station_data.get('einzugsgebiet')
            if catchment:
                cur.execute(
                    """
                    INSERT INTO station_catchment_areas (station_id, agrar_anteil_prozent, wald_anteil_prozent, siedlung_anteil_prozent, sonstiger_anteil_prozent)
                    VALUES (%s, %s, %s, %s, %s);
                    """,
                    (
                        station_id,
                        catchment.get('agrar_anteil'),
                        catchment.get('wald_anteil'),
                        catchment.get('siedlung_anteil'),
                        catchment.get('sonstiger_anteil')
                    )
                )
            
            # 3.4 Datenstatus einfügen
            status = station_data.get('daten_status')
            if status:
                cur.execute(
                    """
                    INSERT INTO station_data_status (station_id, gesamt_status, letzte_aktualisierung, bearbeiter, details_json)
                    VALUES (%s, %s, %s, %s, %s);
                    """,
                    (
                        station_id,
                        status.get('gesamt'),
                        status.get('letzte_aktualisierung'),
                        status.get('bearbeiter'),
                        json.dumps(status.get('details', {}))
                    )
                )

        # 4. Konfigurationsregeln einfügen
        # ================================
        print("\nFüge Konfigurationsregeln ein...")
        # Lade Maps, um mit IDs statt Namen zu arbeiten
        cur.execute("SELECT station_code, station_id FROM stations;")
        station_map = {code: id for code, id in cur.fetchall()}
        cur.execute("SELECT parameter_name, parameter_id FROM parameters;")
        parameter_map = {name: id for name, id in cur.fetchall()}

        # Globale Regeln (RANGE, SPIKE)
        rules_to_insert = []
        for param, config in VALIDATION_RULES.items():
            rules_to_insert.append((None, parameter_map.get(param), 'RANGE', json.dumps(config), 'Globaler Grenzwert'))
        for param, threshold in SPIKE_THRESHOLDS.items():
            rules_to_insert.append((None, parameter_map.get(param), 'SPIKE', json.dumps({"threshold": threshold}), 'Globaler Spike-Grenzwert'))

        # Saisonale Regeln (global)
        regional_config = RegionalConfigMV()
        for event_name, event_config in regional_config.agricultural_calendar.items():
            rules_to_insert.append((None, None, 'SEASONAL_EVENT', json.dumps({"event_name": event_name, **event_config}), 'Saisonales Ereignis MV'))
        
        # See-spezifische Regeln
        for station_code, ruleset in regional_config.lake_specific_thresholds.items():
            station_id = station_map.get(station_code)
            if station_id:
                for param, config in ruleset.items():
                    if isinstance(config, dict):
                        param_id = parameter_map.get(param) # Parameter könnte neu sein, hier nicht behandelt
                        rules_to_insert.append((station_id, param_id, 'RANGE_REGIONAL', json.dumps(config), f'Spezifischer Grenzwert für {station_code}'))

        for rule in rules_to_insert:
            cur.execute(
                "INSERT INTO config_rules (station_id, parameter_id, rule_type, config_json, created_by, change_comment) VALUES (%s, %s, %s, %s, %s, %s);",
                (rule[0], rule[1], rule[2], rule[3], 'Initial Migration', rule[4])
            )
        print(f"{len(rules_to_insert)} Regeln eingefügt.")

        # Änderungen committen
        conn.commit()
        print("\nMigration erfolgreich abgeschlossen! Alle Daten wurden in die normalisierte Struktur geschrieben.")

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"\nFehler bei der Migration: {error}")
        if conn: conn.rollback()
    finally:
        if conn:
            cur.close()
            conn.close()
            print("Datenbankverbindung geschlossen.")

if __name__ == '__main__':
    if not DATABASE_URL:
         print("!!! FEHLER: Die 'DATABASE_URL' wurde nicht in den Umgebungsvariablen gefunden. !!!")
    else:
        migrate_data()