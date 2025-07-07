# backend/daten_pipeline/db_config_loader.py

import os
import psycopg2
import psycopg2.extras # Wichtig für Dictionary-Cursor
import json
from dotenv import load_dotenv

class DbConfigLoader:
    """
    Lädt die gesamte Pipeline-Konfiguration aus der normalisierten Datenbank.
    Diese Klasse wird einmal zu Beginn eines Pipeline-Laufs initialisiert
    und hält die Konfiguration für den gesamten Lauf im Speicher.
    """
    def __init__(self):
        print("XXXXX NEUE VERSION WIRD GELADEN XXXXX")
        print("XXXXX NEUE VERSION WIRD GELADEN XXXXX")
        print("XXXXX NEUE VERSION WIRD GELADEN XXXXX")
        """Initialisiert den Loader und lädt sofort die Konfiguration."""
        # TEMPORÄRER FIX: DATABASE_URL direkt setzen
        self.db_url = "postgresql://postgres:vaqRCrh9ry1PHd9@localhost:5433/postgres"
        print(f"[DEBUG] Verwende fest gesetzte DATABASE_URL: {self.db_url}")
        
        if not self.db_url:
            raise ValueError("DATABASE_URL wurde nicht in den Umgebungsvariablen gefunden!")
        
        self.config = self._load_configuration()
    
    
    def _get_db_connection(self):
        """Stellt eine neue Datenbankverbindung her."""
        return psycopg2.connect(self.db_url)

    def _load_configuration(self):
        """

        Hauptmethode: Führt alle Lade-Schritte aus und baut das finale
        Konfigurationsobjekt zusammen.
        """
        print("[ConfigLoader] Starte das Laden der Konfiguration aus der Datenbank...")
        config_data = {}
        with self._get_db_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                config_data['parameters'] = self._load_parameters(cur)
                config_data['stations'] = self._load_stations(cur)
                config_data['rules'] = self._load_rules(cur)
        print("[ConfigLoader] Konfiguration erfolgreich geladen.")
        return config_data

    def _load_parameters(self, cur):
        """Lädt alle Messparameter."""
        cur.execute("SELECT * FROM parameters;")
        parameters = {row['parameter_name']: dict(row) for row in cur.fetchall()}
        print(f"  - {len(parameters)} Parameter geladen.")
        return parameters
    
from datetime import datetime

def _load_validation_parameters(self, cur):
    """Lädt die aktuellen Validierungsparameter aus der Datenbank."""
    cur.execute("""
        SELECT parameter_name, gross_range_min, gross_range_max,
               climatology_min, climatology_max, climatology_thresholds,
               use_seasonal_values
        FROM validation_parameters
        WHERE is_active = true
    """)
    
    validation_rules = {}
    spike_thresholds = {}
    seasonal_rules = {}  # NEU: Speichert saisonale Regeln
    
    for row in cur.fetchall():
        param_name = row['parameter_name']
        
        # Standard-Validierungsregeln
        validation_rules[param_name] = {
            'min': row['climatology_min'],
            'max': row['climatology_max']
        }
        
        # Saisonale Regeln wenn vorhanden
        if row['use_seasonal_values'] and row['climatology_thresholds']:
            seasonal_rules[param_name] = row['climatology_thresholds']
        
        # Spike-Detection
        if row['climatology_min'] is not None and row['climatology_max'] is not None:
            range_size = row['climatology_max'] - row['climatology_min']
            spike_thresholds[param_name] = range_size * 0.2
    
    print(f"  - {len(validation_rules)} Validierungsparameter geladen.")
    print(f"  - {len(seasonal_rules)} Parameter mit saisonalen Werten.")
    
    return validation_rules, spike_thresholds, seasonal_rules

def get_seasonal_limits(self, param_name, date):
    """Gibt die saisonalen Grenzwerte für einen Parameter zurück."""
    if param_name not in self.seasonal_rules:
        return None
    
    month = date.month
    season = self._get_season(month)
    
    seasonal_data = self.seasonal_rules[param_name]
    if season in seasonal_data:
        return seasonal_data[season]
    
    return None

