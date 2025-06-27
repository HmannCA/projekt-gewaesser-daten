import pandas as pd
import numpy as np

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
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

def get_aggregation_flag(good_ratio: float):
    """Bestimmt das finale QARTOD-Flag für einen aggregierten Wert."""
    if good_ratio >= 75:
        return QartodFlags.GOOD
    elif 50 <= good_ratio < 75:
        return QartodFlags.SUSPECT
    else:
        return QartodFlags.BAD

def interpolate_and_aggregate(hourly_data: pd.DataFrame, parameter_rules: dict, precision_rules: dict, **kwargs):
    """
    Führt die Interpolation durch und aggregiert die Gründe für die Flag-Vergabe.
    """
    daily_aggregates = {}

    for param, methods in parameter_rules.items():
        flag_col_name = f'flag_{param}'
        reason_col_name = f'reason_{param}'

        if param not in hourly_data.columns or flag_col_name not in hourly_data.columns:
            continue

        series = hourly_data[param]
        flags = hourly_data[flag_col_name]
        reasons = hourly_data[reason_col_name] if reason_col_name in hourly_data.columns else pd.Series("", index=hourly_data.index)
        
        # Sammle alle einzigartigen Gründe des Tages
        all_reasons = set(r for r in reasons if r is not None and r != '')
        final_reason_string = '; '.join(sorted(list(all_reasons))) if all_reasons else "Alle Werte plausibel"

        good_values_count = (flags == QartodFlags.GOOD).sum()
        total_values_count = len(flags)
        good_ratio = (good_values_count / total_values_count) * 100 if total_values_count > 0 else 0
        agg_flag = get_aggregation_flag(good_ratio)
        
        should_interpolate = (agg_flag == QartodFlags.GOOD)
        series_for_calc = None
        
        if should_interpolate:
            series_to_interpolate = series.copy()
            series_to_interpolate[flags.isin([QartodFlags.BAD, QartodFlags.SUSPECT])] = np.nan
            series_for_calc = series_to_interpolate.interpolate(method='linear', limit_direction='both', limit=3)
        else:
            series_for_calc = series[flags == QartodFlags.GOOD]

        series_for_calc.dropna(inplace=True)

        if series_for_calc.empty:
            continue

        daily_aggregates[param] = {}
        precision = precision_rules.get(param, 2)

        for method in methods:
            result = None
            agg_name = ''
            if method == 'mean': result, agg_name = series_for_calc.mean(), 'Mittelwert'
            elif method == 'min': result, agg_name = series_for_calc.min(), 'Min'
            elif method == 'max': result, agg_name = series_for_calc.max(), 'Max'
            elif method == 'median': result, agg_name = series_for_calc.median(), 'Median'
            elif method == 'std': result, agg_name = series_for_calc.std(), 'StdAbw'
            
            if result is not None:
                daily_aggregates[param][agg_name] = apply_precision(result, precision)
        
        daily_aggregates[param]['Anteil_Guter_Werte_Prozent'] = apply_precision(good_ratio, 1)
        daily_aggregates[param]['Aggregat_QARTOD_Flag'] = agg_flag
        daily_aggregates[param]['Aggregat_Gruende'] = final_reason_string

    if not daily_aggregates: return None
            
    flat_results = {}
    for param, aggs in daily_aggregates.items():
        for agg_name, value in aggs.items():
            flat_results[f"{param}_{agg_name}"] = value
            
    return pd.Series(flat_results)