import pandas as pd

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
    SUSPECT = 3

def check_stuck_values(series: pd.Series, tolerance: int = 3):
    """
    Identifiziert "feststeckende" Werte in einer Zeitreihe und gibt Flags und Gründe zurück.
    """
    # Erstelle eine Serie, die standardmäßig alle Werte als "GOOD" markiert.
    flags = pd.Series(QartodFlags.GOOD, index=series.index)
    # Erstelle eine leere Serie für die Gründe.
    reasons = pd.Series("", index=series.index)
    
    # Finde zusammenhängende Gruppen von gleichen Werten
    # Erstelle eine Maske für Wertänderungen
    value_changed = series.diff() != 0
    # Erste Wert ist immer eine neue Gruppe
    value_changed.iloc[0] = True
    
    # Gruppiere zusammenhängende gleiche Werte
    groups = value_changed.cumsum()
    
    # Für jede Gruppe prüfen
    for group_id, group_data in series.groupby(groups):
        if len(group_data) >= tolerance:
            # Hole Start- und Endzeit der Stuck-Periode
            start_time = group_data.index[0]
            end_time = group_data.index[-1]
            
            # KORREKTUR: Die Zeiten sind bereits lokal, werden aber als UTC behandelt
            # Daher müssen wir 2 Stunden ADDIEREN für die korrekte Anzeige
            start_display = start_time + pd.Timedelta(hours=2)
            end_display = end_time + pd.Timedelta(hours=2)
            
            # Formatiere die Zeiten (nur Uhrzeit)
            start_str = start_display.strftime('%H:%M')
            end_str = end_display.strftime('%H:%M')
            
            # Setze Flags und Gründe für alle Werte in dieser Gruppe
            flags[group_data.index] = QartodFlags.SUSPECT
            reasons[group_data.index] = f"Wert seit {len(group_data)} Stunden unverändert ({start_str}-{end_str})"
    
    return flags, reasons