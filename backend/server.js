console.log('=== SERVER.JS VERSION 2.0 - MIT DB TEST ===');

const express = require('express');
const cors = require('cors');
const path = require('path'); // Nur EINMAL deklarieren
const fs = require('fs');     // Nur EINMAL deklarieren
const multer = require('multer'); // NEU
const { spawn } = require('child_process'); // NEU
const { testConnection } = require('./db/postgres');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

const nodemailer = require('nodemailer');
require('dotenv').config();

// ============== NEUER ABSCHNITT: DATEN-PIPELINE INTEGRATION ==============

// 1. Konfiguration für den Datei-Upload
// -------------------------------------------------------------------

// Definiere den Ziel-Ordner für hochgeladene Dateien.
// Wichtig: Dieser Pfad muss relativ zum 'backend'-Ordner sein, wo das Skript läuft.
const uploadDir = path.join(__dirname, '..', 'daten_pipeline', 'input');

// Stelle sicher, dass der Zielordner existiert, sonst erstelle ihn.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfiguriere 'multer', um die Dateien am richtigen Ort mit dem originalen Namen zu speichern.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Behalte den originalen Dateinamen bei (z.B. "wamo00010_... .csv")
    cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'));
  }
});

const upload = multer({ storage: storage });


// 2. API-Endpunkt, der die Dateien entgegennimmt
// -------------------------------------------------------------------
// Dieser Endpunkt wartet auf POST-Anfragen an /api/upload-data
// 'upload.array('datafiles', 500)' erlaubt den Upload von bis zu 500 Dateien auf einmal.
app.post('/api/upload-data', upload.array('datafiles', 500), (req, res) => {
  // Wenn der Code hier ankommt, hat multer die Dateien bereits erfolgreich gespeichert.
  console.log(`${req.files.length} Dateien erfolgreich in den 'input'-Ordner der Pipeline hochgeladen.`);
  
  // Sende eine Erfolgsmeldung zurück an das Frontend.
  res.status(200).json({ 
    message: `${req.files.length} Dateien erfolgreich hochgeladen. Verarbeitung kann gestartet werden.` 
  });
});

