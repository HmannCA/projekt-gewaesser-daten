console.log('=== SERVER.JS VERSION 2.0 - MIT DB TEST ===');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { spawn } = require('child_process');
const { testConnection } = require('./db/postgres');
const nodemailer = require('nodemailer');
require('dotenv').config();

// --- KORREKTE UND VOLLSTÄNDIGE IMPORTE FÜR DIE ERWEITERUNG ---
const decompress = require('decompress');
const { v4: uuidv4 } = require('uuid');


const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares (aus Ihrem Originalcode)
app.use(cors());
app.use(express.json());

// Bestehender Code-Block aus Ihrer Datei (unverändert)
// ============== NEUER ABSCHNITT: DATEN-PIPELINE INTEGRATION ==============
const uploadDir = path.join(__dirname, '..', 'daten_pipeline', 'input');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'));
  }
});
const upload_original = multer({ storage: storage });
app.post('/api/upload-data', upload_original.array('datafiles', 500), (req, res) => {
  console.log(`${req.files.length} Dateien erfolgreich in den 'input'-Ordner der Pipeline hochgeladen.`);
  res.status(200).json({ 
    message: `${req.files.length} Dateien erfolgreich hochgeladen. Verarbeitung kann gestartet werden.` 
  });
});
app.post('/api/process-pipeline', (req, res) => {
  console.log('Anfrage zum Starten der Python-Pipeline erhalten...');
  const scriptPath = path.join(__dirname, '..', 'daten_pipeline', 'main_pipeline.py');
  if (!fs.existsSync(scriptPath)) {
    console.error(`Fehler: Das Python-Skript wurde nicht unter ${scriptPath} gefunden.`);
    return res.status(500).json({ message: 'Fehler: Python-Skript nicht gefunden. Konfiguration prüfen.' });
  }
  let pythonExecutable = path.join(__dirname, '..', 'daten_pipeline', 'venv', 'Scripts', 'python.exe');
  if (!fs.existsSync(pythonExecutable)) {
    console.error(`Fehler: Die Python-Executable der venv wurde nicht unter ${pythonExecutable} gefunden.`);
    console.log("Versuche, 'python' global aufzurufen...");
    pythonExecutable = 'python';
  }
  const pythonProcess = spawn(pythonExecutable, [scriptPath]);
  let scriptOutput = '';
  pythonProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[Python-Skript] ${output}`);
    scriptOutput += output;
  });
  let scriptError = '';
  pythonProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    console.error(`[Python-Skript-FEHLER] ${errorOutput}`);
    scriptError += errorOutput;
  });
  pythonProcess.on('close', (code) => {
    console.log(`Python-Prozess beendet mit Code ${code}.`);
    if (code === 0) {
      res.status(200).json({ 
        message: 'Verarbeitung erfolgreich abgeschlossen!',
        output: scriptOutput 
      });
    } else {
      res.status(500).json({ 
        message: 'Fehler bei der Datenverarbeitung.',
        error: scriptError 
      });
    }
  });
});
// ============== ENDE NEUER ABSCHNITT ============== (aus Ihrem Originalcode)

const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`FATALER FEHLER: Die Umgebungsvariable ${varName} ist nicht gesetzt. Die Anwendung kann nicht starten.`);
    process.exit(1);
  }
}
const DATA_DIR = path.join(__dirname, 'data');
const COMMENTS_PATH = path.join(DATA_DIR, 'comments.json');
const NOTIFICATION_LIST_PATH = path.join(DATA_DIR, 'notification-list.json');
const ensureDataDirExists = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};
const readComments = () => {
  ensureDataDirExists();
  if (!fs.existsSync(COMMENTS_PATH)) {
    return [];
  }
  const fileContent = fs.readFileSync(COMMENTS_PATH, 'utf-8');
  if (fileContent.trim() === '') {
    return [];
  }
  try {
    return JSON.parse(fileContent);
  } catch (e) {
    console.error("Fehler beim Parsen von comments.json:", e);
    return [];
  }
};
const writeComments = (comments) => {
  ensureDataDirExists();
  fs.writeFileSync(COMMENTS_PATH, JSON.stringify(comments, null, 2), 'utf-8');
};
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
app.get('/api/comments', (req, res) => {
  try {
    const comments = readComments();
    res.status(200).json(comments);
  } catch (error) {
    console.error('Fehler beim Lesen der Kommentare:', error);
    res.status(500).send('Serverfehler beim Lesen der Kommentare.');
  }
});
app.post('/api/comments', (req, res) => {
  try {
    const comments = readComments();
    const newComment = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      author: req.body.author.firstName,
      text: req.body.text,
      stepId: req.body.stepId,
      sectionId: req.body.sectionId,
      level: req.body.level,
    };
    comments.push(newComment);
    writeComments(comments);
    let allUsers = [];
    if (fs.existsSync(NOTIFICATION_LIST_PATH)) {
      const usersFileContent = fs.readFileSync(NOTIFICATION_LIST_PATH, 'utf-8');
      if (usersFileContent.trim() !== '') {
        allUsers = JSON.parse(usersFileContent);
      }
    }
    const recipients = allUsers.filter(user => 
      user.notificationFrequency === 'immediate' && 
      user.email !== req.body.author.email
    );
    if (recipients.length > 0) {
      console.log(`Sende ${recipients.length} sofortige Benachrichtigungen...`);
      recipients.forEach(recipient => {
        transporter.sendMail({
          from: `"Digitale Gewässergüte" <${process.env.SMTP_USER}>`,
          to: recipient.email,
          subject: `Neuer Kommentar im Abschnitt "${newComment.sectionId}"`,
          html: `
            <p>Hallo ${recipient.firstName},</p>
            <p>Es gibt einen neuen Kommentar von <b>${newComment.author}</b> im Prozessschritt <b>"${newComment.stepId}"</b> (Level: ${newComment.level}).</p>
            <p><b>Kommentar:</b></p>
            <p><i>"${newComment.text}"</i></p>
            <p>Sie können die Anwendung hier aufrufen: <a href="https://wasserqualitaet-vg.fly.dev" target="_blank">Projekt WAMO-Messdaten Vorpomemrn-Greifswald</a></p>
          `
        }).catch(err => {
          console.error(`Fehler beim Senden der E-Mail an ${recipient.email}:`, err);
        });
      });
    }
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Fehler beim Verarbeiten des neuen Kommentars:', error);
    res.status(500).send('Serverfehler beim Verarbeiten des Kommentars.');
  }
});
app.post('/api/user-login', (req, res) => {
    try {
        ensureDataDirExists();
        let users = [];
        if (fs.existsSync(NOTIFICATION_LIST_PATH)) {
            const fileContent = fs.readFileSync(NOTIFICATION_LIST_PATH, 'utf-8');
            if(fileContent.trim() !== '') {
                users = JSON.parse(fileContent);
            }
        }
        const existingUserIndex = users.findIndex(u => u.email === req.body.email);
        const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            notificationFrequency: req.body.notificationFrequency,
        };
        if (existingUserIndex > -1) {
            users[existingUserIndex] = { ...users[existingUserIndex], ...userData };
        } else {
            users.push(userData);
        }
        fs.writeFileSync(NOTIFICATION_LIST_PATH, JSON.stringify(users, null, 2), 'utf-8');
        res.status(200).json({ message: 'Benutzer gespeichert.' });
    } catch (error) {
        console.error('Fehler beim Speichern des Benutzers:', error);
        res.status(500).send('Serverfehler beim Speichern des Benutzers.');
    }
});
app.post('/api/comments/delete', (req, res) => {
  try {
    const { commentId, user } = req.body;
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).send('Zugriff verweigert. Nur für Admins.');
    }
    const comments = readComments();
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    if (comments.length === updatedComments.length) {
      return res.status(404).send('Kommentar nicht gefunden.');
    }
    writeComments(updatedComments);
    res.status(200).send('Kommentar erfolgreich gelöscht.');
  } catch (error) {
    console.error('Fehler beim Löschen des Kommentars:', error);
    res.status(500).send('Serverfehler beim Löschen des Kommentars.');
  }
});


// ======================================================================================
// --- DER NEUE, KORRIGIERTE VALIDIERUNGS-BLOCK ---
// ======================================================================================

const tempUploadDir = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`);
    }
});
const upload_zip = multer({ storage: diskStorage });

