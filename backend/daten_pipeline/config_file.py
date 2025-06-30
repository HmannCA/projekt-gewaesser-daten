"""
Zentrale Konfigurationsdatei für das WAMO Validierungssystem
Landkreis Vorpommern-Greifswald
"""

import os
from datetime import datetime

# ========================================
# ALLGEMEINE EINSTELLUNGEN
# ========================================

# Projektname und Version
PROJECT_NAME = "WAMO Gewässermonitoring"
VERSION = "1.0.0"
ORGANIZATION = "Landkreis Vorpommern-Greifswald - Stabsstelle Digitalisierung und IT"

# Pfade
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(BASE_DIR, "input")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
LOGS_DIR = os.path.join(BASE_DIR, "logs")
REPORTS_DIR = os.path.join(OUTPUT_DIR, "reports")

# Erstelle Verzeichnisse falls nicht vorhanden
for directory in [INPUT_DIR, OUTPUT_DIR, LOGS_DIR, REPORTS_DIR]:
    os.makedirs(directory, exist_ok=True)

# ========================================
# VALIDIERUNGSMODULE
# ========================================

# Aktivierung/Deaktivierung einzelner Module
VALIDATION_MODULES = {
    'basic': True,               # Basis-Validierungen (Range, Stuck, Spike)
    'multivariate': True,        # Multivariate Anomalieerkennung
    'correlation': True,         # Erweiterte Korrelationsanalyse
    'agricultural': True,        # Landwirtschaftliche Einträge
    'regional': True            # Regionale Anpassungen MV
}

# ========================================
# STATIONEN
# ========================================

# Mess-Stationen mit Metadaten
STATIONS = {
    'wamo00010': {
        'name': 'Wolgastsee',
        'gemeinde': 'Korswandt',
        'daten_status': {
            'gesamt': 'GESCHÄTZT',
            'letzte_aktualisierung': '2024-01-01',
            'bearbeiter': 'System-Schätzung',
            'details': {
                'morphometrie': 'GESCHÄTZT - basierend auf Seekarten',
                'koordinaten': 'VERIFIZIERT',
                'einzugsgebiet': 'GESCHÄTZT - typische Werte Usedom',
                'grenzwerte': 'STANDARD - EU-Badegewässerrichtlinie',
                'nutzung': 'BEKANNT - öffentliche Informationen'
            }
        },
        'typ': 'mesotropher_flachsee',
        'max_tiefe': 14.0,
        'koordinaten': {'lat': 53.9169, 'lng': 14.1767},
        'einzugsgebiet': {
            'agrar_anteil': 5,
            'wald_anteil': 75,
            'siedlung_anteil': 20
        }
    },
    'wamo00011': {
        'name': 'Tollensesee',
        'gemeinde': 'Neubrandenburg',
        'typ': 'tiefensee',
        'max_tiefe': 33.0,
        'koordinaten': {'lat': 53.6167, 'lng': 13.2667},
        'einzugsgebiet': {
            'agrar_anteil': 65,
            'wald_anteil': 25,
            'siedlung_anteil': 10
        }
    },
    'wamo00012': {
        'name': 'Galenbecker See',
        'gemeinde': 'Galenbeck',
        'typ': 'flachsee',
        'max_tiefe': 2.5,
        'koordinaten': {'lat': 53.6833, 'lng': 13.7667},
        'einzugsgebiet': {
            'agrar_anteil': 70,
            'wald_anteil': 20,
            'siedlung_anteil': 10
        }
    },
    'wamo00019': {
        'name': 'Löcknitzer See',
        'gemeinde': 'Löcknitz',
        'daten_status': {
            'gesamt': 'VERIFIZIERT',
            'letzte_aktualisierung': '2025-06-30',
            'bearbeiter': 'Gemini/AI-Recherche',
            'details': {
                'morphometrie': 'VERIFIZIERT - Daten des Landesamtes (LUNG M-V)',
                'koordinaten': 'VERIFIZIERT - Geodatenportal M-V',
                'einzugsgebiet': 'VERIFIZIERT - Daten des Landesamtes (LUNG M-V)',
                'grenzwerte': 'STANDARD - EU-Badegewässerrichtlinie',
                'grenzlage': 'VERIFIZIERT - Kartenmaterial'
            }
        },
        'typ': 'eutropher_flachsee',
        'max_tiefe': 3.4,
        'koordinaten': {'lat': 53.445698, 'lng': 14.226044},
        'einzugsgebiet': {
            'agrar_anteil': 65,
            'wald_anteil': 15,
            'siedlung_anteil': 8,
            'sonstiger_anteil': 12
        }
    }
}


# ========================================
# GRENZWERTE UND SCHWELLENWERTE
# ========================================