// 3. API-Endpunkt, der die Python-Pipeline startet
// -------------------------------------------------------------------
app.post('/api/process-pipeline', (req, res) => {
  console.log('Anfrage zum Starten der Python-Pipeline erhalten...');

  // Definiere den Pfad zum Python-Hauptskript.
  // Wichtig: Der Pfad ist relativ zum 'backend'-Ordner.
  const scriptPath = path.join(__dirname, '..', 'daten_pipeline', 'main_pipeline.py');

  // Prüfe, ob das Skript überhaupt existiert, bevor wir es ausführen.
  if (!fs.existsSync(scriptPath)) {
    console.error(`Fehler: Das Python-Skript wurde nicht unter ${scriptPath} gefunden.`);
    return res.status(500).json({ message: 'Fehler: Python-Skript nicht gefunden. Konfiguration prüfen.' });
  }

  // Definiere den Pfad zur Python-Executable in der virtuellen Umgebung.
  // Das stellt sicher, dass die korrekten Bibliotheken (pandas, pyod) verwendet werden.
  const pythonExecutable = path.join(__dirname, '..', 'daten_pipeline', 'venv', 'Scripts', 'python.exe');
  
  if (!fs.existsSync(pythonExecutable)) {
    console.error(`Fehler: Die Python-Executable der venv wurde nicht unter ${pythonExecutable} gefunden.`);
    // Fallback auf den globalen Python-Interpreter
    console.log("Versuche, 'python' global aufzurufen...");
    pythonExecutable = 'python';
  }

  // Starte den Python-Prozess. spawn ist besser als exec für langlebige Prozesse.
  const pythonProcess = spawn(pythonExecutable, [scriptPath]);

  // Sammle die Standard-Ausgaben des Python-Skripts (für Debugging)
  let scriptOutput = '';
  pythonProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[Python-Skript] ${output}`);
    scriptOutput += output;
  });

  // Sammle eventuelle Fehler-Ausgaben des Python-Skripts
  let scriptError = '';
  pythonProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    console.error(`[Python-Skript-FEHLER] ${errorOutput}`);
    scriptError += errorOutput;
  });

  // Reagiere, wenn der Python-Prozess abgeschlossen ist.
  pythonProcess.on('close', (code) => {
    console.log(`Python-Prozess beendet mit Code ${code}.`);
    if (code === 0) {
      // Alles gut, Code 0 bedeutet Erfolg.
      res.status(200).json({ 
        message: 'Verarbeitung erfolgreich abgeschlossen!',
        output: scriptOutput 
      });
    } else {
      // Ein Fehler ist aufgetreten.
      res.status(500).json({ 
        message: 'Fehler bei der Datenverarbeitung.',
        error: scriptError 
      });
    }
  });
});
// ============== ENDE NEUER ABSCHNITT ==============

const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`FATALER FEHLER: Die Umgebungsvariable ${varName} ist nicht gesetzt. Die Anwendung kann nicht starten.`);
    process.exit(1); // Beendet das Programm mit einem Fehlercode
  }
}



// --- Middleware ---
// CORS erlauben, damit der Vite-Server mit dem Backend sprechen kann
app.use(cors());
// Erlaubt das Lesen von JSON-Daten aus dem Body von Anfragen
app.use(express.json());


// --- Pfade zu den "Datenbank"-Dateien ---
const DATA_DIR = '/data';
const COMMENTS_PATH = path.join(DATA_DIR, 'comments.json');
const NOTIFICATION_LIST_PATH = path.join(DATA_DIR, 'notification-list.json');


// --- Hilfsfunktionen ---

// Stellt sicher, dass das /data Verzeichnis existiert
const ensureDataDirExists = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

// Liest Kommentare aus der Datei (robust gegen leere oder nicht-existente Dateien)
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
    return []; // Bei Fehler ein leeres Array zurückgeben
  }
};

// Schreibt Kommentare in die Datei
const writeComments = (comments) => {
  ensureDataDirExists();
  fs.writeFileSync(COMMENTS_PATH, JSON.stringify(comments, null, 2), 'utf-8');
};

// --- E-Mail Konfiguration (Nodemailer) ---
// WICHTIG: Stellt sicher, dass die .env-Datei im backend-Verzeichnis existiert!
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// --- API Endpunkte ---

// GET: Alle Kommentare abrufen
app.get('/api/comments', (req, res) => {
  try {
    const comments = readComments();
    res.status(200).json(comments);
  } catch (error) {
    console.error('Fehler beim Lesen der Kommentare:', error);
    res.status(500).send('Serverfehler beim Lesen der Kommentare.');
  }
});

// POST: Einen neuen Kommentar hinzufügen UND Benachrichtigungen senden
app.post('/api/comments', (req, res) => {
  try {
    // 1. Kommentar speichern (Ihre bisherige Logik)
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

    // ==========================================================
    // 2. E-Mail-Benachrichtigungen versenden (Die fehlende Logik)
    // ==========================================================
    
    // Lese die Liste aller potenziellen Empfänger
    let allUsers = [];
    if (fs.existsSync(NOTIFICATION_LIST_PATH)) {
      const usersFileContent = fs.readFileSync(NOTIFICATION_LIST_PATH, 'utf-8');
      if (usersFileContent.trim() !== '') {
        allUsers = JSON.parse(usersFileContent);
      }
    }

    // Finde die Empfänger, die eine sofortige Benachrichtigung wünschen
    // und die NICHT der Autor des Kommentars sind.
    const recipients = allUsers.filter(user => 
      user.notificationFrequency === 'immediate' && 
      user.email !== req.body.author.email
    );

    // Wenn es Empfänger gibt, sende E-Mails
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
          // Fehler nur in der Konsole loggen, damit die App nicht abstürzt
          console.error(`Fehler beim Senden der E-Mail an ${recipient.email}:`, err);
        });
      });
    }

    // 3. Erfolgreiche Antwort an das Frontend senden
    res.status(201).json(newComment);

  } catch (error) {
    console.error('Fehler beim Verarbeiten des neuen Kommentars:', error);
    res.status(500).send('Serverfehler beim Verarbeiten des Kommentars.');
  }
});

// POST: Einen Benutzer speichern oder aktualisieren
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


// NEU: Endpunkt zum Löschen von Kommentaren (nur für Admins)
app.post('/api/comments/delete', (req, res) => {
  try {
    const { commentId, user } = req.body;

    // Sicherheitsprüfung: Ist der anfragende Benutzer der Admin?
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).send('Zugriff verweigert. Nur für Admins.');
    }

    const comments = readComments();

    // Filtere den zu löschenden Kommentar aus der Liste heraus
    const updatedComments = comments.filter(comment => comment.id !== commentId);

    // Prüfe, ob ein Kommentar tatsächlich gelöscht wurde
    if (comments.length === updatedComments.length) {
      return res.status(404).send('Kommentar nicht gefunden.');
    }

    // Schreibe die aktualisierte Kommentarliste zurück in die Datei
    writeComments(updatedComments);

    res.status(200).send('Kommentar erfolgreich gelöscht.');

  } catch (error) {
    console.error('Fehler beim Löschen des Kommentars:', error);
    res.status(500).send('Serverfehler beim Löschen des Kommentars.');
  }
});

// --- Server Start ---
//const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// Datenbankverbindung beim Start testen
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