app.post('/api/validate-data-zip', upload_zip.single('file'), (req, res) => {
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
            if (fs.existsSync(uploadedZipPath)) {
                fs.rmSync(uploadedZipPath, { force: true });
            }
            if (fs.existsSync(tempExtractDir)) {
                fs.rmSync(tempExtractDir, { recursive: true, force: true });
            }
        } catch (err) {
            console.error('Fehler während des Aufräumens:', err.message);
        }
    };

    try {
        fs.mkdirSync(inputDir, { recursive: true });
        fs.mkdirSync(outputDir, { recursive: true });

        console.log(`Entpacke Datei von: ${uploadedZipPath}`);
        
        decompress(uploadedZipPath, inputDir).then(() => {
            console.log(`Datei erfolgreich in ${inputDir} entpackt.`);

            const files = fs.readdirSync(inputDir);const metadataFile = files.find(f => f.toLowerCase().includes('parameter-metadata'));
            

            if (!metadataFile) {
                cleanup();
                return res.status(400).json({ message: 'Das ZIP-Archiv muss eine Metadaten-Datei (metadata.json) enthalten.' });
            }

            const metadataPath = path.join(inputDir, metadataFile);
            console.log(`Metadaten-Datei gefunden: ${metadataPath}`);
            
            
            console.log('Starte Python Validierungspipeline...');
            
            // --- KORREKTUR: Wir definieren den exakten Pfad zur Python-Executable in der venv ---
            const pythonExecutable = path.resolve(__dirname, '..', 'daten_pipeline', 'venv', 'Scripts', 'python.exe');
            const pythonScriptPath = path.resolve(__dirname, '..', 'daten_pipeline', 'main_pipeline.py');

            // Sicherheitscheck, ob die venv-Executable existiert
            if (!fs.existsSync(pythonExecutable)) {
                cleanup();
                // Wichtige Fehlermeldung, falls die venv nicht gefunden wird
                return res.status(500).json({ message: `Python-Umgebung (venv) nicht gefunden unter: ${pythonExecutable}. Bitte stellen Sie sicher, dass die venv existiert und die Bibliotheken installiert sind.` });
            }

            console.log(`Verwende Python-Executable: ${pythonExecutable}`);

            const pythonProcess = spawn(pythonExecutable, [
                pythonScriptPath,
                '--input-dir', inputDir,
                '--output-dir', outputDir,
                '--metadata-path', metadataPath
            ]);

            let pythonOutput = '';
            let pythonError = '';
            pythonProcess.stdout.on('data', (data) => {
                pythonOutput += data.toString();
                console.log(`[Python STDOUT]: ${data.toString().trim()}`);
            });
            pythonProcess.stderr.on('data', (data) => {
                pythonError += data.toString();
                console.error(`[Python STDERR]: ${data.toString().trim()}`);
            });

            pythonProcess.on('close', (code) => {
                console.log(`Python-Prozess beendet mit Code ${code}`);

                if (code !== 0) {
                    cleanup();
                    return res.status(500).json({ 
                        message: 'Fehler bei der Ausführung der Python-Pipeline.',
                        error: pythonError || "Unbekannter Python-Fehler."
                    });
                }

                try {
                    const outputFiles = fs.readdirSync(outputDir);
                    const resultFile = outputFiles.find(f => f.endsWith('.json'));

                    if (!resultFile) {
                        cleanup();
                        return res.status(500).json({ message: 'Pipeline hat keine Ergebnisdatei erstellt.' });
                    }
                    
                    console.log(`Ergebnisdatei gefunden: ${resultFile}`);
                    const resultPath = path.join(outputDir, resultFile);
                    const resultData = fs.readFileSync(resultPath, 'utf-8');

                    console.log('Sende Ergebnis an den Client.');
                    res.status(200).json(JSON.parse(resultData));
                    cleanup();
                } catch(readError) {
                    console.error('Fehler beim Lesen der Ergebnisdatei:', readError.message);
                    cleanup();
                    res.status(500).json({ message: `Server-Fehler beim Lesen des Ergebnisses: ${readError.message}` });
                }
            });

        }).catch(err => {
            console.error(`Fehler beim Entpacken der ZIP-Datei: ${err.message}`);
            cleanup();
            res.status(500).json({ message: `Server-Fehler beim Entpacken: ${err.message}` });
        });

    } catch (error) {
        console.error(`Ein schwerer synchroner Fehler ist aufgetreten: ${error.message}`);
        cleanup();
        res.status(500).json({ message: `Server-Fehler: ${error.message}` });
    }
});
// ======================================================================================

const HOST = '0.0.0.0';

testConnection().then(connected => {
  if (connected) {
    console.log('✅ Datenbank erfolgreich verbunden');
  } else {
    console.log('⚠️  Keine Datenbankverbindung - App läuft trotzdem');
  }
});

app.listen(PORT, HOST, () => {
  console.log(`================================================`);
  console.log(`✅ Backend-Server wurde erfolgreich gestartet.`);
  console.log(`✅ Lauscht auf http://${HOST}:${PORT}`);
  console.log(`================================================`);
});