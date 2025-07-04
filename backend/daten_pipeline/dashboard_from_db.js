// dashboard_from_db.js
const { getDashboardData, getStationConfig } = require('../db/postgres');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

async function generateDashboardFromDB(stationId) {
    try {
        console.log(`Generiere Dashboard für Station ${stationId} aus Datenbank...`);
        
        // 1. Hole Daten aus DB
        const [dashboardData, stationConfig] = await Promise.all([
            getDashboardData(stationId),
            getStationConfig(stationId)
        ]);
        
        if (dashboardData.error) {
            throw new Error(dashboardData.error);
        }
        
        // 2. Erstelle temporäre Dateien
        const tempDir = path.join(__dirname, 'output', `temp_${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });
        
        // Speichere die Analyse-Daten
        const analysisPath = path.join(tempDir, `erweiterte_analyse_${stationId}_temp.json`);
        const analysisData = {
            station_id: stationId,
            zeitraum: dashboardData.zeitraum,
            basis_validierung: dashboardData.basis_validierung,
            erweiterte_analysen: dashboardData.erweiterte_analysen,
            zusammenfassung: dashboardData.zusammenfassung
        };
        fs.writeFileSync(analysisPath, JSON.stringify(analysisData, null, 2));
        
        // Speichere Station-Config separat
        const configPath = path.join(tempDir, `station_config_temp.json`);
        fs.writeFileSync(configPath, JSON.stringify(stationConfig, null, 2));
        
        // Speichere fehlerhafte Werte
        const errorPath = path.join(tempDir, `validierung_details_${stationId}_temp_fehlerhafte_werte.json`);
        const errorData = {
            zeitraum: `${dashboardData.zeitraum.von} bis ${dashboardData.zeitraum.bis}`,
            anzahl_fehler: dashboardData.fehlerhafte_werte.length,
            fehlerhafte_werte: dashboardData.fehlerhafte_werte
        };
        fs.writeFileSync(errorPath, JSON.stringify(errorData, null, 2));
        
        // Text-Bericht generieren
        const textReport = generateTextReport(dashboardData);
        const textReportPath = path.join(tempDir, `validierung_details_${stationId}_temp.txt`);
        fs.writeFileSync(textReportPath, textReport);
        
        // 3. Python-Skript angepasst
        return new Promise((resolve, reject) => {
            const pythonScript = `
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Monkey-patch die config_file mit unseren DB-Werten
import config_file

# Lade Station-Config
with open("${configPath.replace(/\\/g, '/')}", 'r', encoding='utf-8') as f:
    station_config = json.load(f)

# Überschreibe die VALIDATION_RULES
if 'validation_rules' in station_config:
    config_file.VALIDATION_RULES = station_config['validation_rules']

# Überschreibe STATIONS
if 'station' in station_config:
    s = station_config['station']
    config_file.STATIONS = {
        "${stationId}": {
            'name': s.get('station_name', 'Unbekannt'),
            'gemeinde': s.get('gemeinde', 'Unbekannt'),
            'typ': s.get('see_typ', 'unbekannt'),
            'max_tiefe': float(s.get('max_tiefe_meter', 0)) if s.get('max_tiefe_meter') else 0,
            'koordinaten': {
                'lat': float(s.get('latitude', 54.0)) if s.get('latitude') else 54.0,
                'lng': float(s.get('longitude', 13.0)) if s.get('longitude') else 13.0
            },
            'einzugsgebiet': {
                'agrar_anteil': int(s.get('agrar_anteil_prozent', 0)) if s.get('agrar_anteil_prozent') else 0,
                'wald_anteil': int(s.get('wald_anteil_prozent', 0)) if s.get('wald_anteil_prozent') else 0,
                'siedlung_anteil': int(s.get('siedlung_anteil_prozent', 0)) if s.get('siedlung_anteil_prozent') else 0
            }
        }
    }

# Jetzt importiere den Generator
from html_dashboard_generator import generate_html_dashboard

# Lade die Analyse-Daten
with open("${analysisPath.replace(/\\/g, '/')}", 'r', encoding='utf-8') as f:
    analysis_results = json.load(f)

# Generiere Dashboard (ohne station_metadata Parameter!)
dashboard_path = generate_html_dashboard(
    analysis_results, 
    "${tempDir.replace(/\\/g, '/')}", 
    "${stationId}"
)

print(dashboard_path)
`;
            
            const scriptPath = path.join(__dirname, 'temp_generate_dashboard.py');
            fs.writeFileSync(scriptPath, pythonScript);
            
            let pythonExecutable;
            if (process.env.NODE_ENV === 'production') {
                pythonExecutable = 'python3';
            } else {
                const venvPath = path.resolve(__dirname, '..', '..', '..', 'WAMO-Daten', 'daten_pipeline', 'venv');
                pythonExecutable = process.platform === 'win32' 
                    ? path.join(venvPath, 'Scripts', 'python.exe')
                    : path.join(venvPath, 'bin', 'python');
            }
            
            const pythonProcess = spawn(pythonExecutable, [scriptPath], {
                cwd: __dirname,
                env: { ...process.env, PYTHONIOENCODING: 'UTF-8' }
            });
            
            let dashboardPath = '';
            let errorOutput = '';
            
            pythonProcess.stdout.on('data', (data) => {
                dashboardPath += data.toString();
            });
            
            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
                console.error('[Python Error]:', data.toString());
            });
            
            pythonProcess.on('close', (code) => {
                if (fs.existsSync(scriptPath)) {
                    fs.unlinkSync(scriptPath);
                }
                
                if (code !== 0) {
                    reject(new Error(`Python-Fehler: ${errorOutput}`));
                } else {
                    const htmlFiles = fs.readdirSync(tempDir).filter(f => f.endsWith('.html'));
                    if (htmlFiles.length > 0) {
                        const html = fs.readFileSync(path.join(tempDir, htmlFiles[0]), 'utf-8');
                        fs.rmSync(tempDir, { recursive: true, force: true });
                        resolve(html);
                    } else {
                        reject(new Error(`Dashboard-HTML nicht gefunden`));
                    }
                }
            });
        });
        
    } catch (error) {
        console.error('Fehler beim Generieren des Dashboards aus DB:', error);
        throw error;
    }
}

// Text-Bericht Generator
function generateTextReport(dashboardData) {
    let report = `VALIDIERUNGSBERICHT
====================

Zeitraum: ${dashboardData.zeitraum.von} bis ${dashboardData.zeitraum.bis}

ZUSAMMENFASSUNG
---------------
Status: ${dashboardData.zusammenfassung.status || 'Unbekannt'}

`;

    if (dashboardData.zusammenfassung.hauptprobleme?.length > 0) {
        report += 'Hauptprobleme:\n';
        dashboardData.zusammenfassung.hauptprobleme.forEach(p => {
            report += `- ${p}\n`;
        });
        report += '\n';
    }

    if (dashboardData.fehlerhafte_werte.length > 0) {
        report += `\nFEHLERHAFTE WERTE (${dashboardData.fehlerhafte_werte.length})\n`;
        report += '-'.repeat(50) + '\n';
        dashboardData.fehlerhafte_werte.forEach(f => {
            report += `${f.timestamp}: ${f.parameter} = ${f.value} (${f.flag_name})\n`;
        });
    }

    return report;
}

module.exports = { generateDashboardFromDB };