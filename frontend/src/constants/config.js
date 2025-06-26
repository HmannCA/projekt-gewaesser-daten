// API-Konfiguration
const isDevelopment = window.location.hostname === 'localhost';

export const API_BASE_URL = isDevelopment 
  ? '' 
  : 'https://wasserqualitaet-vg-bitter-frost-7826.fly.dev';

// Detail Level Konstanten
export const DETAIL_LEVELS = {
  OVERVIEW: 'überblick',
  DETAILS: 'details',
  TECHNICAL: 'technik'
};

// Level Icons und Colors für Wiederverwendung
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