# Basis-Validierungsregeln
VALIDATION_RULES = {
    'Phycocyanin Abs.': {'min': 0.0, 'max': 200.0},
    'Phycocyanin Abs. (comp)': {'min': 0.0, 'max': 200.0},
    'TOC': {'min': 1.0, 'max': 70.0},
    'Trübung': {'min': 0.0, 'max': 150.0},
    'Chl-a': {'min': 0.0, 'max': 250.0},
    'DOC': {'min': 1.0, 'max': 60.0},
    'Nitrat': {'min': 0.0, 'max': 50.0},
    'Gelöster Sauerstoff': {'min': 0.0, 'max': 20.0},
    'Leitfähigkeit': {'min': 100, 'max': 1500},
    'pH': {'min': 6.0, 'max': 10.0},
    'Redoxpotential': {'min': -300, 'max': 600},
    'Wassertemperatur': {'min': -0.5, 'max': 32.0},
    'Lufttemperatur': {'min': -25.0, 'max': 40.0}
}

# Spike-Detection Schwellenwerte
SPIKE_THRESHOLDS = {
    'Wassertemperatur': 2.0,    # °C pro Stunde
    'pH': 0.5,                   # pH-Einheiten pro Stunde
    'Trübung': 50.0,            # NTU pro Stunde
    'Gelöster Sauerstoff': 5.0, # mg/L pro Stunde
    'Leitfähigkeit': 100.0,     # µS/cm pro Stunde
    'Nitrat': 10.0              # mg/L pro Stunde
}

# Präzision für Rundung
PRECISION_RULES = {
    'Phycocyanin Abs.': 1,
    'TOC': 1,
    'Trübung': 1,
    'Chl-a': 1,
    'DOC': 1,
    'Nitrat': 1,
    'Gelöster Sauerstoff': 2,
    'Leitfähigkeit': 0,
    'pH': 2,
    'Redoxpotential': 0,
    'Wassertemperatur': 2,
    'Lufttemperatur': 1,
    'default': 2
}

# ========================================
# ALARME UND MELDUNGEN
# ========================================

# Kritische Schwellenwerte für Alarme
ALERT_THRESHOLDS = {
    'nitrat_kritisch': 35.0,      # mg/L - Sofortalarm
    'nitrat_warnung': 25.0,       # mg/L - Warnung
    'sauerstoff_kritisch': 4.0,   # mg/L - Fischsterben möglich
    'sauerstoff_warnung': 6.0,    # mg/L - Beobachten
    'chl_a_warnung': 40.0,        # µg/L - Algenblüte
    'chl_a_kritisch': 100.0,      # µg/L - Badeverbot prüfen
    'ph_min_kritisch': 6.0,       # pH - zu sauer
    'ph_max_kritisch': 9.5        # pH - zu basisch
}

# E-Mail Benachrichtigungen
EMAIL_CONFIG = {
    'enabled': True,
    'smtp_server': 'mail.kreis-vg.de',
    'smtp_port': 587,
    'sender': 'wamo@kreis-vg.de',
    'recipients': {
        'umweltamt': ['umweltamt@kreis-vg.de'],
        'gesundheitsamt': ['gesundheitsamt@kreis-vg.de'],
        'it_admin': ['admin@kreis-vg.de']
    }
}

# SMS-Alarme (für kritische Ereignisse)
SMS_CONFIG = {
    'enabled': False,  # Aktivieren wenn SMS-Gateway vorhanden
    'api_url': 'https://sms-gateway.kreis-vg.de/api/send',
    'emergency_numbers': [
        '+49 171 1234567',  # Bereitschaftsdienst Umweltamt
        '+49 172 2345678'   # Amtsleitung
    ]
}

# ========================================
# BEHÖRDLICHE INTEGRATION
# ========================================

# Zuständige Behörden
AUTHORITIES = {
    'untere_wasserbehoerde_vg': {
        'name': 'Untere Wasserbehörde LK Vorpommern-Greifswald',
        'telefon': '03834-8760-0',
        'email': 'wasserbehoerde@kreis-vg.de',
        'zustaendig_fuer': ['wasserrecht', 'einleitungen', 'badegewaesser']
    },
    'gesundheitsamt_vg': {
        'name': 'Gesundheitsamt LK VG',
        'telefon': '03834-8760-2301',
        'email': 'gesundheitsamt@kreis-vg.de',
        'zustaendig_fuer': ['badeverbote', 'gesundheitsgefahren']
    },
    'stalu_ms': {
        'name': 'StALU Mecklenburgstreelitz',
        'telefon': '0395-380-0',
        'email': 'poststelle@stalums.mv-regierung.de',
        'zustaendig_fuer': ['gewaesseraufsicht', 'landwirtschaft']
    }
}

# ========================================
# OPEN DATA KONFIGURATION
# ========================================

OPEN_DATA_CONFIG = {
    'enabled': True,
    'portal_url': 'https://www.opendata-mv.de',
    'dataset_id': 'badegewaesser-qualitaet-vg',
    'update_frequency': 'daily',
    'license': 'CC BY-NC 4.0',
    'formats': ['JSON', 'CSV', 'GeoJSON'],
    'exclude_fields': [  # Diese Felder nicht veröffentlichen
        'reason',
        'spike',
        'stuck',
        'multivariate'
    ]
}

