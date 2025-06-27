import pandas as pd
import numpy as np
from pyod.models.iforest import IForest

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
    SUSPECT = 3

def check_multivariate_anomalies(df: pd.DataFrame, columns_to_check: list):
    """
    Identifiziert multivariate Anomalien und versucht, die auffälligsten Parameter
    in der Begründung zu benennen.

    Args:
        df (pd.DataFrame): Der DataFrame, der die zu prüfenden Daten enthält.
        columns_to_check (list): Eine Liste der Spaltennamen, die gemeinsam
                                 analysiert werden sollen.

    Returns:
        tuple[pd.Series, pd.Series]: Ein Tupel, das (Flags, Gründe) enthält.
    """
    flags = pd.Series(QartodFlags.GOOD, index=df.index)
    reasons = pd.Series("", index=df.index)
    
    data_subset = df[columns_to_check].copy()

    # Robuste Methode zum Füllen von NaN-Werten vor der Analyse
    medians = data_subset.median()
    data_subset.fillna(medians, inplace=True)
    data_subset.fillna(0, inplace=True) 

    anomaly_detector = IForest(contamination=0.02, random_state=42)
    
    if not data_subset.empty:
        try:
            predictions = anomaly_detector.fit_predict(data_subset)
            anomaly_flags = pd.Series(predictions, index=data_subset.index).map({0: QartodFlags.GOOD, 1: QartodFlags.SUSPECT})
            
            is_anomaly = anomaly_flags == QartodFlags.SUSPECT
            flags[is_anomaly] = QartodFlags.SUSPECT
            
            # --- NEUE LOGIK: SPURENSUCHE BEI ANOMALIEN ---
            if is_anomaly.any():
                # Berechne die Schwellenwerte für "extrem hohe" und "extrem niedrige" Werte
                lower_quantile = data_subset.quantile(0.10)
                upper_quantile = data_subset.quantile(0.90)
                
                # Finde die Zeilen, die als Anomalie geflaggt wurden
                anomaly_indices = flags[flags == QartodFlags.SUSPECT].index
                
                for idx in anomaly_indices:
                    problem_params = []
                    for col in columns_to_check:
                        value = data_subset.loc[idx, col]
                        # Ist der Wert extrem niedrig?
                        if value < lower_quantile[col]:
                            problem_params.append(f"{col} (niedrig)")
                        # Ist der Wert extrem hoch?
                        elif value > upper_quantile[col]:
                            problem_params.append(f"{col} (hoch)")
                    
                    if problem_params:
                        reasons.loc[idx] = "Unplausible Kombination. Auffällige Werte: " + ", ".join(problem_params)
                    else:
                        reasons.loc[idx] = "Unplausible Kombination von Werten" # Fallback

        except Exception as e:
            print(f"FEHLER bei der multivariaten Anomalie-Erkennung: {e}")
            
    return flags, reasons