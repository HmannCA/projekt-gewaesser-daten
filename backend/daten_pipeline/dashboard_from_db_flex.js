// dashboard_from_db_flex.js
// Flexible Version mit Zeitraumauswahl
const { getDashboardDataByDateRange, getStationConfig } = require('../db/postgres');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

async function generateFlexibleDashboardFromDB(stationId, startDate, endDate) {
    try {
        // NEU: Wenn keine Daten angegeben, hole verfügbaren Zeitraum
        if (!startDate || !endDate) {
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            
            try {
                const dateRangeResult = await pool.query(
                    `SELECT 
                        TO_CHAR(MIN(date), 'YYYY-MM-DD') as min_date, 
                        TO_CHAR(MAX(date), 'YYYY-MM-DD') as max_date 
                     FROM daily_aggregations 
                     WHERE station_id = $1`,
                    [stationId]
                );
                
                if (dateRangeResult.rows[0].min_date) {
                    startDate = startDate || dateRangeResult.rows[0].min_date;
                    endDate = endDate || dateRangeResult.rows[0].max_date;
                } else {
                    // Keine Daten vorhanden - verwende aktuelle Woche als Fallback
                    const now = new Date();
                    endDate = endDate || now.toISOString().split('T')[0];
                    now.setDate(now.getDate() - 7);
                    startDate = startDate || now.toISOString().split('T')[0];
                }
            } finally {
                await pool.end();
            }
        }
        
        console.log(`Generiere flexibles Dashboard für Station ${stationId} vom ${startDate} bis ${endDate}...`);
        
        // 1. Hole Daten aus DB für den gewählten Zeitraum
        const [dashboardData, stationConfig] = await Promise.all([
            getDashboardDataByDateRange(stationId, startDate, endDate),
            getStationConfig(stationId)
        ]);
        
        if (dashboardData.error) {
            throw new Error(dashboardData.error);
        }

        // KORREKTUR: Stelle sicher, dass die Zeitraum-Daten korrekt sind
        if (dashboardData.basis_validierung && Object.keys(dashboardData.basis_validierung).length > 0) {
            const allDates = Object.keys(dashboardData.basis_validierung).sort();
            dashboardData.zeitraum.von = allDates[0];
            dashboardData.zeitraum.bis = allDates[allDates.length - 1];
            console.log(`Korrigierter Zeitraum: ${dashboardData.zeitraum.von} bis ${dashboardData.zeitraum.bis}`);
        }
        
        // NEU: Prüfe ob überhaupt Daten vorhanden sind
        const hasData = dashboardData.basis_validierung && 
                       Object.keys(dashboardData.basis_validierung).length > 0;
        
        if (!hasData) {
            // Generiere eine Info-Seite statt eines leeren Dashboards
            return generateNoDataPage(stationId, startDate, endDate, stationConfig);
        }
        
        // 2. Erstelle temporäre Dateien (gleich wie in dashboard_from_db.js)
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
        
        // 3. Python-Skript angepasst (NEU: mit Zeitraum-Info im Header)
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

# NEU: Füge Hinweis zum gewählten Zeitraum hinzu
analysis_results['flexible_timerange'] = {
    'start': "${startDate}",
    'end': "${endDate}",
    'is_custom': True
}

# Generiere Dashboard
dashboard_path = generate_html_dashboard(
    analysis_results, 
    "${tempDir.replace(/\\/g, '/')}", 
    "${stationId}"
)

print(dashboard_path)
`;
            
            const scriptPath = path.join(__dirname, 'temp_generate_dashboard_flex.py');
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
                        let html = fs.readFileSync(path.join(tempDir, htmlFiles[0]), 'utf-8');
                        
                        // NEU: Füge Zeitraum-Selektor zum HTML hinzu
                        html = addTimeRangeSelector(html, stationId, startDate, endDate);
                        
                        fs.rmSync(tempDir, { recursive: true, force: true });
                        resolve(html);
                    } else {
                        reject(new Error(`Dashboard-HTML nicht gefunden`));
                    }
                }
            });
        });
        
    } catch (error) {
        console.error('Fehler beim Generieren des flexiblen Dashboards aus DB:', error);
        throw error;
    }
}

// NEU: Fügt einen Zeitraum-Selektor zum Dashboard hinzu
function addTimeRangeSelector(html, currentStation, currentStart, currentEnd) {
    // Füge CSS für den Selektor hinzu
    const selectorCSS = `
    <style>
        .time-range-selector {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .time-range-selector label {
            font-weight: bold;
            color: #333;
        }
        
        .time-range-selector input[type="date"] {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
        }
        
        .time-range-selector input[type="date"]:invalid {
            border-color: #dc3545;
            background-color: #fff5f5;
        }
        
        .time-range-selector button {
            padding: 8px 20px;
            background: #0066CC;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            transition: background 0.3s;
        }
        
        .time-range-selector button:hover {
            background: #0052a3;
        }
        
        .quick-select {
            display: flex;
            gap: 10px;
        }
        
        .quick-select button {
            padding: 6px 15px;
            background: #f0f0f0;
            color: #333;
            font-size: 0.9em;
        }
        
        .quick-select button:hover {
            background: #e0e0e0;
        }
        
        .station-selector {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .station-selector select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
            min-width: 250px;
        }
        
        #dataRangeInfo {
            background: #e3f2fd;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #64b5f6;
        }
        
        #noDataMessage {
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    </style>
    `;
    
    // Füge den Selektor-HTML hinzu
    const selectorHTML = `
    <div class="time-range-selector">
        <div class="station-selector">
            <label for="stationSelect">Station:</label>
            <select id="stationSelect">
                <option value="${currentStation}">${currentStation}</option>
            </select>
        </div>
        
        <label for="startDate">Von:</label>
        <input type="date" id="startDate" value="${currentStart}">
        
        <label for="endDate">Bis:</label>
        <input type="date" id="endDate" value="${currentEnd}">
        
        <button onclick="updateDashboard()">Aktualisieren</button>
        
        <div class="quick-select">
            <button onclick="selectLastDays(7)">Letzte 7 Tage</button>
            <button onclick="selectLastDays(30)">Letzte 30 Tage</button>
            <button onclick="selectLastDays(90)">Letzte 90 Tage</button>
        </div>
        
        <div id="dataRangeInfo" style="width: 100%; margin-top: 10px; font-size: 0.9em; color: #666; text-align: center;"></div>
    </div>
    
    <div id="noDataMessage" style="display: none; background: #fff3cd; color: #856404; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
        <strong>Keine Daten verfügbar</strong><br>
        Für die gewählte Station und den gewählten Zeitraum sind keine Messdaten vorhanden.
    </div>
    
    <script>
        // Lade verfügbare Stationen MIT Datumsbereichen beim Start
        let stationDataRanges = {};
        
        fetch('/api/stations-with-data')
            .then(res => res.json())
            .then(data => {
                const select = document.getElementById('stationSelect');
                select.innerHTML = '';
                
                data.forEach(station => {
                    // Speichere Datumsbereiche
                    stationDataRanges[station.station_code] = {
                        min_date: station.min_date,
                        max_date: station.max_date,
                        data_days: station.data_days
                    };
                    
                    const option = document.createElement('option');
                    option.value = station.station_code;
                    option.textContent = station.station_name + ' (' + station.station_code + ') - ' + 
                                         station.data_days + ' Tage Daten';
                    if (station.station_code === '${currentStation}') {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                
                // Setze Datumsgrenzen für aktuelle Station
                updateDateLimits('${currentStation}');
            });
        
        // Aktualisiere Datumsgrenzen bei Stationswechsel
        document.getElementById('stationSelect').addEventListener('change', function() {
            updateDateLimits(this.value);
        });
        
        function updateDateLimits(stationCode) {
            if (stationDataRanges[stationCode]) {
                const range = stationDataRanges[stationCode];
                const startInput = document.getElementById('startDate');
                const endInput = document.getElementById('endDate');
                
                // Setze min/max Attribute
                startInput.min = range.min_date;
                startInput.max = range.max_date;
                endInput.min = range.min_date;
                endInput.max = range.max_date;
                
                // Zeige Info über verfügbare Daten
                const infoDiv = document.getElementById('dataRangeInfo');
                if (infoDiv) {
                    infoDiv.innerHTML = 'Verfügbare Daten: ' + 
                        new Date(range.min_date).toLocaleDateString('de-DE') + ' bis ' + 
                        new Date(range.max_date).toLocaleDateString('de-DE');
                }
                
                // Korrigiere aktuelle Werte falls außerhalb
                if (startInput.value < range.min_date) startInput.value = range.min_date;
                if (startInput.value > range.max_date) startInput.value = range.max_date;
                if (endInput.value < range.min_date) endInput.value = range.min_date;
                if (endInput.value > range.max_date) endInput.value = range.max_date;
            }
        }
        
        function updateDashboard() {
            const station = document.getElementById('stationSelect').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (station && startDate && endDate) {
                // Validiere ob Daten vorhanden sind
                if (stationDataRanges[station]) {
                    const range = stationDataRanges[station];
                    
                    // Prüfe ob gewählter Zeitraum im verfügbaren Bereich liegt
                    if (startDate < range.min_date || endDate > range.max_date) {
                        alert('Der gewählte Zeitraum liegt außerhalb der verfügbaren Daten!\\n\\n' +
                              'Verfügbare Daten: ' + 
                              new Date(range.min_date).toLocaleDateString('de-DE') + ' bis ' + 
                              new Date(range.max_date).toLocaleDateString('de-DE'));
                        return;
                    }
                }
                
                // Lade neues Dashboard
                window.location.href = '/api/dashboard-flex-html/' + station + 
                    '?startDate=' + startDate + '&endDate=' + endDate;
            }
        }
        
        function selectLastDays(days) {
            const station = document.getElementById('stationSelect').value;
            
            if (stationDataRanges[station]) {
                const range = stationDataRanges[station];
                const maxDate = new Date(range.max_date);
                const minDate = new Date(range.min_date);
                
                // Berechne Start basierend auf verfügbaren Daten
                let endDate = maxDate;
                let startDate = new Date(maxDate);
                startDate.setDate(startDate.getDate() - days);
                
                // Stelle sicher, dass wir nicht vor den ersten Daten sind
                if (startDate < minDate) {
                    startDate = minDate;
                }
                
                document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
                document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
            } else {
                // Fallback für alte Funktionalität
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
                
                document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
                document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
            }
        }
        
        // Enter-Taste triggert Update
        document.getElementById('startDate').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') updateDashboard();
        });
        document.getElementById('endDate').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') updateDashboard();
        });
    </script>
    `;
    
    // Füge CSS und Selektor nach dem Header ein
    html = html.replace('</head>', selectorCSS + '</head>');
    html = html.replace('<div class="status-alert', selectorHTML + '<div class="status-alert');
    
    return html;
}

// Text-Bericht Generator (gleich wie in dashboard_from_db.js)
function generateTextReport(dashboardData) {
    let report = `VALIDIERUNGSBERICHT
====================

Zeitraum: ${formatDateGermanFromString(dashboardData.zeitraum.von)} bis ${formatDateGermanFromString(dashboardData.zeitraum.bis)}

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
            const dateTime = formatDateTimeGermanFromString(f.timestamp);
            report += `${dateTime}: ${f.parameter} = ${f.value} (${f.flag_name})\n`;
        });
    }

    return report;
}

