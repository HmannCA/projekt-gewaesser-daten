import pandas as pd
import os
import sys
from metadata_mapper import load_metadata, create_column_mapping, map_columns_to_names
from validator import WaterQualityValidator

def create_validation_report(input_dir: str, output_dir: str, metadata_path: str):
    """
    Liest alle Rohdaten mit dem korrekten Trennzeichen, führt eine Bereichsvalidierung
    durch und erstellt einen detaillierten CSV-Report im Long-Format.
    """
    print("=" * 60)
    print("Starte die Erstellung des detaillierten Validierungsreports...")
    print("=" * 60)

    # 1. Metadaten laden (unverändert)
    metadata = load_metadata(metadata_path)
    if not metadata:
        sys.exit("Abbruch: Metadaten-Datei konnte nicht geladen werden.")
    column_mapping, _ = create_column_mapping(metadata)
    if not column_mapping:
        sys.exit("Abbruch: Spalten-Mapping konnte nicht erstellt werden. Bitte Metadaten prüfen.")

    # 2. Alle CSV-Dateien laden (FINALE, KORREKTE METHODE)
    all_files = [os.path.join(input_dir, f) for f in os.listdir(input_dir) if f.endswith('.csv')]
    if not all_files:
        print(f"Keine CSV-Dateien im Verzeichnis {input_dir} gefunden.")
        return
        
    try:
        df_list = [
            pd.read_csv(
                f, 
                sep=',', # DER ENTSCHEIDENDE PUNKT: Komma als Trennzeichen
                header=None,
                index_col=0,
                on_bad_lines='skip', 
                encoding='utf-8-sig'
            ) for f in all_files
        ]
        raw_data = pd.concat(df_list)
        raw_data.index = pd.to_datetime(raw_data.index, errors='coerce')
        raw_data = raw_data[raw_data.index.notna()]
        raw_data.sort_index(inplace=True)
    except Exception as e:
        sys.exit(f"Kritischer Fehler beim Einlesen der CSV-Dateien: {e}")

    if raw_data.empty:
        sys.exit("Abbruch: Nach dem Einlesen und Bereinigen sind keine Daten mehr übrig.")

    processed_data = raw_data.apply(pd.to_numeric, errors='coerce')
    processed_data = map_columns_to_names(processed_data, column_mapping)
    
    # 3. Validierungsregeln definieren
    validation_rules = {
        'Phycocyanin Abs.': {'min': 0.0, 'max': 200.0}, 'Phycocyanin Abs. (comp)': {'min': 0.0, 'max': 200.0},
        'TOC': {'min': 1.0, 'max': 70.0}, 'Trübung': {'min': 0.0, 'max': 150.0}, 'Chl-a': {'min': 0.0, 'max': 250.0},
        'DOC': {'min': 1.0, 'max': 60.0}, 'Nitrat': {'min': 0.0, 'max': 50.0}, 'Gelöster Sauerstoff': {'min': 0.0, 'max': 20.0},
        'Leitfähigkeit': {'min': 100, 'max': 1500}, 'pH-Wert': {'min': 6.0, 'max': 10.0}, 'Redoxpotential': {'min': -300, 'max': 600},
        'Wassertemperatur': {'min': -0.5, 'max': 32.0}, 'Lufttemperatur': {'min': -25.0, 'max': 40.0}
    }
    
    # 4. Report im "Long-Format" erstellen
    report_data = []
    validator = WaterQualityValidator()

    for param_name in processed_data.columns:
        rules = validation_rules.get(param_name)
        if not rules: continue

        plausible_min = rules['min']
        plausible_max = rules['max']
        flags = validator.validate_range(processed_data[param_name], plausible_min, plausible_max)

        param_df = pd.DataFrame({
            'Parameter': param_name,
            'Wert': processed_data[param_name],
            'Plausibel_Min': plausible_min,
            'Plausibel_Max': plausible_max,
            'QARTOD_Flag': flags
        })
        report_data.append(param_df)

    final_report = pd.concat(report_data)
    final_report.index.name = 'Zeitstempel'
    
    # Speichere den finalen Report
    output_filepath = os.path.join(output_dir, 'validierungs_detail_report.csv')
    final_report.to_csv(output_filepath, sep=';', decimal=',', encoding='utf-8-sig')
    
    print("-" * 60)
    print(f"Detail-Report erfolgreich erstellt und gespeichert in:")
    print(output_filepath)
    print("-" * 60)


if __name__ == '__main__':
    BASE_DIR = r"F:\Projekte_SH\WAMO-Daten\daten_pipeline"
    INPUT_DIR = os.path.join(BASE_DIR, "input")
    OUTPUT_DIR = os.path.join(BASE_DIR, "output")
    METADATA_FILE = os.path.join(INPUT_DIR, "wamo00010_24313808_parameter-metadata_20250416T090000.json")
    
    create_validation_report(
        input_dir=INPUT_DIR,
        output_dir=OUTPUT_DIR,
        metadata_path=METADATA_FILE
    )