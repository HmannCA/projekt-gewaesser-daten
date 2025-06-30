# multivariate_validator.py - KORRIGIERTE VERSION

import pandas as pd
import numpy as np
from pyod.models.iforest import IForest

class QartodFlags:
    """Definiert die standardisierten QARTOD-Flag-Werte."""
    GOOD = 1
    SUSPECT = 3

def check_multivariate_anomalies(df: pd.DataFrame, columns_to_check: list):
    """Identifiziert multivariate Anomalien..."""
    # Erstelle individuelle Flags für JEDEN Parameter
    all_flags = {}
    all_reasons = {}
    
    for col in columns_to_check:
        all_flags[col] = pd.Series(QartodFlags.GOOD, index=df.index)
        all_reasons[col] = pd.Series("", index=df.index)
    
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
            
            # --- VERBESSERTE LOGIK: SPURENSUCHE BEI ANOMALIEN ---
            if is_anomaly.any():
                # Berechne die Schwellenwerte für "extrem hohe" und "extrem niedrige" Werte
                lower_quantile = data_subset.quantile(0.05)
                upper_quantile = data_subset.quantile(0.95)
                
                # Finde die Zeilen, die als Anomalie geflaggt wurden
                anomaly_indices = df.index[is_anomaly]
                
                for idx in anomaly_indices:
                    problem_params = []
                    for col in columns_to_check:
                        value = data_subset.loc[idx, col]
                        
                        # Ist der Wert extrem niedrig?
                        if value < lower_quantile[col]:
                            all_flags[col].loc[idx] = QartodFlags.SUSPECT
                            all_reasons[col].loc[idx] = f"Multivariate Anomalie: {col} ungewöhnlich niedrig"
                            problem_params.append(f"{col} (niedrig)")
                            
                        # Ist der Wert extrem hoch?
                        elif value > upper_quantile[col]:
                            all_flags[col].loc[idx] = QartodFlags.SUSPECT
                            all_reasons[col].loc[idx] = f"Multivariate Anomalie: {col} ungewöhnlich hoch"
                            problem_params.append(f"{col} (hoch)")
                    
                    # Falls keine spezifischen Parameter identifiziert wurden, 
                    # aber trotzdem eine Anomalie vorliegt
                    if not problem_params and is_anomaly[idx]:
                        # Markiere alle Parameter dieser Anomalie
                        for col in columns_to_check:
                            all_flags[col].loc[idx] = QartodFlags.SUSPECT
                            all_reasons[col].loc[idx] = "Unplausible Parameterkombination"

        except Exception as e:
            print(f"FEHLER bei der multivariaten Anomalie-Erkennung: {e}")
    
    # WICHTIG: Gib die Dictionaries zurück, nicht die aggregierten flags/reasons!
    return all_flags, all_reasons