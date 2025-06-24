// ========================================================================
// FINAL, KORRIGIERTE VERSION der server.js
// ========================================================================

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

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


// --- Server Start ---
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`================================================`);
  console.log(`✅ Backend-Server erfolgreich gestartet.`);
  console.log(`✅ Lauscht auf http://${HOST}:${PORT}`);
  console.log(`================================================`);
});