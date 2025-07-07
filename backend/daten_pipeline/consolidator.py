import pandas as pd
from config_file import QARTOD_AGGREGATION

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
    NOT_EVALUATED = 2
    SUSPECT = 3
    BAD = 4
    MISSING = 9

def apply_precision(value, precision: int):
    """Rundet einen Wert auf eine gegebene Anzahl von Dezimalstellen."""
    if pd.isna(value):
        return None
    try:
        return round(float(value), precision)
    except (ValueError, TypeError):
        return value

def aggregate_daily_values(hourly_data: pd.DataFrame, parameter_rules: dict, precision_rules: dict, **kwargs):
    """
    Fasst validierte Stundendaten zusammen UND aggregiert die Gründe für die Flag-Vergabe.
    """
    daily_aggregates = {}

    for param, methods in parameter_rules.items():
        flag_col_name = f'flag_{param}'
        reason_col_name = f'reason_{param}'

        if param in hourly_data.columns and flag_col_name in hourly_data.columns and reason_col_name in hourly_data.columns:
            
            series = hourly_data[param]
            flags = hourly_data[flag_col_name]
            reasons = hourly_data[reason_col_name]

            # Sammle alle einzigartigen Gründe für die "schlechten" Flags des Tages
            bad_reasons = set(r for r in reasons if r is not None and r != '')
            final_reason_string = '; '.join(sorted(list(bad_reasons))) if bad_reasons else "Alle Werte plausibel"

            good_values_count = (flags == QartodFlags.GOOD).sum()
            total_values_count = len(flags)
            good_ratio = (good_values_count / total_values_count) * 100 if total_values_count > 0 else 0
            
            agg_flag = QartodFlags.NOT_EVALUATED
            if good_ratio >= 75:
                agg_flag = QartodFlags.GOOD
            elif 50 <= good_ratio < 75:
                agg_flag = QartodFlags.SUSPECT
            else:
                agg_flag = QartodFlags.BAD

            if agg_flag == QartodFlags.BAD:
                daily_aggregates[param] = {
                    'Anteil_Guter_Werte_Prozent': apply_precision(good_ratio, 1), 
                    'Aggregat_QARTOD_Flag': agg_flag,
                    'Aggregat_Gruende': final_reason_string
                }
                continue

            valid_series = series[flags == QartodFlags.GOOD]
            if valid_series.empty:
                # Füge trotzdem die Qualitätsinfo hinzu, wenn der Flag nicht "BAD" war
                daily_aggregates[param] = {
                    'Anteil_Guter_Werte_Prozent': apply_precision(good_ratio, 1), 
                    'Aggregat_QARTOD_Flag': agg_flag,
                    'Aggregat_Gruende': final_reason_string
                }
                continue

            daily_aggregates[param] = {}
            precision = precision_rules.get(param, 2)

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
                    result = valid_series.std()
                    agg_name = 'StdAbw'
                
                if result is not None:
                    daily_aggregates[param][agg_name] = apply_precision(result, precision)
            
            daily_aggregates[param]['Anteil_Guter_Werte_Prozent'] = apply_precision(good_ratio, 1)
            daily_aggregates[param]['Aggregat_QARTOD_Flag'] = agg_flag
            daily_aggregates[param]['Aggregat_Gruende'] = final_reason_string
    
    if not daily_aggregates:
        return None
            
    flat_results = {}
    for param, aggs in daily_aggregates.items():
        for agg_name, value in aggs.items():
            flat_results[f"{param}_{agg_name}"] = value
            
    return pd.Series(flat_results)