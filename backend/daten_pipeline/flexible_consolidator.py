"""
Flexible Tageskonsolidierung
Funktioniert auch mit nur wenigen Stunden pro Tag
"""

import pandas as pd
import numpy as np
from config_file import QARTOD_AGGREGATION

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
    NOT_EVALUATED = 2
    SUSPECT = 3
    BAD = 4
    MISSING = 9

def flexible_daily_aggregate(hourly_data: pd.DataFrame, parameter_rules: dict, 
                           precision_rules: dict, min_hours: int = 1, **kwargs):
    """
    Flexiblere Version der Tageskonsolidierung.
    Funktioniert auch mit nur wenigen Stunden pro Tag.
    
    Args:
        hourly_data: DataFrame mit Stundenwerten
        parameter_rules: Dict mit Aggregationsregeln pro Parameter
        precision_rules: Dict mit Präzision pro Parameter
        min_hours: Minimum Stunden für Aggregation (default: 1)
    """
    daily_aggregates = {}
    
    n_hours = len(hourly_data)
    
    for param, methods in parameter_rules.items():
        flag_col_name = f'flag_{param}'
        reason_col_name = f'reason_{param}'
        
        # Prüfe ob Parameter existiert
        if param not in hourly_data.columns:
            continue
            
        series = hourly_data[param]
        
        # Flags (falls vorhanden)
        if flag_col_name in hourly_data.columns:
            flags = hourly_data[flag_col_name]
        else:
            # Wenn keine Flags, nimm alle nicht-NaN Werte als GOOD
            flags = pd.Series(QartodFlags.GOOD, index=series.index)
            flags[series.isna()] = QartodFlags.MISSING
        
        # Reasons (falls vorhanden)
        if reason_col_name in hourly_data.columns:
            reasons = hourly_data[reason_col_name]
        else:
            reasons = pd.Series("", index=hourly_data.index)
        
        # Sammle Gründe
        all_reasons = set(str(r) for r in reasons if pd.notna(r) and r != '')
        final_reason_string = '; '.join(sorted(list(all_reasons))) if all_reasons else "Alle Werte plausibel"
        
        # Berechne Qualitätsmetriken
        good_values_count = (flags == QartodFlags.GOOD).sum()
        total_values_count = len(flags[series.notna()])  # Nur nicht-NaN Werte zählen
        
        if total_values_count == 0:
            continue
            
        good_ratio = (good_values_count / total_values_count) * 100
        
        # Bestimme Aggregat-Flag
        if good_ratio >= QARTOD_AGGREGATION['GOOD_THRESHOLD']:
            agg_flag = QartodFlags.GOOD
        elif good_ratio >= QARTOD_AGGREGATION['SUSPECT_THRESHOLD']:
            agg_flag = QartodFlags.SUSPECT
        else:
            agg_flag = QartodFlags.BAD
        
        # Wähle Werte für Aggregation
        if agg_flag == QartodFlags.BAD:
            # Bei schlechter Qualität trotzdem Statistiken berechnen
            valid_series = series[series.notna()]
        else:
            # Nutze nur "gute" Werte
            good_mask = flags.isin([QartodFlags.GOOD, QartodFlags.NOT_EVALUATED])
            valid_series = series[good_mask & series.notna()]
        
        # Prüfe Mindestanzahl
        if len(valid_series) == 0:
            continue
        
        # Aggregiere
        daily_aggregates[param] = {}
        precision = precision_rules.get(param, precision_rules.get('default', 2))
        
        for method in methods:
            result = None
            agg_name = ''
            
            if method == 'mean':
                result = valid_series.mean()
                agg_name = 'Mittelwert'
            elif method == 'min':
                result = valid_series.min()
                agg_name = 'Min'
            elif method == 'max':
                result = valid_series.max()
                agg_name = 'Max'
            elif method == 'median':
                result = valid_series.median()
                agg_name = 'Median'
            elif method == 'std':
                if len(valid_series) > 1:  # Std braucht min. 2 Werte
                    result = valid_series.std()
                    agg_name = 'StdAbw'
            
            if result is not None and not np.isnan(result):
                daily_aggregates[param][agg_name] = round(float(result), precision)
        
        # Füge Metadaten hinzu
        daily_aggregates[param]['Anzahl_Stunden'] = len(valid_series)
        daily_aggregates[param]['Anteil_Guter_Werte_Prozent'] = round(good_ratio, 1)
        daily_aggregates[param]['Aggregat_QARTOD_Flag'] = int(agg_flag)
        daily_aggregates[param]['Aggregat_Gruende'] = final_reason_string
    
    # Konvertiere zu flacher Struktur
    if not daily_aggregates:
        return None
        
    flat_results = {}
    for param, aggs in daily_aggregates.items():
        for agg_name, value in aggs.items():
            flat_results[f"{param}_{agg_name}"] = value
    
    return pd.Series(flat_results)