# ========================================
# EXPORT EINSTELLUNGEN
# ========================================

EXPORT_FORMATS = {
    'json': {
        'enabled': True,
        'indent': 4,
        'ensure_ascii': False,
        'date_format': 'iso'
    },
    'csv': {
        'enabled': True,
        'separator': ';',
        'decimal': ',',
        'encoding': 'utf-8-sig'
    },
    'excel': {
        'enabled': False,  # Benötigt openpyxl
        'engine': 'openpyxl'
    },
    'pdf': {
        'enabled': False,  # Benötigt reportlab
        'template': 'default'
    }
}

# 3. CONSOLIDATION_RULES - Regeln für Tageskonsolidierung gemäß Gutachten
CONSOLIDATION_RULES = {
    'default': ['min', 'max', 'mean'],  # Basis für die meisten
    
    # Alle 5 Statistiken:
    'pH': ['min', 'max', 'mean', 'median', 'std'],
    'Gelöster Sauerstoff': ['min', 'max', 'mean', 'median', 'std'],
    
    # Mit Standardabweichung:
    'Phycocyanin Abs.': ['min', 'max', 'mean', 'std'],
    'Phycocyanin Abs. (comp)': ['min', 'max', 'mean', 'std'],
    'Trübung': ['min', 'max', 'mean', 'std'],
    'Chl-a': ['min', 'max', 'mean', 'std'],
    'Redoxpotential': ['min', 'max', 'mean', 'std'],
    
    # Nur Min, Max, Mean:
    'TOC': ['min', 'max', 'mean'],
    'DOC': ['min', 'max', 'mean'],
    'Nitrat': ['min', 'max', 'mean'],
    'Leitfähigkeit': ['min', 'max', 'mean'],
    'Wassertemp. (0.5m)': ['min', 'max', 'mean'],
    'Wassertemp. (1m)': ['min', 'max', 'mean'],
    'Wassertemp. (2m)': ['min', 'max', 'mean'],
    'Lufttemperatur': ['min', 'max', 'mean'],
    'Supply Current': ['min', 'max', 'mean'],
    'Supply Voltage': ['min', 'max', 'mean']
}

# ========================================
# LOGGING
# ========================================

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOGS_DIR, f'wamo_{datetime.now().strftime("%Y%m")}.log'),
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
            'formatter': 'standard',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'standard'
        }
    },
    'loggers': {
        '': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True
        }
    }
}

# ========================================
# DASHBOARD KONFIGURATION
# ========================================

DASHBOARD_CONFIG = {
    'refresh_interval': 15,  # Sekunden
    'map_center': [54.0865, 13.3923],  # Landkreis VG
    'map_zoom': 10,
    'chart_colors': {
        'primary': '#0066CC',
        'secondary': '#00A651',
        'danger': '#DC3545',
        'warning': '#FFA500',
        'success': '#28A745'
    }
}

# ========================================
# API KONFIGURATION
# ========================================

API_CONFIG = {
    'host': '0.0.0.0',
    'port': 8000,
    'cors_origins': ['*'],  # Für Produktion einschränken!
    'api_key_required': False,  # Für Produktion aktivieren
    'rate_limit': '100/hour'
}

# ========================================
# ZEITPLANUNG
# ========================================

SCHEDULE_CONFIG = {
    'data_validation': '*/15 * * * *',  # Alle 15 Minuten
    'report_generation': '0 6 * * *',    # Täglich um 6 Uhr
    'backup': '0 3 * * *',               # Täglich um 3 Uhr
    'cleanup_old_files': '0 2 * * 0'    # Sonntags um 2 Uhr
}

# ========================================
# ENTWICKLUNG/PRODUKTION
# ========================================

# Umgebung
ENVIRONMENT = os.getenv('WAMO_ENV', 'development')

if ENVIRONMENT == 'production':
    DEBUG = False
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:pass@localhost/wamo')
else:
    DEBUG = True
    DATABASE_URL = 'sqlite:///wamo_dev.db'

# ========================================
# HILFSFUNKTIONEN
# ========================================

def get_station_config(station_id: str) -> dict:
    """Gibt Konfiguration für eine spezifische Station zurück"""
    return STATIONS.get(station_id, {})

def get_alert_threshold(parameter: str, level: str = 'warnung') -> float:
    """Gibt Alarmschwellwert für einen Parameter zurück"""
    key = f"{parameter}_{level}"
    return ALERT_THRESHOLDS.get(key, None)

def is_module_active(module_name: str) -> bool:
    """Prüft ob ein Validierungsmodul aktiv ist"""
    return VALIDATION_MODULES.get(module_name, False)

# ========================================
# CUSTOM SETTINGS (Benutzerdefiniert)
# ========================================

# Hier können Sie eigene Einstellungen hinzufügen
CUSTOM_SETTINGS = {
    # Beispiel:
    # 'special_analysis': True,
    # 'custom_threshold': 42
}