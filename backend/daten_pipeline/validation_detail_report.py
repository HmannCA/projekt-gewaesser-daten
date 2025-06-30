import pandas as pd
import json
from datetime import datetime
from typing import Dict, List

class ValidationDetailReport:
    """Erstellt detaillierte Berichte über alle Validierungsprobleme"""
    
    def __init__(self):
        self.flag_names = {
            1: "GUT",
            2: "NICHT_BEWERTET", 
            3: "VERDÄCHTIG",
            4: "SCHLECHT",
            9: "FEHLEND"
        }
    
    def generate_detailed_report(self, processed_data: pd.DataFrame, 
                               output_path: str = None) -> Dict:
        """
        Analysiert alle Flags und erstellt einen detaillierten Bericht
        """
        report = {
            "zusammenfassung": {},
            "parameter_statistiken": {},
            "fehlerhafte_werte": [],
            "stundenweise_uebersicht": {},
            "validierungs_muster": {}
        }
        
        # 1. Analysiere jeden Parameter
        parameters = [col for col in processed_data.columns 
                     if not col.startswith('flag_') and not col.startswith('reason_')]
        
        for param in parameters:
            flag_col = f'flag_{param}'
            reason_col = f'reason_{param}'
            
            if flag_col not in processed_data.columns:
                continue
                
            # Statistiken pro Parameter
            flag_counts = processed_data[flag_col].value_counts().to_dict()
            total = len(processed_data)
            good_count = flag_counts.get(1, 0)
            good_percentage = (good_count / total * 100) if total > 0 else 0
            
            report["parameter_statistiken"][param] = {
                "gesamt": total,
                "gut": good_count,
                "gut_prozent": round(good_percentage, 1),
                "nicht_gut": total - good_count,
                "flag_verteilung": {self.flag_names.get(k, f"Flag_{k}"): v 
                                   for k, v in flag_counts.items()}
            }
            
            # Sammle ALLE nicht-guten Werte
            bad_mask = processed_data[flag_col] != 1
            if bad_mask.any():
                bad_data = processed_data[bad_mask]
                
                for idx, row in bad_data.iterrows():
                    error_entry = {
                        "zeitpunkt": idx.strftime("%Y-%m-%d %H:%M:%S"),
                        "parameter": param,
                        "wert": float(row[param]) if pd.notna(row[param]) else None,
                        "flag": int(row[flag_col]),
                        "flag_name": self.flag_names.get(int(row[flag_col]), "UNBEKANNT"),
                        "grund": row.get(reason_col, "Kein Grund angegeben")
                    }
                    report["fehlerhafte_werte"].append(error_entry)
        
        # Sortiere fehlerhafte Werte nach Zeit und Parameter
        report["fehlerhafte_werte"].sort(key=lambda x: (x["zeitpunkt"], x["parameter"]))
        
        # 2. Stundenweise Übersicht
        for hour, hour_data in processed_data.groupby(processed_data.index.hour):
            hour_summary = {
                "anzahl_messungen": len(hour_data),
                "fehlerhafte_parameter": []
            }
            
            for param in parameters:
                flag_col = f'flag_{param}'
                if flag_col in hour_data.columns:
                    bad_count = (hour_data[flag_col] != 1).sum()
                    if bad_count > 0:
                        hour_summary["fehlerhafte_parameter"].append({
                            "parameter": param,
                            "fehler_anzahl": int(bad_count)
                        })
            
            report["stundenweise_uebersicht"][f"{hour:02d}:00"] = hour_summary
        
        # 3. Erkenne Muster
        report["validierungs_muster"] = self._analyze_patterns(processed_data)
        
        # 4. Zusammenfassung
        total_measurements = len(parameters) * len(processed_data)
        total_good = sum(stat["gut"] for stat in report["parameter_statistiken"].values())
        
        report["zusammenfassung"] = {
            "zeitraum": f"{processed_data.index.min()} bis {processed_data.index.max()}",
            "anzahl_parameter": len(parameters),
            "anzahl_zeitpunkte": len(processed_data),
            "gesamt_messungen": total_measurements,
            "gesamt_gut": total_good,
            "gesamt_gut_prozent": round(total_good / total_measurements * 100, 1) if total_measurements > 0 else 0,
            "anzahl_fehler": len(report["fehlerhafte_werte"]),
            "betroffene_parameter": list(set(e["parameter"] for e in report["fehlerhafte_werte"]))
        }
        
        # 5. Speichere als JSON und Text
        if output_path:
            # JSON Version
            json_path = output_path.replace('.txt', '.json')
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False, default=str)
            
            # Speichere fehlerhafte Werte separat als JSON für Dashboard
            errors_json_path = output_path.replace('.txt', '_fehlerhafte_werte.json')
            with open(errors_json_path, 'w', encoding='utf-8') as f:
                json.dump({
                    "zeitraum": report["zusammenfassung"]["zeitraum"],
                    "anzahl_fehler": len(report["fehlerhafte_werte"]),
                    "fehlerhafte_werte": report["fehlerhafte_werte"]
                }, f, indent=2, ensure_ascii=False, default=str)
            
            # Text Version
            self._save_text_report(report, output_path)
            
        return report
    
    def _analyze_patterns(self, data: pd.DataFrame) -> Dict:
        """Analysiert Muster in den Validierungsfehlern"""
        patterns = {
            "haeufigste_fehlergruende": {},
            "parameter_kombinationen": {},
            "zeitliche_haeufung": {}
        }
        
        # Sammle alle Gründe
        all_reasons = []
        for col in data.columns:
            if col.startswith('reason_'):
                reasons = data[col][data[col] != ""].tolist()
                all_reasons.extend(reasons)
        
        # Zähle Gründe
        from collections import Counter
        reason_counts = Counter(all_reasons)
        patterns["haeufigste_fehlergruende"] = dict(reason_counts.most_common(10))
        
        # Finde Parameter die oft zusammen Fehler haben
        flag_cols = [col for col in data.columns if col.startswith('flag_')]
        for i, col1 in enumerate(flag_cols):
            for col2 in flag_cols[i+1:]:
                both_bad = ((data[col1] != 1) & (data[col2] != 1)).sum()
                if both_bad > 5:  # Mindestens 5 gemeinsame Fehler
                    param1 = col1.replace('flag_', '')
                    param2 = col2.replace('flag_', '')
                    patterns["parameter_kombinationen"][f"{param1} + {param2}"] = int(both_bad)
        
        return patterns
    
    def _save_text_report(self, report: Dict, output_path: str):
        """Speichert einen lesbaren Textbericht mit ALLEN fehlerhaften Werten in Tabellenform"""
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("="*100 + "\n")
            f.write("DETAILLIERTER VALIDIERUNGSBERICHT\n")
            f.write("="*100 + "\n\n")
            
            # Zusammenfassung
            f.write("ZUSAMMENFASSUNG:\n")
            f.write("-"*40 + "\n")
            for key, value in report["zusammenfassung"].items():
                f.write(f"{key}: {value}\n")
            
            # Parameter-Statistiken
            f.write("\n\nPARAMETER-STATISTIKEN:\n")
            f.write("-"*40 + "\n")
            for param, stats in report["parameter_statistiken"].items():
                f.write(f"\n{param}:\n")
                f.write(f"  Gut: {stats['gut']} von {stats['gesamt']} ({stats['gut_prozent']}%)\n")
                f.write(f"  Flag-Verteilung: {stats['flag_verteilung']}\n")
            
            # ALLE Fehlerhafte Werte in Tabellenform
            f.write("\n\nALLE FEHLERHAFTEN WERTE:\n")
            f.write("-"*100 + "\n")
            
            if report["fehlerhafte_werte"]:
                # Tabellenkopf
                f.write(f"{'Nr.':<6} {'Zeitpunkt':<20} {'Parameter':<25} {'Wert':<12} {'Flag':<15} {'Grund':<40}\n")
                f.write("-"*100 + "\n")
                
                # Tabelleninhalt
                for i, error in enumerate(report["fehlerhafte_werte"], 1):
                    wert_str = f"{error['wert']:.2f}" if error['wert'] is not None else "N/A"
                    grund_str = error['grund'][:40] + "..." if len(error['grund']) > 40 else error['grund']
                    
                    f.write(f"{i:<6} {error['zeitpunkt']:<20} {error['parameter']:<25} "
                           f"{wert_str:<12} {error['flag_name']:<15} {grund_str:<40}\n")
                
                f.write("-"*100 + "\n")
                f.write(f"Gesamt: {len(report['fehlerhafte_werte'])} fehlerhafte Werte\n")
            else:
                f.write("Keine fehlerhaften Werte gefunden.\n")
            
            # Muster
            f.write("\n\nERKANNTE MUSTER:\n")
            f.write("-"*40 + "\n")
            f.write("\nHäufigste Fehlergründe:\n")
            for grund, count in report["validierungs_muster"]["haeufigste_fehlergruende"].items():
                f.write(f"  {count}x: {grund}\n")
            
            f.write("\nParameter mit gemeinsamen Fehlern:\n")
            for kombi, count in report["validierungs_muster"]["parameter_kombinationen"].items():
                f.write(f"  {kombi}: {count} gemeinsame Fehler\n")


def generate_validation_details(processed_data: pd.DataFrame, 
                              station_id: str, 
                              output_dir: str) -> str:
    """Integration in die Pipeline"""
    reporter = ValidationDetailReport()
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = f"{output_dir}/validierung_details_{station_id}_{timestamp}.txt"
    
    report = reporter.generate_detailed_report(processed_data, output_path)
    
    print(f"\nValidierungs-Detailbericht erstellt:")
    print(f"  Text: {output_path}")
    print(f"  JSON: {output_path.replace('.txt', '.json')}")
    print(f"  Fehler-JSON: {output_path.replace('.txt', '_fehlerhafte_werte.json')}")
    print(f"\nZusammenfassung:")
    print(f"  {report['zusammenfassung']['anzahl_fehler']} fehlerhafte Werte gefunden")
    print(f"  Betroffene Parameter: {', '.join(report['zusammenfassung']['betroffene_parameter'])}")
    
    return output_path