def _get_season(self, month):
    """Bestimmt die Jahreszeit basierend auf dem Monat."""
    if month in [12, 1, 2]:
        return 'winter'
    elif month in [3, 4, 5]:
        return 'spring'
    elif month in [6, 7, 8]:
        return 'summer'
    elif month in [9, 10, 11]:
        return 'autumn'

    def _load_stations(self, cur):
        """
        Lädt alle Stationsdaten und führt sie aus den verschiedenen Tabellen
        zu einem vollständigen Objekt pro Station zusammen.
        """
        # Diese komplexe Abfrage verbindet alle Stationstabellen miteinander (JOIN)
        sql = """
            SELECT
                s.station_id, s.station_code, s.station_name, s.gemeinde, s.see_typ, s.max_tiefe_meter,
                sc.latitude, sc.longitude,
                sca.agrar_anteil_prozent, sca.wald_anteil_prozent, sca.siedlung_anteil_prozent, sca.sonstiger_anteil_prozent,
                sds.gesamt_status, sds.letzte_aktualisierung, sds.bearbeiter, sds.details_json
            FROM stations s
            LEFT JOIN station_coordinates sc ON s.station_id = sc.station_id
            LEFT JOIN station_catchment_areas sca ON s.station_id = sca.station_id
            LEFT JOIN station_data_status sds ON s.station_id = sds.station_id
            ORDER BY s.station_code;
        """
        cur.execute(sql)
        
        stations = {}
        for row in cur.fetchall():
            station_code = row['station_code']
            stations[station_code] = {
                'station_id': row['station_id'],
                'station_code': row['station_code'],
                'station_name': row['station_name'],
                'gemeinde': row['gemeinde'],
                'see_typ': row['see_typ'],
                'max_tiefe_meter': float(row['max_tiefe_meter']) if row['max_tiefe_meter'] is not None else None,
                'koordinaten': {
                    'latitude': float(row['latitude']) if row['latitude'] is not None else None,
                    'longitude': float(row['longitude']) if row['longitude'] is not None else None,
                },
                'einzugsgebiet': {
                    'agrar_anteil_prozent': row['agrar_anteil_prozent'],
                    'wald_anteil_prozent': row['wald_anteil_prozent'],
                    'siedlung_anteil_prozent': row['siedlung_anteil_prozent'],
                    'sonstiger_anteil_prozent': row['sonstiger_anteil_prozent'],
                },
                'daten_status': {
                    'gesamt_status': row['gesamt_status'],
                    'letzte_aktualisierung': str(row['letzte_aktualisierung']) if row['letzte_aktualisierung'] else None,
                    'bearbeiter': row['bearbeiter'],
                    'details': row['details_json'],
                }
            }
        
        print(f"  - {len(stations)} Stationen mit allen zugehörigen Daten geladen.")
        return stations

    def _load_rules(self, cur):
        """Lädt alle aktiven Konfigurationsregeln."""
        # JOIN mit stations und parameters, um die Namen statt nur die IDs zu bekommen
        sql = """
            SELECT
                r.rule_id,
                s.station_code,
                p.parameter_name,
                r.rule_type,
                r.config_json,
                r.change_comment
            FROM config_rules r
            LEFT JOIN stations s ON r.station_id = s.station_id
            LEFT JOIN parameters p ON r.parameter_id = p.parameter_id
            WHERE r.is_active = true;
        """
        cur.execute(sql)
        
        rules = cur.fetchall()
        print(f"  - {len(rules)} aktive Konfigurationsregeln geladen.")
        # Wir geben eine Liste von Dictionaries zurück, das ist einfacher zu verarbeiten.
        return [dict(row) for row in rules]

    def get_station(self, station_code):
        """Gibt die vollständige Konfiguration für eine einzelne Station zurück."""
        return self.config['stations'].get(station_code)

    def get_all_rules(self):
        """Gibt alle aktiven Regeln zurück."""
        return self.config['rules']
        
    def get_rules_for_station(self, station_code=None):
        """
        Gibt eine gefilterte Liste von Regeln zurück:
        1. Alle globalen Regeln (station_code is None)
        2. Alle spezifischen Regeln für die angegebene Station.
        """
        
        # Globale Regeln
        applicable_rules = [r for r in self.config['rules'] if r['station_code'] is None]
        
        # Stations-spezifische Regeln
        if station_code:
            applicable_rules.extend([r for r in self.config['rules'] if r['station_code'] == station_code])
            
        return applicable_rules

# Beispiel für die Verwendung (kann zum Testen ausgeführt werden)
if __name__ == '__main__':
    print("Führe Testlauf für DbConfigLoader aus...")
    
    # Lokaler Test benötigt eine .env-Datei mit der DATABASE_URL
    # oder die Variable muss im Terminal gesetzt sein.
    
    try:
        config_loader = DbConfigLoader()
        
        print("\n--- Geladene Konfiguration (Auszug) ---")
        
        # Zeige eine Station
        first_station_code = list(config_loader.config['stations'].keys())[0]
        print(f"\nDaten für Station '{first_station_code}':")
        print(json.dumps(config_loader.get_station(first_station_code), indent=2, ensure_ascii=False))
        
        # Zeige einige Regeln
        print("\nRegeln für diese Station (inkl. globaler Regeln):")
        rules_for_station = config_loader.get_rules_for_station(first_station_code)
        print(json.dumps(rules_for_station[:5], indent=2, ensure_ascii=False)) # Zeige die ersten 5 Regeln
        
    except ValueError as e:
        print(f"FEHLER: {e}")
    except Exception as e:
        print(f"Ein unerwarteter Fehler ist aufgetreten: {e}")

def load_config_from_db():
    """
    Wrapper-Funktion für andere Module, die eine einfache Funktion erwarten.
    Gibt ein vereinfachtes Konfigurationsobjekt zurück.
    """
    try:
        loader = DbConfigLoader()
        
        # Konvertiere das Format für Rückwärtskompatibilität
        simplified_config = {
            'stations': loader.config['stations'],
            'validation_rules': {},
            'spike_thresholds': {},
            'alert_thresholds': {}
        }
        
        # Konvertiere Regeln in das erwartete Format
        for rule in loader.config['rules']:
            if rule['rule_type'] == 'validation_range':
                param_name = rule['parameter_name']
                if param_name:
                    simplified_config['validation_rules'][param_name] = rule['config_json']
            elif rule['rule_type'] == 'spike_detection':
                param_name = rule['parameter_name']
                if param_name:
                    simplified_config['spike_thresholds'][param_name] = rule['config_json']
            elif rule['rule_type'] == 'alert_threshold':
                param_name = rule['parameter_name']
                if param_name:
                    simplified_config['alert_thresholds'][param_name] = rule['config_json']
        
        return simplified_config
        
    except Exception as e:
        print(f"Fehler beim Laden der Konfiguration: {e}")
        # Fallback: Leere Konfiguration
        return {
            'stations': {},
            'validation_rules': {},
            'spike_thresholds': {},
            'alert_thresholds': {}
        }
