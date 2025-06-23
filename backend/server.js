// Importiert alle notwendigen Pakete
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');

const app = express();
app.use(express.json());

// CORS-Konfiguration, damit Ihre Frontend-App mit diesem Server sprechen darf
app.use(cors({
  origin: 'https://wasserqualitaet-vg.fly.dev'
}));

// Pfade zu unseren "Datenbank"-Dateien im permanenten Speicher
const DATA_DIR = '/data';
const USER_DB_PATH = path.join(DATA_DIR, 'notification-list.json');
const COMMENTS_DB_PATH = path.join(DATA_DIR, 'comments.json');

// --- HILFSFUNKTIONEN ---
// Liest eine JSON-Datei sicher aus
const readDb = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data.trim() === '' ? [] : JSON.parse(data);
  } catch (error) {
    console.error(`Fehler beim Lesen der Datei ${filePath}:`, error);
    return [];
  }
};
// Schreibt Daten sicher in eine JSON-Datei
const writeDb = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- SMTP TRANSPORTER ---
// Konfiguriert den E-Mail-Versand mit Ihren geheimen Zugangsdaten
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// =================================================================
// API-ENDPUNKTE
// =================================================================

// --- ENDPUNKTE FÜR KOMMENTARE ---

// 1. GET /api/comments: Lädt alle gespeicherten Kommentare
app.get('/api/comments', (req, res) => {
  console.log("Anfrage zum Laden aller Kommentare erhalten.");
  const comments = readDb(COMMENTS_DB_PATH);
  res.status(200).json(comments);
});

// 2. POST /api/comments: Speichert einen neuen Kommentar
app.post('/api/comments', async (req, res) => {
  const { author, text, stepId, sectionId, level } = req.body;
  if (!author || !text || !stepId || !sectionId || !level) {
    return res.status(400).send('Fehlende Daten für neuen Kommentar.');
  }

  const newComment = {
    id: randomBytes(8).toString('hex'),
    author,
    text,
    stepId,
    sectionId,
    level,
    timestamp: new Date().toISOString()
  };

  const comments = readDb(COMMENTS_DB_PATH);
  comments.push(newComment);
  writeDb(COMMENTS_DB_PATH, comments);
  
  console.log(`Neuer Kommentar von ${author.email} mit ID ${newComment.id} gespeichert.`);
  
  // E-Mail-Benachrichtigungen direkt hier anstoßen
  try {
    const allUsers = readDb(USER_DB_PATH);
    const recipients = allUsers
      .filter(u => u.notificationFrequency === 'immediate' && u.email !== author.email)
      .map(u => u.email);

    if (recipients.length > 0) {
      await transporter.sendMail({
        from: `"Gewässer-Projekt" <${process.env.SMTP_USER}>`,
        to: recipients.join(', '),
        subject: `Neuer Kommentar im Abschnitt: ${sectionId}`,
        html: `<p>Hallo,</p><p><b>${author.firstName} ${author.lastName}</b> hat einen neuen Kommentar hinzugefügt:</p><blockquote>${text}</blockquote>`
      });
      console.log(`Sofort-Benachrichtigung gesendet an: ${recipients.join(', ')}`);
    }
  } catch (error) {
    console.error("Fehler beim Senden der Sofort-Benachrichtigung:", error);
  }

  res.status(201).json(newComment);
});

// 3. POST /api/comments/delete: Löscht einen Kommentar
app.post('/api/comments/delete', (req, res) => {
  const { commentId, user } = req.body;

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).send('Keine Berechtigung zum Löschen.');
  }

  let comments = readDb(COMMENTS_DB_PATH);
  const initialLength = comments.length;
  comments = comments.filter(c => c.id !== commentId);

  if (comments.length < initialLength) {
    writeDb(COMMENTS_DB_PATH, comments);
    console.log(`Kommentar ${commentId} von Admin ${user.email} gelöscht.`);
    res.status(200).send('Kommentar erfolgreich gelöscht.');
  } else {
    res.status(404).send('Kommentar nicht gefunden.');
  }
});


// --- ENDPUNKT FÜR NUTZER-LOGIN / EINSTELLUNGEN ---
app.post('/api/user-login', (req, res) => {
    const { email, firstName, lastName, notificationFrequency } = req.body;
    if (!email) {
        return res.status(400).send('E-Mail fehlt.');
    }

    const users = readDb(USER_DB_PATH);
    const userIndex = users.findIndex(u => u.email === email);
    const userData = { email, firstName, lastName, notificationFrequency };

    if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...userData };
    } else {
        users.push(userData);
    }
    writeDb(USER_DB_PATH, users);
    console.log(`Nutzerdaten für ${email} aktualisiert auf Frequenz: ${notificationFrequency}`);
    res.status(200).send('Nutzerdaten erfolgreich gespeichert.');
});


// --- SERVER START ---
const PORT = 3001; // Wir setzen den Port fest auf den Wert aus der fly.toml
const HOST = '0.0.0.0'; // Wir lauschen auf allen verfügbaren Netzwerk-Interfaces

app.listen(PORT, HOST, () => {
  console.log(`Mailer-Service läuft auf http://${HOST}:${PORT}`);
});