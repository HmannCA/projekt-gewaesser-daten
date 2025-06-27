// HINWEIS: Dies ist die finale, vollständige Version der server.js,
// basierend auf Ihrem bereitgestellten Code und korrigiert, um Abstürze zu verhindern.

console.log('=== SERVER.JS VERSION 2.0 - MIT DB TEST ===');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { spawn } = require('child_process');

// --- KORREKTE UND VOLLSTÄNDIGE IMPORT-ANWEISUNG FÜR POSTGRES ---
// Alle benötigten Funktionen werden hier einmalig und sauber importiert.
const {
    testConnection,
    createDatabaseTables,
    saveValidationData,
    getLatestValidationData
} = require('./db/postgres');

const nodemailer = require('nodemailer');
require('dotenv').config();
const decompress = require('decompress');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares (aus Ihrem Originalcode)
app.use(cors());
app.use(express.json());

// Temporärer Setup-Endpunkt (unverändert)
app.get('/api/setup-database-bitte-loeschen', async (req, res) => {
    console.log('Datenbank-Setup wird aufgerufen...');
    const result = await createDatabaseTables();
    if (result.success) {
        res.status(200).send(`<h1>Erfolg!</h1><p>${result.message}</p>`);
    } else {
        res.status(500).send(`<h1>Fehler!</h1><p>${result.message}</p>`);
    }
});

// Temporärer Endpunkt zum Anzeigen der Datenbank-Inhalte (unverändert)
app.get('/api/show-me-the-data', async (req, res) => {
    try {
        console.log('Anfrage zum Anzeigen der Datenbankdaten erhalten...');
        const data = await getLatestValidationData();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(data, null, 2));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



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
app.post('/api/user-login', (req, res) => { try { ensureDataDirExists(); let users = []; if (fs.existsSync(NOTIFICATION_LIST_PATH)) { const fileContent = fs.readFileSync(NOTIFICATION_LIST_PATH, 'utf-8'); if(fileContent.trim() !== '') { users = JSON.parse(fileContent); } } const existingUserIndex = users.findIndex(u => u.email === req.body.email); const userData = { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, notificationFrequency: req.body.notificationFrequency, }; if (existingUserIndex > -1) { users[existingUserIndex] = { ...users[existingUserIndex], ...userData }; } else { users.push(userData); } fs.writeFileSync(NOTIFICATION_LIST_PATH, JSON.stringify(users, null, 2), 'utf-8'); res.status(200).json({ message: 'Benutzer gespeichert.' }); } catch (error) { console.error('Fehler beim Speichern des Benutzers:', error); res.status(500).send('Serverfehler beim Speichern des Benutzers.'); } });
app.post('/api/comments/delete', (req, res) => { try { const { commentId, user } = req.body; if (!user || user.email !== process.env.ADMIN_EMAIL) { return res.status(403).send('Zugriff verweigert. Nur für Admins.'); } const comments = readComments(); const updatedComments = comments.filter(comment => comment.id !== commentId); if (comments.length === updatedComments.length) { return res.status(404).send('Kommentar nicht gefunden.'); } writeComments(updatedComments); res.status(200).send('Kommentar erfolgreich gelöscht.'); } catch (error) { console.error('Fehler beim Löschen des Kommentars:', error); res.status(500).send('Serverfehler beim Löschen des Kommentars.'); } });


// ======================================================================================
// --- DER EINZIGE, FUNKTIONIERENDE VALIDIERUNGS-BLOCK ---
// ======================================================================================
const tempUploadDir = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
}
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, tempUploadDir); },
    filename: (req, file, cb) => { cb(null, `${uuidv4()}-${file.originalname}`); }
});
const upload_zip = multer({ storage: diskStorage });

