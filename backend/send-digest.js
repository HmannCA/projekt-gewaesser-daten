// mailer-backend/send-digest.js
require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const DATA_DIR = '/data';
const USER_DB_PATH = path.join(DATA_DIR, 'notification-list.json');
const PENDING_COMMENTS_PATH = path.join(DATA_DIR, 'pending-comments.json');

// Helferfunktionen (wie in server.js)
const readDb = (filePath) => { /* ... kopieren Sie die readDb Funktion aus server.js hierher ... */ };
const writeDb = (filePath, data) => { /* ... kopieren Sie die writeDb Funktion aus server.js hierher ... */ };

const sendDigestEmail = async () => {
  console.log('Starte den Versand der täglichen Zusammenfassung...');
  const pendingComments = readDb(PENDING_COMMENTS_PATH);
  if (pendingComments.length === 0) {
    console.log('Keine neuen Kommentare zum Versenden.');
    return;
  }

  const allUsers = readDb(USER_DB_PATH);
  const dailyRecipients = allUsers.filter(u => u.notificationFrequency === 'daily').map(u => u.email);

  if (dailyRecipients.length === 0) {
    console.log('Keine Empfänger für die tägliche Zusammenfassung.');
    fs.unlinkSync(PENDING_COMMENTS_PATH); // Trotzdem die Warteschlange leeren
    return;
  }

  // E-Mail-Inhalt generieren
  let emailHtml = `<p>Hallo,</p><p>hier ist die Zusammenfassung der neuen Kommentare des heutigen Tages:</p>`;
  pendingComments.forEach(c => {
    emailHtml += `
      <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
        <p><b>${c.author.firstName} ${c.author.lastName}</b> kommentierte im Abschnitt "<b>${c.sectionTitle}</b>":</p>
        <blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 1em; font-style: italic;">
          ${c.commentText}
        </blockquote>
      </div>
    `;
  });

  // Transporter konfigurieren
  let transporter = nodemailer.createTransport({ /* ... Ihre SMTP-Konfiguration ... */ });

  // E-Mail senden
  try {
    await transporter.sendMail({
      from: `"Gewässer-Projekt" <${process.env.SMTP_USER}>`,
      to: dailyRecipients.join(', '),
      subject: `Tägliche Zusammenfassung der Kommentare`,
      html: emailHtml,
    });
    console.log('Digest erfolgreich versendet an:', dailyRecipients.join(', '));
    // Warteschlange leeren
    fs.unlinkSync(PENDING_COMMENTS_PATH);
  } catch (error) {
    console.error('Fehler beim Versand des Digests:', error);
  }
};

sendDigestEmail();