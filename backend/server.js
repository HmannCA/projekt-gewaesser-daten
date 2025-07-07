// SERVER.JS - VERSION 4.0 - FINAL, VOLLSTÄNDIG & KORREKT (mit korrigierter Reihenfolge)

console.log('=== SERVER.JS VERSION 4.0 - FINAL ===');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
require('dotenv').config();
const decompress = require('decompress');
const pool = require('./db/pool');

const {
    testConnection,
    createDatabaseTables,
    saveValidationData,
    getLatestValidationData,
    logUserLogin,
    getAllTableData
} = require('./db/postgres');

console.log('GELADENE DATABASE_URL:', process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Temporäre Endpunkte (unverändert)
app.get('/api/setup-database-bitte-loeschen', async (req, res) => {
    console.log('Datenbank-Setup wird aufgerufen...');
    const result = await createDatabaseTables();
    if (result.success) {
        res.status(200).send(`<h1>Erfolg!</h1><p>${result.message}</p>`);
    } else {
        res.status(500).send(`<h1>Fehler!</h1><p>${result.message}</p>`);
    }
});

// MIT DIESEM BLOCK (mit erweitertem Logging):
app.get('/api/show-db-content', async (req, res) => {
    try {
        console.log('Anfrage zum Anzeigen des gesamten DB-Inhalts erhalten...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL); // DEBUG
        const data = await getAllTableData();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('FEHLER in getAllTableData:', error.message); // DEBUG
        console.error('Stack:', error.stack); // DEBUG
        res.status(500).json({ error: error.message });
    }
});

// NEU: Dashboard-Daten aus DB abrufen
app.get('/api/dashboard/:stationId', async (req, res) => {
    try {
        const { stationId } = req.params;
        const { date } = req.query; // Optional: ?date=2024-01-15
        
        console.log(`Lade Dashboard-Daten für Station ${stationId}...`);
        
        const { getDashboardData } = require('./db/postgres');
        const dashboardData = await getDashboardData(stationId, date);
        
        if (dashboardData.error) {
            return res.status(404).json(dashboardData);
        }
        
        res.json(dashboardData);
    } catch (error) {
        console.error('Fehler beim Abrufen der Dashboard-Daten:', error);
        res.status(500).json({ error: error.message });
    }
});

// NEU: Dashboard-HTML direkt aus DB generieren
app.get('/api/dashboard-html/:stationId', async (req, res) => {
    try {
        const { stationId } = req.params;
        console.log(`Generiere Dashboard-HTML für Station ${stationId} aus DB...`);
        
        // Dashboard aus DB generieren
        const { generateDashboardFromDB } = require('./daten_pipeline/dashboard_from_db');
        const html = await generateDashboardFromDB(stationId);
        
        // HTML zurückgeben
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
        
    } catch (error) {
        console.error('Fehler beim Generieren des Dashboard-HTML:', error);
        res.status(500).json({ error: error.message });
    }
});

// DEBUG: Zeige alle Validierungsläufe
app.get('/api/debug/runs/:stationId', async (req, res) => {
    //const pool = require('./db/pool');
    
    try {
        const result = await pool.query(
            `SELECT run_id, station_id, run_timestamp, source_zip_file 
             FROM validation_runs 
             WHERE station_id = $1 
             ORDER BY run_timestamp DESC`,
            [req.params.stationId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Flexibles Dashboard mit Datum-Auswahl
app.get('/api/dashboard-flex/:stationId', async (req, res) => {
    try {
        const { stationId } = req.params;
        const { startDate, endDate } = req.query;
        
        // Default: Letzte 7 Tage
        const end = endDate || new Date().toISOString().split('T')[0];
        const start = startDate || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
        
        console.log(`Generiere flexibles Dashboard für ${stationId} vom ${start} bis ${end}`);
        
        const { getDashboardDataByDateRange } = require('./db/postgres');
        const dashboardData = await getDashboardDataByDateRange(stationId, start, end);
        
        res.json(dashboardData);
    } catch (error) {
        console.error('Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// HTML-Version des flexiblen Dashboards
app.get('/api/dashboard-flex-html/:stationId', async (req, res) => {
    try {
        const { stationId } = req.params;
        const { startDate, endDate } = req.query;
        
        // Default: Letzte 7 Tage
        const end = endDate || new Date().toISOString().split('T')[0];
        const start = startDate || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
        
        console.log(`Generiere flexibles Dashboard-HTML für ${stationId} vom ${start} bis ${end}`);
        
        // Modifiziere dashboard_from_db.js um diese Funktion zu nutzen
        const { generateFlexibleDashboardFromDB } = require('./daten_pipeline/dashboard_from_db_flex');
        const html = await generateFlexibleDashboardFromDB(stationId, start, end);
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
        
    } catch (error) {
        console.error('Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// API für Station-Liste
app.get('/api/stations', async (req, res) => {
    // const pool = require('./db/pool');
    
    try {
        const result = await pool.query(
            `SELECT DISTINCT s.station_code, s.station_name 
             FROM stations s
             JOIN daily_aggregations da ON s.station_code = da.station_id
             ORDER BY s.station_code`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API für Station-Liste MIT verfügbaren Datumsbereichen
app.get('/api/stations-with-data', async (req, res) => {
    // const pool = require('./db/pool');
    
    try {
        const result = await pool.query(
            `SELECT 
                s.station_code, 
                s.station_name,
                MIN(da.date)::text as min_date,
                MAX(da.date)::text as max_date,
                COUNT(DISTINCT da.date) as data_days
             FROM stations s
             JOIN daily_aggregations da ON s.station_code = da.station_id
             GROUP BY s.station_code, s.station_name
             HAVING COUNT(DISTINCT da.date) > 0
             ORDER BY s.station_code`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
});

// Optionaler Endpunkt für eine Übersichtsseite aller Stationen
app.get('/api/stations-overview', async (req, res) => {
    // const pool = require('./db/pool');
    
    try {
        const result = await pool.query(
            `SELECT 
                s.station_code, 
                s.station_name,
                s.gemeinde,
                MIN(da.date)::text as first_data,
                MAX(da.date)::text as last_data,
                COUNT(DISTINCT da.date) as total_days,
                MAX(da.date)::date - MIN(da.date)::date + 1 as span_days,
                ROUND(COUNT(DISTINCT da.date)::numeric / 
                      NULLIF(MAX(da.date)::date - MIN(da.date)::date + 1, 0) * 100, 1) as coverage_percent
             FROM stations s
             LEFT JOIN daily_aggregations da ON s.station_code = da.station_id
             GROUP BY s.station_code, s.station_name, s.gemeinde
             ORDER BY s.station_code`
        );
        
        // Generiere eine HTML-Übersicht
        let html = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>WAMO Stationsübersicht</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; }
                h1 { color: #0066CC; }
                table { width: 100%; background: white; border-collapse: collapse; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #0066CC; color: white; }
                tr:hover { background: #f5f5f5; }
                .no-data { color: #999; }
                .good { color: #28a745; }
                .warning { color: #ffc107; }
                .bad { color: #dc3545; }
                .button { 
                    display: inline-block; 
                    padding: 6px 12px; 
                    background: #0066CC; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-size: 0.9em;
                }
                .button:hover { background: #0052a3; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>WAMO Gewässermonitoring - Stationsübersicht</h1>
                <p>Stand: ${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString('de-DE')}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Station</th>
                            <th>Name</th>
                            <th>Gemeinde</th>
                            <th>Erste Daten</th>
                            <th>Letzte Daten</th>
                            <th>Tage mit Daten</th>
                            <th>Abdeckung</th>
                            <th>Aktion</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        result.rows.forEach(row => {
            const hasData = row.first_data !== null;
            const coverageClass = row.coverage_percent > 80 ? 'good' : 
                                 row.coverage_percent > 50 ? 'warning' : 'bad';
            
            // Konvertiere YYYY-MM-DD zu deutschem Format
            const formatDateDE = (dateStr) => {
                if (!dateStr) return '-';
                const [year, month, day] = dateStr.split('-');
                return `${day}.${month}.${year}`;
            };
            
            html += `
                <tr>
                    <td><strong>${row.station_code}</strong></td>
                    <td>${row.station_name}</td>
                    <td>${row.gemeinde || '-'}</td>
                    <td class="${hasData ? '' : 'no-data'}">
                        ${hasData ? formatDateDE(row.first_data) : 'Keine Daten'}
                    </td>
                    <td class="${hasData ? '' : 'no-data'}">
                        ${hasData ? formatDateDE(row.last_data) : '-'}
                    </td>
                    <td>${row.total_days || 0}</td>
                    <td class="${hasData ? coverageClass : 'no-data'}">
                        ${hasData && row.coverage_percent !== null ? row.coverage_percent + '%' : '-'}
                    </td>
                    <td>
                        ${hasData ? 
                            `<a href="/api/dashboard-flex-html/${row.station_code}?startDate=${row.first_data}&endDate=${row.last_data}" class="button">Dashboard</a>` :
                            '<span class="no-data">-</span>'
                        }
                    </td>
                </tr>`;
        });
        
        html += `
                    </tbody>
                </table>
                
                <div style="margin-top: 20px; padding: 20px; background: #e3f2fd; border-radius: 10px;">
                    <h3>Legende:</h3>
                    <p><strong>Abdeckung:</strong> Prozentsatz der Tage mit Daten im Zeitraum zwischen ersten und letzten Messungen</p>
                    <p>
                        <span class="good">●</span> Gut (>80%) &nbsp;&nbsp;
                        <span class="warning">●</span> Mittel (50-80%) &nbsp;&nbsp;
                        <span class="bad">●</span> Gering (<50%)
                    </p>
                </div>
            </div>
        </body>
        </html>`;
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
});

// Stündliche Messwerte als HTML-Tabelle anzeigen
app.get('/api/hourly-measurements/:stationId', async (req, res) => {
    // const pool = require('./db/pool');
    
    try {
        const { stationId } = req.params;
        const { date, parameter } = req.query;
        
        // NEU: Lade alle verfügbaren Stationen
        const stationsResult = await pool.query(
            `SELECT DISTINCT s.station_code, s.station_name 
             FROM stations s
             JOIN hourly_measurements hm ON s.station_code = hm.station_id
             ORDER BY s.station_code`
        );
        
        // NEU: Lade alle verfügbaren Parameter für diese Station
        const parametersResult = await pool.query(
            `SELECT DISTINCT parameter 
             FROM hourly_measurements 
             WHERE station_id = $1 
             ORDER BY parameter`,
            [stationId]
        );
        
        // Basis-Query
        let query = `
            SELECT 
                timestamp AT TIME ZONE 'Europe/Berlin' as local_time,
                parameter,
                raw_value,
                validated_value,
                validation_flag,
                validation_reason,
                applied_rules
            FROM hourly_measurements
            WHERE station_id = $1
        `;
        
        const params = [stationId];
        
        // Optional: Nach Datum filtern
        if (date) {
            query += ` AND DATE(timestamp AT TIME ZONE 'Europe/Berlin') = $${params.length + 1}`;
            params.push(date);
        }
        
        // Optional: Nach Parameter filtern
        if (parameter) {
            query += ` AND parameter = $${params.length + 1}`;
            params.push(parameter);
        }
        
        query += ` ORDER BY timestamp DESC, parameter LIMIT 500`;
        
        const result = await pool.query(query, params);
        
        // NEU: Finde aktuelle Station für die Anzeige
        const currentStation = stationsResult.rows.find(s => s.station_code === stationId) || { station_name: 'Unbekannt' };
        
        // Generiere HTML-Tabelle
        let html = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Stündliche Messwerte - ${currentStation.station_name} (${stationId})</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    background: #f5f5f5; 
                }
                .header {
                    background: #0066CC;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }
                .filters {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .filter-row {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 15px;
                }
                table { 
                    width: 100%; 
                    background: white; 
                    border-collapse: collapse; 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                th, td { 
                    padding: 10px; 
                    text-align: left; 
                    border-bottom: 1px solid #ddd; 
                }
                th { 
                    background: #0066CC; 
                    color: white; 
                    position: sticky;
                    top: 0;
                }
                tr:hover { background: #f5f5f5; }
                .flag-1 { background: #d4edda; color: #155724; }
                .flag-3 { background: #fff3cd; color: #856404; }
                .flag-4 { background: #f8d7da; color: #721c24; }
                .flag-9 { background: #e2e3e5; color: #383d41; }
                .value-changed { font-weight: bold; color: #dc3545; }
                .stuck-value { background: #ffe5b4; }
                input, select { 
                    padding: 8px; 
                    margin: 5px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                select {
                    min-width: 200px;
                }
                button {
                    padding: 8px 15px;
                    background: #0066CC;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover { background: #0052a3; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Stündliche Messwerte - ${currentStation.station_name}</h1>
                <p>Station: ${stationId} | Anzahl Datensätze: ${result.rows.length}</p>
            </div>
            
            <div class="filters">
                <form method="get" id="filterForm">
                    <div class="filter-row">
                        <label>Station: 
                            <select name="station" onchange="changeStation(this.value)">`;
        
        // NEU: Stations-Dropdown
        stationsResult.rows.forEach(station => {
            const selected = station.station_code === stationId ? 'selected' : '';
            html += `<option value="${station.station_code}" ${selected}>${station.station_name} (${station.station_code})</option>`;
        });
        
        html += `
                            </select>
                        </label>
                        
                        <label>Datum: 
                            <input type="date" name="date" value="${date || ''}">
                        </label>
                        
                        <label>Parameter: 
                            <select name="parameter">
                                <option value="">Alle Parameter</option>`;
        
        // NEU: Dynamisches Parameter-Dropdown
        parametersResult.rows.forEach(param => {
            const selected = parameter === param.parameter ? 'selected' : '';
            html += `<option value="${param.parameter}" ${selected}>${param.parameter}</option>`;
        });
        
        html += `
                            </select>
                        </label>
                    </div>
                    <div class="filter-row">
                        <button type="submit">Filtern</button>
                        <button type="button" onclick="resetFilters()">Zurücksetzen</button>
                        <a href="/api/stations-overview"><button type="button">Zur Übersicht</button></a>
                    </div>
                </form>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Zeit (Lokal)</th>
                        <th>Parameter</th>
                        <th>Rohwert</th>
                        <th>Validiert</th>
                        <th>Änderung</th>
                        <th>Flag</th>
                        <th>Grund</th>
                        <th>Grenzwerte</th>
                    </tr>
                </thead>
                <tbody>`;
        
        // Gruppiere nach Parameter für Änderungserkennung
        const parameterGroups = {};
        result.rows.forEach(row => {
            if (!parameterGroups[row.parameter]) {
                parameterGroups[row.parameter] = [];
            }
            parameterGroups[row.parameter].push(row);
        });
        
        // Zeige Daten mit Änderungsmarkierung
        result.rows.forEach((row, index) => {
            const localTime = new Date(row.local_time).toLocaleString('de-DE');
            const flagClass = `flag-${row.validation_flag}`;
            const flagName = getFlagName(row.validation_flag);
            
            // Sichere Konvertierung zu Zahlen
            const rawValue = row.raw_value !== null ? parseFloat(row.raw_value) : null;
            const validatedValue = row.validated_value !== null ? parseFloat(row.validated_value) : null;
            
            // Prüfe ob sich der Wert geändert hat
            let valueChange = '';
            let rowClass = '';
            
            // Finde vorherigen Wert für diesen Parameter
            const paramData = parameterGroups[row.parameter];
            const currentIndex = paramData.findIndex(r => r === row);
            if (currentIndex > 0 && validatedValue !== null) {
                const prevValueRaw = paramData[currentIndex - 1].validated_value;
                if (prevValueRaw !== null) {
                    const prevValue = parseFloat(prevValueRaw);
                    const change = validatedValue - prevValue;
                    if (Math.abs(change) > 0.001) { // Kleine Toleranz für Rundungsfehler
                        valueChange = `<span class="value-changed">${change > 0 ? '+' : ''}${change.toFixed(2)}</span>`;
                    } else {
                        rowClass = 'stuck-value';
                    }
                }
            }
            
            // Prüfe ob "stuck value"
            if (row.validation_reason && row.validation_reason.includes('unverändert')) {
                rowClass = 'stuck-value';
            }
            
            // Formatiere die angewendeten Regeln
            let rulesDisplay = '-';
            if (row.applied_rules) {
                try {
                    const rules = typeof row.applied_rules === 'string' 
                        ? JSON.parse(row.applied_rules) 
                        : row.applied_rules;
                    
                    if (rules && rules.range && (rules.range.min !== undefined || rules.range.max !== undefined)) {
                        const minVal = rules.range.min !== undefined ? rules.range.min : '-';
                        const maxVal = rules.range.max !== undefined ? rules.range.max : '-';
                        rulesDisplay = `${minVal} - ${maxVal}`;
                        
                        if (rules.spike) {
                            rulesDisplay += `<br>Spike: ±${rules.spike}`;
                        }
                    }
                } catch (e) {
                    console.error('Fehler beim Parsen der applied_rules:', e);
                    rulesDisplay = '-';
                }
            }
            
            html += `
                <tr class="${rowClass}">
                    <td>${localTime}</td>
                    <td>${row.parameter}</td>
                    <td>${rawValue !== null ? rawValue.toFixed(2) : '-'}</td>
                    <td>${validatedValue !== null ? validatedValue.toFixed(2) : '-'}</td>
                    <td>${valueChange}</td>
                    <td class="${flagClass}">${flagName}</td>
                    <td>${row.validation_reason || '-'}</td>
                    <td style="font-size: 0.9em;">${rulesDisplay}</td>
                </tr>`;
        });
        
        html += `
                </tbody>
            </table>
            
            <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 10px;">
                <h3>Legende:</h3>
                <p>
                    <span style="display: inline-block; width: 20px; height: 20px; background: #d4edda;"></span> Gut (Flag 1) &nbsp;&nbsp;
                    <span style="display: inline-block; width: 20px; height: 20px; background: #fff3cd;"></span> Verdächtig (Flag 3) &nbsp;&nbsp;
                    <span style="display: inline-block; width: 20px; height: 20px; background: #f8d7da;"></span> Schlecht (Flag 4) &nbsp;&nbsp;
                    <span style="display: inline-block; width: 20px; height: 20px; background: #e2e3e5;"></span> Fehlend (Flag 9)
                </p>
                <p>
                    <span style="display: inline-block; width: 20px; height: 20px; background: #ffe5b4;"></span> Stuck Value (Wert unverändert)
                </p>
            </div>
            
            <div style="margin-top: 20px;">
                <a href="/api/hourly-measurements-csv/${stationId}?date=${date || ''}&parameter=${parameter || ''}">
                    <button>Als CSV exportieren</button>
                </a>
            </div>
            
            <script>
                function changeStation(stationCode) {
                    if (stationCode) {
                        // Behalte die aktuellen Filter-Werte
                        const currentParams = new URLSearchParams(window.location.search);
                        const date = currentParams.get('date') || '';
                        // Parameter zurücksetzen, da verschiedene Stationen unterschiedliche Parameter haben können
                        window.location.href = '/api/hourly-measurements/' + stationCode + '?date=' + date;
                    }
                }
                
                function resetFilters() {
                    const stationSelect = document.querySelector('select[name="station"]');
                    const currentStation = stationSelect.value;
                    window.location.href = '/api/hourly-measurements/' + currentStation;
                }
            </script>
        </body>
        </html>`;
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
});

// Hilfsfunktion für Flag-Namen
function getFlagName(flag) {
    const names = {
        1: 'GUT',
        2: 'NICHT BEWERTET',
        3: 'VERDÄCHTIG',
        4: 'SCHLECHT',
        9: 'FEHLEND'
    };
    return names[flag] || `Flag ${flag}`;
}

// CSV-Export für stündliche Messwerte
app.get('/api/hourly-measurements-csv/:stationId', async (req, res) => {
    // const pool = require('./db/pool');
    
    try {
        const { stationId } = req.params;
        const { date, parameter } = req.query;
        
        let query = `
            SELECT 
                timestamp AT TIME ZONE 'Europe/Berlin' as local_time,
                parameter,
                raw_value,
                validated_value,
                validation_flag,
                validation_reason
            FROM hourly_measurements
            WHERE station_id = $1
        `;

        const params = [stationId];

        // Optional: Nach Datum filtern (in lokaler Zeit!)
        if (date) {
            query += ` AND DATE(timestamp AT TIME ZONE 'Europe/Berlin') = $${params.length + 1}`;
            params.push(date);
        }

        // Optional: Nach Parameter filtern
        if (parameter) {
            query += ` AND parameter = $${params.length + 1}`;
            params.push(parameter);
        }

        query += ` ORDER BY timestamp DESC, parameter LIMIT 500`;
        
        const result = await pool.query(query, params);
        
        // CSV erstellen
        let csv = 'Zeit;Parameter;Rohwert;Validiert;Flag;Grund\n';
        
        result.rows.forEach(row => {
            const localTime = new Date(row.local_time).toLocaleString('de-DE');
            csv += `${localTime};${row.parameter};${row.raw_value || ''};${row.validated_value || ''};${row.validation_flag};${row.validation_reason || ''}\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="stundenwerte_${stationId}_${date || 'alle'}.csv"`);
        res.send('\ufeff' + csv); // BOM für Excel
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
});

// API: Alle Validierungsparameter abrufen
app.get('/api/validation-parameters', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM validation_parameters 
            WHERE is_active = true 
            ORDER BY parameter_name
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Fehler beim Abrufen der Validierungsparameter:', err);
        res.status(500).json({ error: err.message });
    }
});

// API: Einzelnen Parameter abrufen
app.get('/api/validation-parameters/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM validation_parameters WHERE id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Parameter nicht gefunden' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Parameter aktualisieren (nur für Admins)
app.put('/api/validation-parameters/:id', async (req, res) => {
    const client = await pool.connect();
    
    try {
        // Prüfe Admin-Rechte
        const userEmail = req.body.userEmail;
        if (userEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }
        
        const { id } = req.params;
        const updates = req.body.updates;
        const changeReason = req.body.changeReason;
        
        await client.query('BEGIN');
        
        // Hole alte Werte für Historie
        const oldResult = await client.query(
            'SELECT * FROM validation_parameters WHERE id = $1',
            [id]
        );
        
        if (oldResult.rows.length === 0) {
            throw new Error('Parameter nicht gefunden');
        }
        
        const oldValues = oldResult.rows[0];
        
        // Update Parameter
        const updateResult = await client.query(`
            UPDATE validation_parameters 
            SET gross_range_min = $1,
                gross_range_max = $2,
                climatology_min = $3,
                climatology_max = $4,
                climatology_thresholds = $5,
                notes = $6,
                updated_at = CURRENT_TIMESTAMP,
                updated_by = $7
            WHERE id = $8
            RETURNING *
        `, [
            updates.gross_range_min,
            updates.gross_range_max,
            updates.climatology_min,
            updates.climatology_max,
            updates.climatology_thresholds ? JSON.stringify(updates.climatology_thresholds) : null,
            updates.notes,
            userEmail,
            id
        ]);
        
        // Speichere Historie
        await client.query(`
            INSERT INTO validation_parameter_history 
            (parameter_id, changed_by, old_values, new_values, change_reason)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            id,
            userEmail,
            JSON.stringify(oldValues),
            JSON.stringify(updateResult.rows[0]),
            changeReason
        ]);
        
        await client.query('COMMIT');
        res.json({ 
            success: true, 
            parameter: updateResult.rows[0],
            message: 'Parameter erfolgreich aktualisiert'
        });
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Fehler beim Aktualisieren:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// API: Parameter-Historie abrufen
app.get('/api/validation-parameters/:id/history', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.*, p.parameter_name 
            FROM validation_parameter_history h
            JOIN validation_parameters p ON h.parameter_id = p.id
            WHERE h.parameter_id = $1
            ORDER BY h.change_timestamp DESC
        `, [req.params.id]);
        
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Admin-Übersichtsseite
app.get('/api/validation-parameters-admin', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM validation_parameters 
            ORDER BY parameter_name
        `);
        
        // Generiere HTML-Seite
        let html = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Validierungsparameter - Verwaltung</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    background: #f5f5f5; 
                }
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .header {
                    background: #0066CC;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    background: white;
                    border-collapse: collapse;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background: #f0f0f0;
                    font-weight: bold;
                }
                .edit-btn {
                    background: #0066CC;
                    color: white;
                    padding: 5px 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .edit-btn:hover {
                    background: #0052a3;
                }
                .notes {
                    font-size: 0.9em;
                    color: #666;
                    max-width: 300px;
                }
                .seasonal {
                    background: #e3f2fd;
                    padding: 5px;
                    border-radius: 3px;
                    font-size: 0.9em;
                }
                .modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                }
                .modal-content {
                    background: white;
                    margin: 5% auto;
                    padding: 20px;
                    width: 80%;
                    max-width: 600px;
                    border-radius: 10px;
                }
                .close {
                    float: right;
                    font-size: 28px;
                    cursor: pointer;
                }
                input[type="number"] {
                    width: 100px;
                    padding: 5px;
                    margin: 5px;
                }
                .save-btn {
                    background: #28a745;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                }
                .info-box {
                    background: #fff3cd;
                    color: #856404;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Validierungsparameter - Verwaltung</h1>
                    <p>Grenz- und Schwellenwerte für die Datenvalidierung</p>
                </div>
                
                <div class="info-box">
                    <strong>Hinweis:</strong> Diese Werte werden für die automatische Validierung der Messdaten verwendet. 
                    Änderungen sollten nur nach fachlicher Prüfung vorgenommen werden.
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Einheit</th>
                            <th>Grobe Grenzen</th>
                            <th>Klimatologie</th>
                            <th>Saisonale Werte</th>
                            <th>Notizen</th>
                            <th>Letzte Änderung</th>
                            <th>Aktion</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        result.rows.forEach(param => {
            const updatedAt = new Date(param.updated_at).toLocaleDateString('de-DE');
            const hasSeasonalThresholds = param.climatology_thresholds && 
                                         Object.keys(param.climatology_thresholds).length > 0;
            
            html += `
                <tr>
                    <td><strong>${param.parameter_name}</strong></td>
                    <td>${param.unit || '-'}</td>
                    <td>${param.gross_range_min} - ${param.gross_range_max}</td>
                    <td>${param.climatology_min} - ${param.climatology_max}</td>
                    <td>
                        ${hasSeasonalThresholds ? 
                            '<span class="seasonal">✓ Vorhanden</span>' : 
                            '<span style="color: #999;">-</span>'}
                    </td>
                    <td class="notes">${param.notes || ''}</td>
                    <td>${updatedAt}<br><small>${param.updated_by || ''}</small></td>
                    <td>
                        <button class="edit-btn" onclick="editParameter(${param.id})">
                            Bearbeiten
                        </button>
                    </td>
                </tr>`;
        });
        
        html += `
                    </tbody>
                </table>
                
                <!-- Edit Modal -->
                <div id="editModal" class="modal">
                    <div class="modal-content">
                        <span class="close" onclick="closeModal()">&times;</span>
                        <h2>Parameter bearbeiten</h2>
                        <div id="editForm"></div>
                    </div>
                </div>
            </div>
            
            <script>
                let currentParam = null;
                
                async function editParameter(id) {
                    const response = await fetch('/api/validation-parameters/' + id);
                    currentParam = await response.json();
                    
                    const form = document.getElementById('editForm');
                    form.innerHTML = \`
                        <h3>\${currentParam.parameter_name} (\${currentParam.unit})</h3>
                        
                        <div>
                            <h4>Grobe Grenzen (Sensor-Bereich)</h4>
                            <label>Min: <input type="number" id="gross_min" value="\${currentParam.gross_range_min}" step="any"></label>
                            <label>Max: <input type="number" id="gross_max" value="\${currentParam.gross_range_max}" step="any"></label>
                        </div>
                        
                        <div>
                            <h4>Klimatologie (Plausible Werte)</h4>
                            <label>Min: <input type="number" id="clim_min" value="\${currentParam.climatology_min}" step="any"></label>
                            <label>Max: <input type="number" id="clim_max" value="\${currentParam.climatology_max}" step="any"></label>
                        </div>
                        
                        <div>
                            <h4>Notizen</h4>
                            <textarea id="notes" rows="4" style="width: 100%;">\${currentParam.notes || ''}</textarea>
                        </div>
                        
                        <div>
                            <h4>Grund für Änderung</h4>
                            <input type="text" id="changeReason" style="width: 100%;" placeholder="z.B. Anpassung nach Expertengutachten">
                        </div>
                        
                        <div>
                            <label>Admin-Email: <input type="email" id="userEmail" required></label>
                        </div>
                        
                        <button class="save-btn" onclick="saveChanges()">Änderungen speichern</button>
                    \`;
                    
                    document.getElementById('editModal').style.display = 'block';
                }
                
                function closeModal() {
                    document.getElementById('editModal').style.display = 'none';
                }
                
                async function saveChanges() {
                    const updates = {
                        gross_range_min: parseFloat(document.getElementById('gross_min').value),
                        gross_range_max: parseFloat(document.getElementById('gross_max').value),
                        climatology_min: parseFloat(document.getElementById('clim_min').value),
                        climatology_max: parseFloat(document.getElementById('clim_max').value),
                        notes: document.getElementById('notes').value,
                        climatology_thresholds: currentParam.climatology_thresholds
                    };
                    
                    const changeReason = document.getElementById('changeReason').value;
                    const userEmail = document.getElementById('userEmail').value;
                    
                    if (!changeReason || !userEmail) {
                        alert('Bitte alle Felder ausfüllen');
                        return;
                    }
                    
                    try {
                        const response = await fetch('/api/validation-parameters/' + currentParam.id, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ updates, changeReason, userEmail })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('Änderungen erfolgreich gespeichert!');
                            closeModal();
                            location.reload();
                        } else {
                            alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
                        }
                    } catch (err) {
                        alert('Fehler beim Speichern: ' + err.message);
                    }
                }
                
                // Close modal when clicking outside
                window.onclick = function(event) {
                    const modal = document.getElementById('editModal');
                    if (event.target == modal) {
                        closeModal();
                    }
                }
            </script>
        </body>
        </html>`;
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Kommentar- und Benutzer-API (unverändert)
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'];
for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        console.error(`FATALER FEHLER: Die Umgebungsvariable ${varName} ist nicht gesetzt.`);
        process.exit(1);
    }
}
const DATA_DIR = path.join(__dirname, 'data');
const COMMENTS_PATH = path.join(DATA_DIR, 'comments.json');
const NOTIFICATION_LIST_PATH = path.join(DATA_DIR, 'notification-list.json');
const ensureDataDirExists = () => { if (!fs.existsSync(DATA_DIR)) { fs.mkdirSync(DATA_DIR, { recursive: true }); } };
const readComments = () => { if (!fs.existsSync(COMMENTS_PATH)) return []; const fileContent = fs.readFileSync(COMMENTS_PATH, 'utf-8'); if (fileContent.trim() === '') return []; try { return JSON.parse(fileContent); } catch (e) { console.error("Fehler beim Parsen von comments.json:", e); return []; } };
const writeComments = (comments) => { ensureDataDirExists(); fs.writeFileSync(COMMENTS_PATH, JSON.stringify(comments, null, 2), 'utf-8'); };
const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: process.env.SMTP_PORT, secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
app.get('/api/comments', (req, res) => { try { const comments = readComments(); res.status(200).json(comments); } catch (error) { console.error('Fehler beim Lesen der Kommentare:', error); res.status(500).send('Serverfehler beim Lesen der Kommentare.'); } });
app.post('/api/comments', (req, res) => { try { const comments = readComments(); const newComment = { id: Date.now().toString(), timestamp: new Date().toISOString(), author: req.body.author.firstName, text: req.body.text, stepId: req.body.stepId, sectionId: req.body.sectionId, level: req.body.level, }; comments.push(newComment); writeComments(comments); let allUsers = []; if (fs.existsSync(NOTIFICATION_LIST_PATH)) { const usersFileContent = fs.readFileSync(NOTIFICATION_LIST_PATH, 'utf-8'); if (usersFileContent.trim() !== '') { allUsers = JSON.parse(usersFileContent); } } const recipients = allUsers.filter(user => user.notificationFrequency === 'immediate' && user.email !== req.body.author.email); if (recipients.length > 0) { console.log(`Sende ${recipients.length} sofortige Benachrichtigungen...`); recipients.forEach(recipient => { transporter.sendMail({ from: `"Digitale Gewässergüte" <${process.env.SMTP_USER}>`, to: recipient.email, subject: `Neuer Kommentar im Abschnitt "${newComment.sectionId}"`, html: `<p>Hallo ${recipient.firstName},</p><p>Es gibt einen neuen Kommentar von <b>${newComment.author}</b> im Prozessschritt <b>"${newComment.stepId}"</b> (Level: ${newComment.level}).</p><p><b>Kommentar:</b></p><p><i>"${newComment.text}"</i></p><p>Sie können die Anwendung hier aufrufen: <a href="https://wasserqualitaet-vg.fly.dev" target="_blank">Projekt WAMO-Messdaten Vorpomemrn-Greifswald</a></p>` }).catch(err => { console.error(`Fehler beim Senden der E-Mail an ${recipient.email}:`, err); }); }); } res.status(201).json(newComment); } catch (error) { console.error('Fehler beim Verarbeiten des neuen Kommentars:', error); res.status(500).send('Serverfehler beim Verarbeiten des Kommentars.'); } });
app.post('/api/user-login', async (req, res) => { try { ensureDataDirExists(); let users = []; if (fs.existsSync(NOTIFICATION_LIST_PATH)) { const fileContent = fs.readFileSync(NOTIFICATION_LIST_PATH, 'utf-8'); if(fileContent.trim() !== '') { users = JSON.parse(fileContent); } } const existingUserIndex = users.findIndex(u => u.email === req.body.email); const userData = { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, notificationFrequency: req.body.notificationFrequency, }; if (existingUserIndex > -1) { users[existingUserIndex] = { ...users[existingUserIndex], ...userData }; } else { users.push(userData); } fs.writeFileSync(NOTIFICATION_LIST_PATH, JSON.stringify(users, null, 2), 'utf-8'); await logUserLogin(userData); res.status(200).json({ message: 'Benutzer gespeichert.' }); } catch (error) { console.error('Fehler beim Speichern des Benutzers:', error); res.status(500).send('Serverfehler beim Speichern des Benutzers.'); } });
app.post('/api/comments/delete', (req, res) => { try { const { commentId, user } = req.body; if (!user || user.email !== process.env.ADMIN_EMAIL) { return res.status(403).send('Zugriff verweigert. Nur für Admins.'); } const comments = readComments(); const updatedComments = comments.filter(comment => comment.id !== commentId); if (comments.length === updatedComments.length) { return res.status(404).send('Kommentar nicht gefunden.'); } writeComments(updatedComments); res.status(200).send('Kommentar erfolgreich gelöscht.'); } catch (error) { console.error('Fehler beim Löschen des Kommentars:', error); res.status(500).send('Serverfehler beim Löschen des Kommentars.'); } });

// Validierungs-Block (unverändert)
const tempUploadDir = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

app.post('/api/validate-data-zip', upload.single('file'), async (req, res) => {
    console.log('API-Endpunkt /api/validate-data-zip aufgerufen.');

    if (!req.file) {
        console.error("Fehler: req.file ist nicht vorhanden. Multer hat die Datei nicht korrekt verarbeitet.");
        return res.status(400).json({ message: 'Keine ZIP-Datei hochgeladen.' });
    }

    // NEUE ROUTE, um die öffentlichen Ergebnis-Dashboards auszuliefern
    // --- Intelligente Pfad-Logik für LOKAL & ONLINE (Version 2.0) ---
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadedZipPath = req.file.path;

    // Der Input-Ordner ist IMMER temporär
    const tempExtractDir = path.join(__dirname, 'temp', uuidv4());
    const inputDir = path.join(tempExtractDir, 'input');

    // Der Output-Ordner ist nur LOKAL persistent
    const outputDir = isProduction
        ? path.join(tempExtractDir, 'output') // Online: temporär
        : path.resolve(__dirname, 'daten_pipeline', 'output'); // Lokal: persistent

    // Die Cleanup-Funktion wird auch intelligent
    const cleanup = () => {
        try {
            console.log(`Räume temporären Input und Upload auf...`);
            if (fs.existsSync(uploadedZipPath)) { fs.rmSync(uploadedZipPath, { force: true }); }
            // WICHTIG: löscht den gesamten temp-Ordner für den Lauf
            if (fs.existsSync(tempExtractDir)) { fs.rmSync(tempExtractDir, { recursive: true, force: true }); }
        } catch (err) {
            console.error('Fehler während des Aufräumens:', err.message);
        }
    };


    try {
        fs.mkdirSync(inputDir, { recursive: true });
        fs.mkdirSync(outputDir, { recursive: true });

        await decompress(uploadedZipPath, inputDir);
        console.log(`Datei erfolgreich in ${inputDir} entpackt.`);
        
        const files = fs.readdirSync(inputDir);
        let metadataFile = files.find(f => f.toLowerCase().includes('parameter-metadata'));
        let metadataPath;

        if (metadataFile) {
            metadataPath = path.join(inputDir, metadataFile);
            console.log(`Metadaten-Datei aus ZIP-Archiv gefunden: ${metadataPath}`);
        } else {
            const fallbackMetadataPath = path.resolve(__dirname, 'default_metadata.json');
            if (fs.existsSync(fallbackMetadataPath)) {
                metadataPath = fallbackMetadataPath;
                console.log(`Fallback-Metadaten-Datei wird verwendet: ${fallbackMetadataPath}`);
            } else {
                cleanup();
                return res.status(400).json({ message: 'Das ZIP-Archiv enthält keine Metadaten-Datei und es konnte keine Fallback-Datei auf dem Server gefunden werden.' });
            }
        }
        
        // --- HIER IST DIE KORREKTE REIHENFOLGE ALLER VARIABLEN ---
        
        // 1. Python-Executable definieren
        let pythonExecutable;

        // 2. Pfad zum Python-Skript definieren
        const pythonScriptPath = path.resolve(__dirname, 'daten_pipeline', 'main_pipeline.py');

        if (process.env.NODE_ENV === 'production') {
            pythonExecutable = 'python3';
            console.log("Produktionsumgebung erkannt (NODE_ENV=production). Verwende 'python3'.");
        } else {
            console.log("Lokale Entwicklungsumgebung erkannt. Suche Python im venv.");
            const venvDir = path.resolve(__dirname, '..', '..', 'WAMO-Daten', 'daten_pipeline', 'venv');
            pythonExecutable = process.platform === 'win32'
                ? path.join(venvDir, 'Scripts', 'python.exe')
                : path.join(venvDir, 'bin', 'python');
        }


        // 3. Beide Pfade prüfen, BEVOR die Promise gestartet wird
        if (process.env.NODE_ENV !== 'production' && !fs.existsSync(pythonExecutable)) {
            cleanup();
            const errorMsg = `Python-Interpreter nicht im lokalen venv gefunden. Gesuchter Pfad: ${pythonExecutable}`;
            console.error(errorMsg);
            return res.status(500).json({ message: "Server-Konfigurationsfehler: Python-Interpreter im venv nicht gefunden." });
        }
        if (!fs.existsSync(pythonScriptPath)) {
            cleanup();
            return res.status(500).json({ message: `Haupt-Pipeline-Skript nicht gefunden: ${pythonScriptPath}` });
        }
        
        // 4. Jetzt die Promise starten
        const executionPromise = new Promise((resolve, reject) => {
            const pythonProcess = spawn(pythonExecutable, [
                pythonScriptPath, '--input-dir', inputDir, '--output-dir', outputDir, '--metadata-path', metadataPath
            ], {
                // Diese Option zwingt Python, UTF-8 zu verwenden, was den Fehler behebt.
                env: { ...process.env, PYTHONIOENCODING: 'UTF-8' }
            });
            const statusLog = [];
            let pythonError = '';

            pythonProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                console.log(`[PYTHON STDOUT]:`, output);
                if (output.startsWith('STATUS_UPDATE:')) {
                    statusLog.push(output.replace('STATUS_UPDATE:', ''));
                }
            });
            pythonProcess.stderr.on('data', (data) => {
                pythonError += data.toString().trim() + "\n";
            });
            pythonProcess.on('error', (err) => reject({ message: 'Python-Skript konnte nicht gestartet werden.', error: err.message }));
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject({ message: 'Fehler bei der Ausführung der Python-Pipeline.', error: pythonError });
                } else {
                    resolve(statusLog);
                }
            });
        });

        const finalStatusLog = await executionPromise;

        // --- Finale, robuste Dateiauswahl über die NEUESTE Referenzdatei ---

        // Hilfsfunktion, um die neueste Datei zu finden, die einem Muster entspricht
        const getNewestFile = (dir, prefix) => {
            const files = fs.readdirSync(dir)
                .filter(file => file.startsWith(prefix))
                .map(file => ({ name: file, time: fs.statSync(path.join(dir, file)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time); // Neueste zuerst
            return files.length > 0 ? files[0].name : null;
        };

        // 1. Finde die neueste Analyse-Datei als Referenz, um den Lauf zu identifizieren
        const referenceFile = getNewestFile(outputDir, 'erweiterte_analyse_');

        if (!referenceFile) {
            cleanup();
            return res.status(500).json({ message: 'Pipeline hat keine Haupt-Analyse-Datei erstellt.' });
        }

        // 2. Extrahiere den eindeutigen Identifikator aus dieser neuesten Datei
        const match = referenceFile.match(/(_wamo\d+_\d{8}_\d{6})/);
        const runIdentifier = match ? match[1] : null;

        if (!runIdentifier) {
            cleanup();
            return res.status(500).json({ message: 'Konnte keinen gültigen Identifikator aus der neuesten Ergebnisdatei extrahieren.' });
        }
        console.log(`[INFO] Verwende Identifikator des letzten Laufs: ${runIdentifier}`);

        // 3. Baue die exakten Dateinamen mit diesem Identifikator zusammen
        const openDataFile = `opendata${runIdentifier}.json`;
        const dashboardFiles = fs.readdirSync(outputDir)
            .filter(file => file.startsWith('dashboard_') && file.endsWith('.html'))
            .map(file => ({ name: file, time: fs.statSync(path.join(outputDir, file)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time); // Neueste zuerst

        const dashboardFile = dashboardFiles.length > 0 ? dashboardFiles[0].name : null;
        const fullAnalysisFile = `erweiterte_analyse${runIdentifier}.json`;

        // 4. Lese die korrekte opendata.json für die Charts
        const openDataPath = path.join(outputDir, openDataFile);
        if (!fs.existsSync(openDataPath)) {
            cleanup();
            return res.status(500).json({ message: `Die spezifische OpenData-Datei '${openDataFile}' wurde nicht gefunden.` });
        }
        const chartJsonPayload = JSON.parse(fs.readFileSync(openDataPath, 'utf-8'));

        
        // Finde und verarbeite die Haupt-Analyse-Datei und speichere in DB
        const fullAnalysisPath = path.join(outputDir, fullAnalysisFile);
        if (fs.existsSync(fullAnalysisPath)) {
            const fullAnalysisData = JSON.parse(fs.readFileSync(fullAnalysisPath, 'utf-8'));
            const stationIdMatch = fullAnalysisFile.match(/_wamo(\d+)_/);
            const stationId = stationIdMatch ? `wamo${stationIdMatch[1]}` : 'unbekannt';
            
            // Finde die Stundenwerte-Datei
            const hourlyFile = getNewestFile(outputDir, `stundenwerte_${stationId}_`);
            const hourlyDataPath = hourlyFile ? path.join(outputDir, hourlyFile) : null;
            
            // NEU: Finde die fehlerhafte_werte.json
            const errorFile = getNewestFile(outputDir, `validierung_details_${stationId}_`) 
                ? getNewestFile(outputDir, `validierung_details_${stationId}_`).replace('.txt', '_fehlerhafte_werte.json')
                : null;
            const errorData = errorFile && fs.existsSync(path.join(outputDir, errorFile))
                ? JSON.parse(fs.readFileSync(path.join(outputDir, errorFile), 'utf-8'))
                : null;
            
            // ERWEITERT: Speichere ALLE Daten in Datenbank
            try {
                await saveValidationData(
                    fullAnalysisData.basis_validierung, 
                    req.file.originalname, 
                    stationId,
                    hourlyDataPath,
                    fullAnalysisData  // NEU: Die kompletten erweiterten Daten!
                );
                console.log('✅ Alle Dashboard-Daten erfolgreich in Datenbank gespeichert!');
            } catch (dbError) {
                console.error('❌ Fehler beim Speichern in Datenbank:', dbError);
            }
        }
                // ====================================================================================

        let publicDashboardUrl = null;
        if (dashboardFile) {
            const publicDir = path.join(__dirname, 'public_results');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }
            const sourcePath = path.join(outputDir, dashboardFile);
            const destinationPath = path.join(publicDir, dashboardFile);
            fs.copyFileSync(sourcePath, destinationPath);
            const cssSourcePath = path.resolve(__dirname, 'daten_pipeline', 'public_results', 'dashboard_styles.css');
            const cssDestPath = path.join(publicDir, 'dashboard_styles.css');
            if (fs.existsSync(cssSourcePath)) {
                fs.copyFileSync(cssSourcePath, cssDestPath);
            }
            const backendHostname = process.env.BACKEND_HOSTNAME || `localhost:${PORT}`;
            console.log(`[DEBUG] Backend Hostname wird verwendet: ${backendHostname}`);
            publicDashboardUrl = `${isProduction ? 'https' : 'http'}://${backendHostname}/api/results/${dashboardFile}`;
        }

        res.status(200).json({
            validationResult: chartJsonPayload,
            statusLog: finalStatusLog,
            dashboardUrl: publicDashboardUrl
        });
        cleanup();

    } catch (error) {
        console.error(`Ein schwerer Fehler ist aufgetreten: ${error.message}`);
        console.error(`[PYTHON STDERR]:`, error.error);
        cleanup();
        res.status(500).json({ message: `Server-Fehler: ${error.message}`, error: error.error || '' });
    }
});

app.use('/api/results', express.static(path.join(__dirname, 'public_results')));

// Server Start (unverändert)
const HOST = '0.0.0.0';

testConnection().then(connected => {
    if (connected) {
        console.log('✅ Datenbank erfolgreich verbunden');
    } else {
        console.log('⚠️  Keine Datenbankverbindung - App läuft trotzdem');
    }
});

app.listen(PORT, HOST, () => {
    console.log(`================================================`);
    console.log(`✅ Backend-Server wurde erfolgreich gestartet.`);
    console.log(`✅ Lauscht auf http://${HOST}:${PORT}`);
    console.log(`================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM erhalten. Schließe Server...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT erhalten. Schließe Server...');
    await pool.end();
    process.exit(0);
});