import pandas as pd

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
    BAD = 4

def check_spikes(series: pd.Series, max_rate_of_change: float):
    """
    Identifiziert unrealistische Sprünge (Spikes) in einer Zeitreihe und gibt Flags und Gründe zurück.

    Args:
        series (pd.Series): Die Zeitreihe der Messwerte.
        max_rate_of_change (float): Die maximal erlaubte Änderung von einer Stunde
                                    zur nächsten.

    Returns:
        tuple[pd.Series, pd.Series]: Ein Tupel, das (Flags, Gründe) enthält.
    """
    # Erstelle eine Serie, die standardmäßig alle Werte als "GOOD" markiert.
    flags = pd.Series(QartodFlags.GOOD, index=series.index)
    # Erstelle eine leere Serie für die Gründe.
    reasons = pd.Series("", index=series.index)
    
    # Berechne die absolute Änderung zum vorherigen Wert.
    rate_of_change = series.diff().abs()
    
    # Markiere alle Werte, bei denen die Änderung größer als der erlaubte Schwellenwert ist, als "BAD".
    flags[rate_of_change > max_rate_of_change] = QartodFlags.BAD
    reasons[rate_of_change > max_rate_of_change] = "Unrealistischer Sprung zum Vorwert"
    
    return flags, reasons