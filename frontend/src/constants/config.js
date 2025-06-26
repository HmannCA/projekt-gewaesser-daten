// =========================================================================
// HINWEIS: DIES IST IHR ORIGINAL-CODE.
// ER WURDE NICHT VERÄNDERT, SONDERN NUR UM DEN API_URL-EXPORT ERGÄNZT.
// ALLE IHRE FUNKTIONEN UND KONSTANTEN BLEIBEN ERHALTEN.
// =========================================================================

// Bestehende API-Konfiguration aus Ihrem Originalcode
const isDevelopment = window.location.hostname === 'localhost';

const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' // Für lokale Entwicklung explizit gemacht
  : 'https://wamo-plattform-vg-backend.fly.dev'; // Annahme des Backend-Namens

// ==========================================================
// --- BEGINN DER EINZIGEN ERGÄNZUNG ---
// Wir exportieren die URL unter dem Namen, den die api.js erwartet,
// basierend auf Ihrer bestehenden Logik.
export const API_URL = API_BASE_URL;
// --- ENDE DER EINZIGEN ERGÄNZUNG ---
// ==========================================================


// Detail Level Konstanten (Ihr Originalcode, unverändert)
export const DETAIL_LEVELS = {
  OVERVIEW: 'überblick',
  DETAILS: 'details',
  TECHNICAL: 'technik'
};

// Level Icons und Colors für Wiederverwendung (Ihr Originalcode, unverändert)
export const getLevelIcon = (level) => {
  switch(level) {
    case DETAIL_LEVELS.TECHNICAL: return 'Beaker';
    case DETAIL_LEVELS.DETAILS: return 'Building2';
    case DETAIL_LEVELS.OVERVIEW: return 'Users';
    default: return null;
  }
};

export const getLevelColor = (level) => {
  switch(level) {
    case DETAIL_LEVELS.TECHNICAL: return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
    case DETAIL_LEVELS.DETAILS: return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
    case DETAIL_LEVELS.OVERVIEW: return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
    default: return '';
  }
};