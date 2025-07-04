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
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
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
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
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
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    try {
        const result = await pool.query(
            `SELECT 
                s.station_code, 
                s.station_name,
                TO_CHAR(MIN(da.date), 'YYYY-MM-DD') as min_date,
                TO_CHAR(MAX(da.date), 'YYYY-MM-DD') as max_date,
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
    } finally {
        await pool.end();
    }
});

// Optionaler Endpunkt für eine Übersichtsseite aller Stationen
app.get('/api/stations-overview', async (req, res) => {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    try {
        const result = await pool.query(
            `SELECT 
                s.station_code, 
                s.station_name,
                s.gemeinde,
                TO_CHAR(MIN(da.date), 'YYYY-MM-DD') as first_data,
                TO_CHAR(MAX(da.date), 'YYYY-MM-DD') as last_data,
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
    } finally {
        await pool.end();
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