app.post('/api/validate-data-zip', async (req, res) => {
    console.log('API-Endpunkt /api/validate-data-zip aufgerufen.');
    if (!req.file) {
        return res.status(400).json({ message: 'Keine ZIP-Datei hochgeladen.' });
    }
    const tempExtractDir = path.join(__dirname, 'temp', uuidv4());
    const inputDir = path.join(tempExtractDir, 'input');
    const outputDir = path.join(tempExtractDir, 'output');
    const uploadedZipPath = req.file.path;
    const cleanup = () => {
        try {
            console.log(`Räume temporäre Verzeichnisse und Dateien auf...`);
            if (fs.existsSync(uploadedZipPath)) { fs.rmSync(uploadedZipPath, { force: true }); }
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
        const metadataFile = files.find(f => f.toLowerCase().includes('parameter-metadata'));
        if (!metadataFile) {
            cleanup();
            return res.status(400).json({ message: 'Das ZIP-Archiv muss eine Metadaten-Datei (metadata.json) enthalten.' });
        }
        const metadataPath = path.join(inputDir, metadataFile);
        
        let pythonExecutable;
        if (process.platform === "win32") {
            pythonExecutable = path.resolve(__dirname, '..', 'daten_pipeline', 'venv', 'Scripts', 'python.exe');
        } else {
            pythonExecutable = path.resolve(__dirname, '..', 'daten_pipeline', 'venv', 'bin', 'python');
        }
        const pythonScriptPath = path.resolve(__dirname, '..', 'daten_pipeline', 'main_pipeline.py');

        if (!fs.existsSync(pythonExecutable)) {
            cleanup();
            return res.status(500).json({ message: `Python-Umgebung (venv) nicht gefunden. Gesuchter Pfad: ${pythonExecutable}` });
        }
        
        console.log('Starte Python Validierungspipeline...');
        console.log(`Verwende Python-Executable: ${pythonExecutable}`);

        const executionPromise = new Promise((resolve, reject) => {
            const pythonProcess = spawn(pythonExecutable, [
                pythonScriptPath, '--input-dir', inputDir, '--output-dir', outputDir, '--metadata-path', metadataPath
            ]);
            const statusLog = [];
            let pythonError = '';
            pythonProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output.startsWith('STATUS_UPDATE:')) {
                    statusLog.push(output.replace('STATUS_UPDATE:', ''));
                } else {
                    console.log(`[Python STDOUT]: ${output}`);
                }
            });
            pythonProcess.stderr.on('data', (data) => {
                pythonError += data.toString().trim() + "\n";
                console.error(`[Python STDERR]: ${data.toString().trim()}`);
            });
            pythonProcess.on('error', (err) => {
                console.error('Fehler beim Starten des Python-Prozesses:', err);
                reject({ message: 'Das Python-Skript konnte nicht gestartet werden.', error: err.message });
            });
            pythonProcess.on('close', (code) => {
                console.log(`Python-Prozess beendet mit Code ${code}`);
                if (code !== 0) {
                    reject({ message: 'Fehler bei der Ausführung der Python-Pipeline.', error: pythonError });
                } else {
                    resolve(statusLog);
                }
            });
        });

        const finalStatusLog = await executionPromise;

        const outputFiles = fs.readdirSync(outputDir);
        const resultFile = outputFiles.find(f => f.endsWith('.json'));
        if (!resultFile) {
            cleanup();
            return res.status(500).json({ message: 'Pipeline hat keine Ergebnisdatei erstellt.' });
        }
        const resultPath = path.join(outputDir, resultFile);
        const resultData = fs.readFileSync(resultPath, 'utf-8');
        const validationResult = JSON.parse(resultData);
        
        const stationIdMatch = resultFile.match(/_wamo(\d+)_/);
        const stationId = stationIdMatch ? `wamo${stationIdMatch[1]}` : 'unbekannt';

        try {
            console.log(`[DB] Starte Speicherung für Station: ${stationId}...`);
            await saveValidationData(validationResult, req.file.originalname, stationId);
            console.log(`[DB] Ergebnis für Station ${stationId} erfolgreich in der Datenbank gespeichert.`);
        } catch (dbError) {
            console.error("[DB] FEHLER beim Speichern in der Datenbank:", dbError.message);
        }

        console.log('Sende Ergebnis und Status-Log an den Client.');
        res.status(200).json({
            validationResult: validationResult,
            statusLog: finalStatusLog
        });
        cleanup();
    } catch (error) {
        console.error(`Ein schwerer Fehler ist aufgetreten: ${error.message}`);
        cleanup();
        res.status(500).json({ message: `Server-Fehler: ${error.message}`, error: error.error || '' });
    }
});


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