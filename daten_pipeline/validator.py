import pandas as pd

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
        """
        # Finde den maximalen (schlechtesten) Flag-Wert für jede Zeile
        final_flags = df_flags.max(axis=1).fillna(QartodFlags.NOT_EVALUATED).astype(int)

        # Sammle alle Gründe für jede Zeile, entferne leere Einträge und Duplikate,
        # und verbinde sie zu einem einzigen, lesbaren String.
        def aggregate_reasons(row):
            reasons = set(r for r in row if pd.notna(r) and r != '')
            return '; '.join(sorted(list(reasons)))

        final_reasons = df_reasons.apply(aggregate_reasons, axis=1)
        
        return final_flags, final_reasons

    def validate_range(self, series: pd.Series, plausible_min, plausible_max):
        """
        QARTOD Test: Bereichsprüfung.
        Gibt jetzt ein Tupel zurück: (Flags, Gründe)
        """
        flags = pd.Series(QartodFlags.GOOD, index=series.index)
        reasons = pd.Series("", index=series.index)
        
        # Prüfung auf Überschreitung
        flags[series > plausible_max] = QartodFlags.BAD
        reasons[series > plausible_max] = f"Wert > Max ({plausible_max})"
        
        # Prüfung auf Unterschreitung
        flags[series < plausible_min] = QartodFlags.BAD
        reasons[series < plausible_min] = f"Wert < Min ({plausible_min})"
        
        # Prüfung auf fehlende Werte
        flags[series.isna()] = QartodFlags.MISSING
        reasons[series.isna()] = "Fehlender Wert"
        
        return flags, reasons