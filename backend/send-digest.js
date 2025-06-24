// ========================================================================
// FINALE, PRODUKTIVE VERSION 5.0 der send-digest.js - Mit "Bulletproof" Datums-Parser
// ========================================================================

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { generateDigestHtml } = require('./email-template.js');
require('dotenv').config();

// --- Pfade ---
const DATA_DIR = path.join(__dirname, 'data');
const COMMENTS_PATH = path.join(DATA_DIR, 'comments.json');
const NOTIFICATION_LIST_PATH = path.join(DATA_DIR, 'notification-list.json');
const SECTION_MAP_PATH = path.join(DATA_DIR, 'section-map.json');

// --- Hilfsfunktionen ---
const readJsonFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return fileContent ? JSON.parse(fileContent) : {};
};

// NEU: Eine einzige, robuste Funktion, die alle Zeitstempel-Formate verarbeiten kann
const parseTimestamp = (timestampString) => {
    if (!timestampString || typeof timestampString !== 'string') return null;

    // Versuch 1: Direkte Verarbeitung (funktioniert für neue ISO-Strings)
    let date = new Date(timestampString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    // Versuch 2: Verarbeitung des alten deutschen Formats "TT.MM.JJJJ, HH:MM:SS"
    if (timestampString.includes('.') && timestampString.includes(',')) {
        const [datePart, timePart] = timestampString.split(',');
        const [day, month, year] = datePart.trim().split('.');
        if (day && month && year && timePart) {
            const [hour, minute, second] = timePart.trim().split(':');
            // Erstellt ein Datumsobjekt, das zuverlässig geparst werden kann
            date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour}:${minute}:${second}`);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }
    
    // Wenn alle Versuche scheitern
    console.warn(`Konnte Zeitstempel nicht verarbeiten: "${timestampString}"`);
    return null;
};


// --- E-Mail Konfiguration ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: process.env.SMTP_PORT, secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});


// --- Hauptlogik ---
console.log('Starte Versand der täglichen Zusammenfassung...');

const allComments = Array.isArray(readJsonFile(COMMENTS_PATH)) ? readJsonFile(COMMENTS_PATH) : [];
const allUsers = Array.isArray(readJsonFile(NOTIFICATION_LIST_PATH)) ? readJsonFile(NOTIFICATION_LIST_PATH) : [];
const sectionMap = readJsonFile(SECTION_MAP_PATH);

const dailyRecipients = allUsers.filter(user => user.notificationFrequency === 'daily');

// Datumsvergleich, der jetzt die neue parse-Funktion nutzt
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const todaysComments = allComments.filter(comment => {
    const commentDate = parseTimestamp(comment.timestamp);
    if (!commentDate) return false;
    commentDate.setHours(0, 0, 0, 0);
    return commentDate.getTime() === todayStart.getTime();
});


if (!todaysComments.length || !dailyRecipients.length) {
  console.log('Keine neuen Kommentare oder keine Empfänger gefunden. Versand wird beendet.');
  process.exit(0);
}

// Kommentare nach Prozessschritt gruppieren
const commentsByStep = todaysComments.reduce((acc, comment) => {
  const step = comment.stepId || 'Allgemein';
  if (!acc[step]) acc[step] = [];
  // Wir fügen das geparste Datum direkt zum Kommentarobjekt hinzu für spätere Verwendung
  comment.parsedDate = parseTimestamp(comment.timestamp); 
  acc[step].push(comment);
  return acc;
}, {});

// HTML-Body generieren und dabei das geparste Datum verwenden
const applicationUrl = 'https://wasserqualitaet-vg.fly.dev/';
const htmlBody = generateDigestHtml(commentsByStep, sectionMap, applicationUrl);

console.log(`Sende Zusammenfassung mit ${todaysComments.length} Kommentaren an ${dailyRecipients.length} Empfänger...`);

dailyRecipients.forEach(recipient => {
  transporter.sendMail({
    from: `"Digitale Gewässergüte" <${process.env.SMTP_USER}>`,
    to: recipient.email,
    subject: `Tageszusammenfassung: ${todaysComments.length} neue Kommentare`,
    html: htmlBody,
  }).then(() => console.log(`E-Mail an ${recipient.email} gesendet.`))
    .catch(err => console.error(`Fehler beim Senden an ${recipient.email}:`, err));
});