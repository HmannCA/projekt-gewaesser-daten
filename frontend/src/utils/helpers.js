// Hilfsfunktionen für die Anwendung

/**
 * Formatiert ein Datum für die deutsche Anzeige
 * @param {string|Date} date - Das zu formatierende Datum
 * @returns {string} Formatiertes Datum
 */
export const formatDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatiert einen Zeitstempel für die Anzeige
 * @param {string|Date} timestamp - Der Zeitstempel
 * @returns {string} Formatierter Zeitstempel
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('de-DE');
};

/**
 * Validiert eine E-Mail-Adresse
 * @param {string} email - Die zu validierende E-Mail
 * @returns {boolean} Ob die E-Mail gültig ist
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Erstellt eine Verzögerung (für Animationen etc.)
 * @param {number} ms - Millisekunden
 * @returns {Promise} Promise die nach ms resolved
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Deep Clone eines Objekts
 * @param {Object} obj - Das zu klonende Objekt
 * @returns {Object} Geklontes Objekt
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Gruppiert ein Array von Objekten nach einem Schlüssel
 * @param {Array} array - Das zu gruppierende Array
 * @param {string} key - Der Schlüssel nach dem gruppiert wird
 * @returns {Object} Gruppiertes Objekt
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Debounce-Funktion für Suchfelder etc.
 * @param {Function} func - Die zu debouncende Funktion
 * @param {number} wait - Wartezeit in ms
 * @returns {Function} Debounced Funktion
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Konvertiert einen HEX-Farbwert zu RGB
 * @param {string} hex - HEX-Farbwert
 * @returns {Object} RGB-Objekt mit r, g, b Werten
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Generiert eine zufällige ID
 * @returns {string} Zufällige ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Prüft ob wir uns in der Entwicklungsumgebung befinden
 * @returns {boolean} True wenn Entwicklung
 */
export const isDevelopment = () => {
  return window.location.hostname === 'localhost';
};

/**
 * Speichert Daten im LocalStorage mit JSON-Serialisierung
 * @param {string} key - Der Schlüssel
 * @param {any} data - Die zu speichernden Daten
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Fehler beim Speichern im LocalStorage:', error);
  }
};

/**
 * Lädt Daten aus dem LocalStorage mit JSON-Deserialisierung
 * @param {string} key - Der Schlüssel
 * @param {any} defaultValue - Standardwert falls nichts gefunden wird
 * @returns {any} Die geladenen Daten oder defaultValue
 */
export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Fehler beim Laden aus LocalStorage:', error);
    return defaultValue;
  }
};

/**
 * Formatiert einen numerischen Wert mit deutscher Notation
 * @param {number} value - Der zu formatierende Wert
 * @param {number} decimals - Anzahl der Nachkommastellen
 * @returns {string} Formatierter Wert
 */
export const formatNumber = (value, decimals = 2) => {
  if (typeof value !== 'number') return value;
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Extrahiert Initialen aus einem Namen
 * @param {string} name - Der vollständige Name
 * @returns {string} Die Initialen
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Scrollt sanft zu einem Element
 * @param {string} elementId - Die ID des Zielelements
 */
export const smoothScrollTo = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
};