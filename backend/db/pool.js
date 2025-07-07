const { Pool } = require('pg');
require('dotenv').config();

// Erstelle EINEN globalen Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Wichtige Einstellungen für Stabilität
    max: 20,                    // max. Anzahl Verbindungen im Pool
    idleTimeoutMillis: 30000,   // 30 Sekunden idle timeout
    connectionTimeoutMillis: 2000,
});

// Error Handler für den Pool
pool.on('error', (err, client) => {
    console.error('Unerwarteter Fehler im PostgreSQL Pool', err);
    // Verhindert, dass die App abstürzt
});

module.exports = pool;