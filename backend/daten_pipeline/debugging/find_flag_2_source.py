"""
Sucht in allen Python-Dateien nach der Quelle von Flag=2
"""

import os
import glob

def search_for_flag_2():
    """Durchsucht alle Python-Dateien nach Flag=2 Zuweisungen"""
    
    print("=" * 80)
    print("SUCHE: Wo wird Flag=2 (NOT_EVALUATED) gesetzt?")
    print("=" * 80)
    
    # Suche in allen .py Dateien
    py_files = glob.glob("*.py")
    
    patterns_to_find = [
        "= 2",
        "NOT_EVALUATED",
        "flag.*2",
        "Flag.*2",
        ".fillna(2)",
        "QartodFlags.NOT_EVALUATED"
    ]
    
    found_locations = []
    
    for py_file in py_files:
        if py_file == __file__:  # Skip dieses Skript
            continue
            
        try:
            with open(py_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            for line_num, line in enumerate(lines, 1):
                for pattern in patterns_to_find:
                    if pattern in line and not line.strip().startswith('#'):
                        found_locations.append({
                            'file': py_file,
                            'line': line_num,
                            'content': line.strip(),
                            'pattern': pattern
                        })
                        
        except Exception as e:
            print(f"Fehler beim Lesen von {py_file}: {e}")
    
    # Gruppiere nach Datei
    by_file = {}
    for loc in found_locations:
        if loc['file'] not in by_file:
            by_file[loc['file']] = []
        by_file[loc['file']].append(loc)
    
    # Ausgabe
    for file, locations in by_file.items():
        print(f"\n{file}:")
        print("-" * 60)
        for loc in locations:
            print(f"  Zeile {loc['line']}: {loc['content']}")
    
    # Spezielle Suche in validator.py
    print("\n" + "=" * 80)
    print("SPEZIELLE ANALYSE: validator.py")
    print("=" * 80)
    
    if os.path.exists('validator.py'):
        with open('validator.py', 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Suche nach combine_flags_and_reasons
        if 'fillna' in content:
            print("GEFUNDEN: fillna() wird verwendet!")
            start = content.find('fillna')
            context = content[max(0, start-100):start+100]
            print(f"Kontext:\n{context}")
            
    # Prüfe auch enhanced_correlation_validator
    print("\n" + "=" * 80)
    print("PRÜFE: enhanced_correlation_validator.py")
    print("=" * 80)
    
    if os.path.exists('enhanced_correlation_validator.py'):
        with open('enhanced_correlation_validator.py', 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for i, line in enumerate(lines):
            if 'QartodFlags.GOOD' in line and '=' in line:
                print(f"Zeile {i+1}: {line.strip()}")
                # Schaue Kontext an
                for j in range(max(0, i-2), min(len(lines), i+3)):
                    print(f"  {j+1}: {lines[j].rstrip()}")
                print()


if __name__ == "__main__":
    search_for_flag_2()
    
    print("\n" + "=" * 80)
    print("VERMUTUNG: Flag=2 kommt von der Korrelations- oder Agricultural-Validierung!")
    print("Diese laufen NACH den Basis-Validierungen und könnten Flags überschreiben.")
    print("=" * 80)