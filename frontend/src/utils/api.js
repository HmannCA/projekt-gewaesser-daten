// frontend/src/utils/api.js
// HINWEIS: Ergänzt um die Funktion für den ZIP-Upload.

import { API_URL } from '../constants/config';

// Ihre bestehenden Funktionen (unverändert)
export const getCommentsForSection = async (sectionId) => {
    const response = await fetch(`${API_URL}/api/comments/${sectionId}`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
};

export const postComment = async (commentData) => {
    const response = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to post comment');
    return response.json();
};

export const deleteCommentById = async (commentId) => {
    const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete comment');
    return response.json();
};

export const login = async (email) => {
    const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to login');
    return response.json();
};

// ==========================================================
// --- BEGINN DER ERGÄNZUNG ---

/**
 * Lädt eine ZIP-Datei zum Backend hoch, um die Validierungspipeline zu starten.
 * @param {File} file Die hochzuladende ZIP-Datei.
 * @returns {Promise<Object>} Das JSON-Ergebnis von der Pipeline.
 */
export const uploadAndValidateZip = async (file) => {
  const formData = new FormData();
  formData.append('file', file); // Der Schlüssel 'file' muss mit dem im Backend (upload.single('file')) übereinstimmen

  // Wir verwenden hier den korrekten Endpunkt aus unserer erweiterten server.js
  const response = await fetch(`${API_URL}/api/validate-data-zip`, {
    method: 'POST',
    body: formData,
    // WICHTIG: Bei FormData darf der 'Content-Type' Header NICHT manuell gesetzt werden.
    // Der Browser setzt ihn automatisch korrekt inklusive des 'boundary'-Parameters.
  });

  // Robuste Fehlerbehandlung
  if (!response.ok) {
    // Versuchen, eine detaillierte Fehlermeldung vom Backend zu parsen
    const errorData = await response.json().catch(() => ({ 
        message: `Der Server antwortete mit einem Fehlercode: ${response.status}` 
    }));
    throw new Error(errorData.message || 'Ein unbekannter Fehler ist beim Server aufgetreten.');
  }

  // Wenn alles gut ging, das JSON-Ergebnis zurückgeben
  return response.json();
};

// --- ENDE DER ERGÄNZUNG ---
// ==========================================================