// Hilfsfunktionen für sichere Datumsformatierung
function formatDateGermanFromString(dateString) {
    if (!dateString) return '-';
    // Erwarte Format: YYYY-MM-DD oder YYYY-MM-DDTHH:MM:SS
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}.${month}.${year}`;
}

function formatDateTimeGermanFromString(dateTimeString) {
    if (!dateTimeString) return '-';
    const [datePart, timePart] = dateTimeString.split('T');
    const [year, month, day] = datePart.split('-');
    if (timePart) {
        const [hour, minute] = timePart.split(':');
        return `${day}.${month}.${year} ${hour}:${minute}`;
    }
    return `${day}.${month}.${year}`;
}

// NEU: Generiere eine informative Seite wenn keine Daten vorhanden sind
function generateNoDataPage(stationId, startDate, endDate, stationConfig) {
    const stationName = stationConfig.station?.station_name || stationId;
    
    const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Keine Daten verfügbar - ${stationName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: #f5f5f5;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
            }
            .header {
                background: #0066CC;
                color: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
            }
            .info-box {
                background: #fff3cd;
                color: #856404;
                padding: 30px;
                border-radius: 10px;
                margin: 30px 0;
                text-align: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .info-box h2 {
                margin-top: 0;
            }
            .time-range-selector {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .button {
                padding: 10px 20px;
                background: #0066CC;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin: 10px;
            }
            .button:hover {
                background: #0052a3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>WAMO Gewässermonitoring</h1>
                <p>Station: ${stationName}</p>
            </div>
            
            <div class="info-box">
                <h2>📊 Keine Messdaten verfügbar</h2>
                <p><strong>Gewählter Zeitraum:</strong><br>
                ${new Date(startDate).toLocaleDateString('de-DE')} bis ${new Date(endDate).toLocaleDateString('de-DE')}</p>
                <p>Für diesen Zeitraum liegen keine Messdaten vor.</p>
                
                <div style="margin-top: 30px;">
                    <a href="/api/stations-overview" class="button">Zur Stationsübersicht</a>
                    <button class="button" onclick="window.history.back()">Zurück</button>
                </div>
            </div>
            
            ${addTimeRangeSelector('', stationId, startDate, endDate)}
        </div>
    </body>
    </html>
    `;
    
    return html;
}

module.exports = { generateFlexibleDashboardFromDB };