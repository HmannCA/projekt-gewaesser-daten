// backend/db/postgres.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Datenbank erfolgreich verbunden');
        client.release();
        return true;
    } catch (err) {
        console.error('❌ Datenbankverbindung fehlgeschlagen:', err);
        return false;
    }
};

// ========================================================
// --- NEUE FUNKTION ZUM ERSTELLEN DER TABELLEN ---
const createDatabaseTables = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Startet eine Transaktion

        const createRunsTable = `
            CREATE TABLE IF NOT EXISTS validation_runs (
                run_id SERIAL PRIMARY KEY,
                station_id VARCHAR(255) NOT NULL,
                run_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                source_zip_file VARCHAR(255)
            );
        `;
        await client.query(createRunsTable);
        console.log('Tabelle "validation_runs" erfolgreich geprüft/erstellt.');

        const createRawPointsTable = `
            CREATE TABLE IF NOT EXISTS raw_data_points (
                point_id SERIAL PRIMARY KEY,
                run_id INTEGER NOT NULL REFERENCES validation_runs(run_id) ON DELETE CASCADE,
                station_id VARCHAR(255) NOT NULL,
                "timestamp" TIMESTAMPTZ NOT NULL,
                parameter_name VARCHAR(255) NOT NULL,
                raw_value FLOAT,
                final_qartod_flag INTEGER,
                final_reason TEXT
            );
        `;
        await client.query(createRawPointsTable);
        console.log('Tabelle "raw_data_points" erfolgreich geprüft/erstellt.');

        const createResultsTable = `
            CREATE TABLE IF NOT EXISTS daily_results (
                result_id SERIAL PRIMARY KEY,
                run_id INTEGER NOT NULL REFERENCES validation_runs(run_id) ON DELETE CASCADE,
                result_date DATE NOT NULL,
                parameter_name VARCHAR(255) NOT NULL,
                mean_value FLOAT,
                min_value FLOAT,
                max_value FLOAT,
                std_dev FLOAT,
                median_value FLOAT,
                qartod_flag INTEGER,
                qartod_reason TEXT,
                good_value_percentage FLOAT,
                UNIQUE(run_id, result_date, parameter_name) 
            );
        `;
        await client.query(createResultsTable);
        console.log('Tabelle "daily_results" erfolgreich geprüft/erstellt.');

        await client.query('COMMIT'); // Schließt die Transaktion erfolgreich ab
        return { success: true, message: 'Alle Tabellen erfolgreich geprüft/erstellt.' };
    } catch (err) {
        await client.query('ROLLBACK'); // Macht alle Änderungen rückgängig, falls ein Fehler auftritt
        console.error('Fehler beim Erstellen der Tabellen:', err);
        return { success: false, message: `Fehler beim Erstellen der Tabellen: ${err.message}` };
    } finally {
        client.release(); // Gibt die Verbindung zum Pool frei
    }
};
// --- ENDE DER NEUEN FUNKTION ---
// ========================================================


// Bestehende Funktionen bleiben unverändert
const getComments = async (req, res) => { /* ... Ihr Code ... */ };
const addComment = async (req, res) => { /* ... Ihr Code ... */ };
const deleteComment = async (req, res) => { /* ... Ihr Code ... */ };
const loginUser = async (req, res) => { /* ... Ihr Code ... */ };

module.exports = {
  testConnection,
  getComments,
  addComment,
  deleteComment,
  loginUser,
  createDatabaseTables // Die neue Funktion exportieren
};