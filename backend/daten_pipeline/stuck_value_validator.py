import pandas as pd

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
    SUSPECT = 3

def check_stuck_values(series: pd.Series, tolerance: int = 3):
    """
    Identifiziert "feststeckende" Werte in einer Zeitreihe und gibt Flags und Gründe zurück.
    Wenn ein Wert sich für 'tolerance' Stunden nicht ändert, wird er als verdächtig markiert.

    Args:
        series (pd.Series): Die Zeitreihe der Messwerte.
        tolerance (int): Die Anzahl der aufeinanderfolgenden, identischen Messungen,
                         ab der ein Wert als "feststeckend" (suspect) gilt.

    Returns:
        tuple[pd.Series, pd.Series]: Ein Tupel, das (Flags, Gründe) enthält.
    """
    # Erstelle eine Serie, die standardmäßig alle Werte als "GOOD" markiert.
    flags = pd.Series(QartodFlags.GOOD, index=series.index)
    # Erstelle eine leere Serie für die Gründe.
    reasons = pd.Series("", index=series.index)
    
    # Berechne, ob sich der Wert zum vorherigen Wert geändert hat.
    # .diff() != 0 ist True, wenn eine Änderung stattgefunden hat.
    # .rolling(window=tolerance) prüft ein Fenster von 'tolerance' Stunden.
    # .sum() zählt, wie viele Änderungen im Fenster aufgetreten sind.
    # Wenn die Summe 0 ist, gab es keine einzige Änderung im Fenster -> Stuck Value.
    no_change_in_window = (series.diff() != 0).rolling(window=tolerance).sum() == 0
    
    # Markiere alle Instanzen, bei denen das Fenster keine Änderung aufweist, als "SUSPECT".
    flags[no_change_in_window] = QartodFlags.SUSPECT
    reasons[no_change_in_window] = f"Wert seit {tolerance} Stunden unverändert"
    
    return flags, reasons