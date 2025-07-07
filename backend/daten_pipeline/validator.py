import pandas as pd
import numpy as np

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
    NOT_EVALUATED = 2
    SUSPECT = 3
    BAD = 4
    MISSING = 9

class WaterQualityValidator:
    """
    Validiert Wasserqualitätsdaten und weist QARTOD-konforme Flags und Gründe zu.
    """
    def __init__(self):
        # Initialisierung ist nicht mehr notwendig, da Anomalie-Erkennung entfernt wurde.
        pass

    def combine_flags_and_reasons(self, df_flags, df_reasons):
        """
        Kombiniert mehrere Spalten mit Flags und Gründen zu einem finalen Aggregat.
        Findet den höchsten Flag und sammelt alle einzigartigen Gründe.
        Robust gegen fehlende oder String-Werte.
        """
        # Stelle sicher, dass df_flags nur numerische Werte enthält
        df_flags_numeric = pd.DataFrame(index=df_flags.index)
        
        for col in df_flags.columns:
            # Konvertiere zu numerisch
            df_flags_numeric[col] = pd.to_numeric(df_flags[col], errors='coerce')
            # WICHTIG: NaN-Werte NICHT füllen - sie werden ignoriert
        
        # Finde den maximalen (schlechtesten) Flag-Wert für jede Zeile
        # ABER: Ignoriere NaN-Werte

        if df_flags_numeric.empty:
            final_flags = pd.Series(QartodFlags.GOOD, index=df_flags.index)  # Default: GOOD statt NOT_EVALUATED
        else:
            final_flags = df_flags_numeric.max(axis=1, skipna=True)
            final_flags = final_flags.fillna(QartodFlags.GOOD).astype(int)

        # Sammle alle Gründe für jede Zeile, entferne leere Einträge und Duplikate
        def aggregate_reasons(row):
            reasons = []
            for r in row:
                if pd.notna(r) and r != '' and r != 'nan':
                    # Konvertiere zu String falls nötig
                    r_str = str(r)
                    if r_str not in reasons:  # Verhindere Duplikate
                        reasons.append(r_str)
            return '; '.join(sorted(reasons)) if reasons else ''

        # Stelle sicher, dass df_reasons existiert und nicht leer ist
        if df_reasons is not None and not df_reasons.empty:
            final_reasons = df_reasons.apply(aggregate_reasons, axis=1)
        else:
            final_reasons = pd.Series('', index=df_flags.index)
        
        return final_flags, final_reasons

    def validate_range(self, series: pd.Series, plausible_min=None, plausible_max=None, 
                      param_name=None, seasonal_rules=None):
        """
        QARTOD Test: Bereichsprüfung - jetzt mit optionaler saisonaler Unterstützung.
        
        Args:
            series: Zeitreihe der Messwerte
            plausible_min: Standard-Minimum (kann durch saisonale Werte überschrieben werden)
            plausible_max: Standard-Maximum (kann durch saisonale Werte überschrieben werden)
            param_name: Name des Parameters (optional, für saisonale Regeln)
            seasonal_rules: Dictionary mit saisonalen Regeln (optional)
        """
        flags = pd.Series(QartodFlags.GOOD, index=series.index, dtype=int)
        reasons = pd.Series("", index=series.index, dtype=str)
        
        # Wenn saisonale Regeln vorhanden sind und param_name angegeben
        if seasonal_rules and param_name and param_name in seasonal_rules:
            # Verwende saisonale Validierung
            for idx, value in series.items():
                if pd.isna(value):
                    flags[idx] = QartodFlags.MISSING
                    reasons[idx] = "Fehlender Wert"
                    continue
                
                # Bestimme Saison basierend auf dem Datum
                if hasattr(idx, 'month'):
                    season = self._get_season(idx.month)
                    season_data = seasonal_rules[param_name].get(season, {})
                    
                    # Verwende saisonale Werte wenn vorhanden, sonst Standards
                    min_val = season_data.get('min', plausible_min)
                    max_val = season_data.get('max', plausible_max)
                    season_info = f" ({self._get_season_name(season)})"
                else:
                    # Fallback auf Standard-Werte
                    min_val = plausible_min
                    max_val = plausible_max
                    season_info = ""
                
                # Validierung
                if max_val is not None and value > max_val:
                    flags[idx] = QartodFlags.BAD
                    reasons[idx] = f"Wert > Max ({max_val}){season_info}"
                elif min_val is not None and value < min_val:
                    flags[idx] = QartodFlags.BAD
                    reasons[idx] = f"Wert < Min ({min_val}){season_info}"
        else:
            # Normale Validierung ohne saisonale Anpassung (wie bisher)
            if plausible_max is not None:
                mask_high = series > plausible_max
                flags[mask_high] = QartodFlags.BAD
                reasons[mask_high] = f"Wert > Max ({plausible_max})"
            
            if plausible_min is not None:
                mask_low = series < plausible_min
                flags[mask_low] = QartodFlags.BAD
                reasons[mask_low] = f"Wert < Min ({plausible_min})"
            
            mask_na = series.isna()
            flags[mask_na] = QartodFlags.MISSING
            reasons[mask_na] = "Fehlender Wert"
        
        return flags, reasons
    
    def _get_season(self, month):
        """Bestimmt die Jahreszeit basierend auf dem Monat."""
        if month in [12, 1, 2]:
            return 'winter'
        elif month in [3, 4, 5]:
            return 'spring'
        elif month in [6, 7, 8]:
            return 'summer'
        else:  # 9, 10, 11
            return 'autumn'
    
    def _get_season_name(self, season):
        """Gibt den deutschen Namen der Jahreszeit zurück."""
        season_names = {
            'winter': 'Winter',
            'spring': 'Frühling',
            'summer': 'Sommer',
            'autumn': 'Herbst'
        }
        return season_names.get(season, season)