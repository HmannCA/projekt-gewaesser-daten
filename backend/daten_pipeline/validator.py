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

    def validate_range(self, series: pd.Series, plausible_min, plausible_max):
        """
        QARTOD Test: Bereichsprüfung.
        Gibt jetzt ein Tupel zurück: (Flags, Gründe)
        """
        flags = pd.Series(QartodFlags.GOOD, index=series.index, dtype=int)
        reasons = pd.Series("", index=series.index, dtype=str)
        
        # Prüfung auf Überschreitung
        if plausible_max is not None:
            mask_high = series > plausible_max
            flags[mask_high] = QartodFlags.BAD
            reasons[mask_high] = f"Wert > Max ({plausible_max})"
        
        # Prüfung auf Unterschreitung
        if plausible_min is not None:
            mask_low = series < plausible_min
            flags[mask_low] = QartodFlags.BAD
            reasons[mask_low] = f"Wert < Min ({plausible_min})"
        
        # Prüfung auf fehlende Werte
        mask_na = series.isna()
        flags[mask_na] = QartodFlags.MISSING
        reasons[mask_na] = "Fehlender Wert"
        
        return flags, reasons