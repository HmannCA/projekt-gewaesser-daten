import pandas as pd
import numpy as np
from difflib import SequenceMatcher
import json
import glob

class MetadataValidator:
    """Automatische Erkennung und Korrektur von Metadaten-Fehlern"""
    
    def __init__(self):
        # Definiere erwartete Wertebereiche für automatische Erkennung
        self.value_patterns = {
            'Lufttemperatur': {'min': -30, 'max': 50, 'unit': '°C'},
            'Wassertemp': {'min': -2, 'max': 35, 'unit': '°C'},
            'pH': {'min': 0, 'max': 14, 'unit': None},
            'Supply Voltage': {'min': 10, 'max': 15, 'unit': 'V'},
            'Supply Current': {'min': 0, 'max': 1000, 'unit': 'mA'},
            'Gelöster Sauerstoff': {'min': 0, 'max': 20, 'unit': 'mg/L'},
            'Nitrat': {'min': 0, 'max': 100, 'unit': 'mg/L'},
            'Leitfähigkeit': {'min': 0, 'max': 5000, 'unit': 'µS/cm'},
            'Trübung': {'min': 0, 'max': 1000, 'unit': 'NTU'},
            'Chl-a': {'min': 0, 'max': 500, 'unit': 'µg/L'},
            'DOC': {'min': 0, 'max': 100, 'unit': 'mg/L'},
            'TOC': {'min': 0, 'max': 100, 'unit': 'mg/L'},
            'Phycocyanin': {'min': 0, 'max': 1000, 'unit': 'µg/L'},
            'Redoxpotential': {'min': -500, 'max': 800, 'unit': 'mV'}
        }
    
    def validate_and_fix_mapping(self, csv_file, metadata, auto_fix=True):
        """
        Hauptmethode: Validiert und korrigiert Metadaten automatisch
        """
        print("\n=== AUTOMATISCHE METADATEN-VALIDIERUNG ===\n")
        
        # 1. Lade CSV mit Header
        df = pd.read_csv(csv_file, sep=',', nrows=10)  # Nur erste 10 Zeilen für Analyse
        
        # 2. Analysiere CSV-Struktur
        csv_structure = self._analyze_csv_structure(df)
        
        # 3. Analysiere Metadaten
        metadata_mapping = self._extract_metadata_mapping(metadata)
        
        # 4. Finde Diskrepanzen
        issues = self._find_mapping_issues(csv_structure, metadata_mapping)
        
        # 5. Generiere automatische Korrekturen
        if auto_fix and issues:
            corrections = self._generate_corrections(csv_structure, metadata_mapping, df)
            return corrections
        
        return issues
    
    def _analyze_csv_structure(self, df):
        """Analysiert die tatsächliche CSV-Struktur"""
        structure = {}
        
        for i, col in enumerate(df.columns):
            if not col.startswith('Flags'):
                # Analysiere Werte um Parameter-Typ zu erkennen
                values = pd.to_numeric(df[col], errors='coerce')
                value_range = {
                    'min': values.min(),
                    'max': values.max(),
                    'mean': values.mean(),
                    'std': values.std()
                }
                
                # Rate den Parameter-Typ basierend auf Werten
                guessed_type = self._guess_parameter_type(value_range, col)
                
                structure[i+1] = {  # 1-basiert
                    'name': col,
                    'value_range': value_range,
                    'guessed_type': guessed_type
                }
        
        return structure
    
    def _guess_parameter_type(self, value_range, col_name):
        """Rät den Parameter-Typ basierend auf Wertbereich und Namen"""
        col_lower = col_name.lower()
        
        # Erst Name-basierte Erkennung
        if 'lufttemp' in col_lower:
            return 'Lufttemperatur'
        elif 'wassertemp' in col_lower and '0.5' in col_name:
            return 'Wassertemp. (0.5m)'
        elif 'wassertemp' in col_lower and '1m' in col_name:
            return 'Wassertemp. (1m)'
        elif 'wassertemp' in col_lower and '2m' in col_name:
            return 'Wassertemp. (2m)'
        elif 'ph' == col_lower:
            return 'pH'
        elif 'voltage' in col_lower:
            return 'Supply Voltage'
        elif 'current' in col_lower:
            return 'Supply Current'
        
        # Dann Werte-basierte Erkennung
        min_val = value_range['min']
        max_val = value_range['max']
        mean_val = value_range['mean']
        
        # pH ist eindeutig (0-14)
        if 0 <= min_val and max_val <= 14 and mean_val > 6 and mean_val < 9:
            return 'pH'
        
        # Supply Voltage (typisch 11-13V)
        elif 10 <= min_val and max_val <= 15 and mean_val > 11:
            return 'Supply Voltage'
        
        # Temperaturen (unterscheide nach Bereich)
        elif -5 <= min_val and max_val <= 50:
            if max_val > 30:  # Lufttemperatur hat größere Schwankungen
                return 'Lufttemperatur'
            else:  # Wassertemperatur ist stabiler
                return 'Wassertemperatur'
        
        return 'Unbekannt'
    
    def _extract_metadata_mapping(self, metadata):
        """Extrahiert das Mapping aus den Metadaten"""
        mapping = {}
        
        # Datastream ID -> Name
        ds_to_name = {}
        for param in metadata.get('parameterMetadata', []):
            ds_id = param.get('datastream')
            name = param.get('nameCustom') or param.get('name')
            ds_to_name[ds_id] = name
        
        # Column -> Name
        for col_info in metadata.get('csvColumns', []):
            if col_info.get('dataType') == 'result':
                col = col_info.get('column')
                ds_id = col_info.get('datastream')
                if ds_id in ds_to_name:
                    mapping[col] = ds_to_name[ds_id]
        
        return mapping
    
    def _find_mapping_issues(self, csv_structure, metadata_mapping):
        """Findet Diskrepanzen zwischen CSV und Metadaten"""
        issues = []
        
        for csv_col, csv_info in csv_structure.items():
            csv_name = csv_info['name']
            guessed_type = csv_info['guessed_type']
            meta_name = metadata_mapping.get(csv_col, 'FEHLT')
            
            # Normalisiere für Vergleich
            similarity = self._string_similarity(csv_name, meta_name)
            
            if similarity < 0.9:  # Nicht ähnlich genug
                issues.append({
                    'column': csv_col,
                    'csv_name': csv_name,
                    'metadata_name': meta_name,
                    'guessed_type': guessed_type,
                    'similarity': similarity
                })
        
        return issues
    
    def _string_similarity(self, s1, s2):
        """Berechnet Ähnlichkeit zwischen zwei Strings (ignoriert Encoding)"""
        # Normalisiere
        s1 = s1.lower().replace('ä', 'a').replace('ö', 'o').replace('ü', 'u').replace('ß', 'ss')
        s2 = s2.lower().replace('ä', 'a').replace('ö', 'o').replace('ü', 'u').replace('ß', 'ss')
        s2 = s2.replace('Ã¤', 'a').replace('Ã¶', 'o').replace('Ã¼', 'u').replace('ÃŸ', 'ss')
        
        return SequenceMatcher(None, s1, s2).ratio()
    
    def _generate_corrections(self, csv_structure, metadata_mapping, df):
        """Generiert automatische Korrekturen basierend auf Analyse"""
        corrections = {}
        
        print("Generiere automatische Korrekturen...\n")
        
        # Für jede CSV-Spalte
        for csv_col, csv_info in csv_structure.items():
            csv_name = csv_info['name']
            guessed_type = csv_info['guessed_type']
            
            # Finde beste Übereinstimmung in Metadaten
            best_match = None
            best_score = 0
            
            for meta_col, meta_name in metadata_mapping.items():
                # Vergleiche sowohl Namen als auch geratenene Typen
                name_similarity = self._string_similarity(csv_name, meta_name)
                type_similarity = self._string_similarity(guessed_type, meta_name)
                
                score = max(name_similarity, type_similarity)
                
                if score > best_score:
                    best_score = score
                    best_match = (meta_col, meta_name)
            
            # Wenn keine gute Übereinstimmung, verwende CSV-Namen direkt
            if best_score < 0.5:
                corrections[csv_col] = csv_name
                print(f"Spalte {csv_col}: '{csv_name}' - Keine Metadaten-Entsprechung")
            else:
                corrections[csv_col] = csv_name
                if best_match[0] != csv_col:
                    print(f"Spalte {csv_col}: '{csv_name}' - Metadaten sagen Spalte {best_match[0]}")
        
        return corrections


def auto_validate_metadata(csv_file, metadata):
    """Wrapper-Funktion für die Integration"""
    validator = MetadataValidator()
    corrections = validator.validate_and_fix_mapping(csv_file, metadata)
    return corrections