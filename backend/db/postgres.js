// backend/db/postgres.js
// HINWEIS: Ergänzt um die Logik zum Speichern der Validierungsergebnisse

const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL wird nur in der Produktionsumgebung (auf Fly.io) aktiviert.
  // Lokal (für den Proxy) wird es deaktiviert.
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

const testConnection = async () => { /* ... bleibt unverändert ... */ };
const createDatabaseTables = async () => { /* ... bleibt unverändert ... */ };
const getComments = async (req, res) => { /* ... bleibt unverändert ... */ };
const addComment = async (req, res) => { /* ... bleibt unverändert ... */ };
const deleteComment = async (req, res) => { /* ... bleibt unverändert ... */ };
const loginUser = async (req, res) => { /* ... bleibt unverändert ... */ };


// --- BEGINN DER NEUEN FUNKTION ZUM DATEN-AUSLESEN ---
const getLatestValidationData = async () => {
    const client = await pool.connect();
    try {
        // 1. Finde den letzten Validierungslauf
        const lastRunRes = await client.query(
            'SELECT * FROM validation_runs ORDER BY run_timestamp DESC LIMIT 1'
        );

        if (lastRunRes.rows.length === 0) {
            return { message: "Noch keine Validierungsdaten in der Datenbank gefunden." };
        }
        const lastRun = lastRunRes.rows[0];

        // 2. Hole alle zugehörigen Tagesergebnisse für diesen Lauf
        const dailyResultsRes = await client.query(
            'SELECT * FROM daily_results WHERE run_id = $1 ORDER BY result_date, parameter_name',
            [lastRun.run_id]
        );
        const dailyResults = dailyResultsRes.rows;

        // 3. (Optional) Hole die ersten paar Rohdatenpunkte für diesen Lauf
        const rawDataRes = await client.query(
            'SELECT * FROM raw_data_points WHERE run_id = $1 ORDER BY "timestamp" LIMIT 10',
            [lastRun.run_id]
        );
        const rawDataSample = rawDataRes.rows;

        // 4. Stelle alles in einem schönen Objekt zusammen
        return {
            zuletzt_ausgefuehrter_job: lastRun,
            aggregierte_tagesergebnisse: dailyResults,
            stichprobe_der_rohdaten: rawDataSample
        };

    } catch (err) {
        console.error('[DB] Fehler beim Auslesen der Validierungsdaten:', err);
        throw new Error(`DB-Fehler beim Auslesen: ${err.message}`);
    } finally {
        client.release();
    }
};


// ========================================================
// --- BEGINN DER ERGÄNZUNG ---

// Hilfsfunktion, um die station_id aus dem Ergebnis-JSON zu extrahieren
const getStationId = (resultData) => {
    if (!resultData) return null;
    // Wir nehmen den ersten Datums-Eintrag
    const firstDayKey = Object.keys(resultData)[0];
    if (!firstDayKey) return null;
    const firstDayData = resultData[firstDayKey];
    // Wir nehmen den ersten Parameter-Eintrag
    const firstParamKey = Object.keys(firstDayData)[0];
    if (!firstParamKey || !firstParamKey.includes('_')) return null;
    // Wir extrahieren die station_id aus dem Schlüssel (Annahme: "Parameter_Mittelwert")
    // Dies muss ggf. angepasst werden, falls der Schlüssel anders aussieht
    return 'wamo_placeholder'; // Platzhalter, da die ID nicht direkt in der JSON ist
};

/**
 * Speichert die Ergebnisse eines kompletten Validierungslaufs in der Datenbank.
 * @param {Object} resultData - Das JSON-Objekt aus der Python-Pipeline.
 * @param {string} sourceFile - Der Name der hochgeladenen ZIP-Datei.
 */
const saveValidationData = async (resultData, sourceFile) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const stationId = getStationId(resultData) || 'unbekannte_station';

        // 1. Einen neuen Eintrag für den Validierungslauf erstellen
        const runResult = await client.query(
            'INSERT INTO validation_runs (station_id, source_zip_file) VALUES ($1, $2) RETURNING run_id',
            [stationId, sourceFile]
        );
        const runId = runResult.rows[0].run_id;
        console.log(`Neuer Validierungslauf mit ID ${runId} für Station ${stationId} erstellt.`);

        // 2. Die aggregierten Tagesergebnisse speichern
        for (const dateStr in resultData) {
            const dayData = resultData[dateStr];
            const resultDate = new Date(dateStr).toISOString().split('T')[0]; // Format YYYY-MM-DD

            const parameters = {};
            // Daten aus dem flachen JSON-Format in ein strukturiertes Objekt umwandeln
            for (const key in dayData) {
                const parts = key.split('_');
                const valueType = parts.pop();
                const paramName = parts.join('_');

                if (!parameters[paramName]) parameters[paramName] = {};
                parameters[paramName][valueType] = dayData[key];
            }

            // Jeden Parameter als eigene Zeile in die DB schreiben
            for (const paramName in parameters) {
                const p = parameters[paramName];
                await client.query(
                    `INSERT INTO daily_results (run_id, result_date, parameter_name, mean_value, min_value, max_value, std_dev, median_value, qartod_flag, qartod_reason, good_value_percentage)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [runId, resultDate, paramName, p.Mittelwert, p.Min, p.Max, p.StdAbw, p.Median, p.Aggregat, p.Aggregat, p.Anteil]
                    // HINWEIS: Hier müssen die Schlüsselnamen (p.Mittelwert etc.) exakt mit denen in Ihrer JSON übereinstimmen!
                );
            }
        }
        console.log(`Alle Tagesergebnisse für Lauf ${runId} gespeichert.`);
        
        // TODO: Hier fehlt noch die Logik zum Speichern der Rohdaten (`raw_data_points`)

        await client.query('COMMIT');
        return { success: true, runId: runId };

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Datenbankfehler beim Speichern der Validierungsdaten:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } finally {
        client.release();
    }
};

const logUserLogin = async (userData) => {
    const query = `
        INSERT INTO benutzer_anmeldungen (vorname, nachname, email, benachrichtigungen)
        VALUES ($1, $2, $3, $4)
    `;
    try {
        await pool.query(query, [
            userData.firstName,
            userData.lastName,
            userData.email,
            userData.notificationFrequency
        ]);
        console.log(`[AUDIT] Benutzeranmeldung für ${userData.email} erfolgreich protokolliert.`);
        return { success: true };
    } catch (error) {
        console.error(`[AUDIT] Fehler beim Protokollieren der Benutzeranmeldung:`, error.message);
        return { success: false, message: error.message };
    }
};

const getAllTableData = async () => {
    const client = await pool.connect();
    try {
        // Wir fragen alle Tabellen ab, die in der DB existieren könnten.
        const tables = [
            'stations', 
            'station_coordinates', 
            'station_catchment_areas', 
            'station_data_status',
            'parameters', 
            'config_rules', 
            'benutzer_anmeldungen', 
            'messwerte', 
            'validation_runs', 
            'daily_results', 
            'raw_data_points'
        ];
        const allData = {};

        for (const table of tables) {
            try {
                // Wir fragen die 100 neuesten Einträge ab, sortiert nach der ersten Spalte (oft die ID oder ein Timestamp)
                const res = await client.query(`SELECT * FROM ${table} ORDER BY 1 DESC LIMIT 100`);
                allData[table] = res.rows;
            } catch (e) {
                // Wenn eine Tabelle nicht existiert, ignorieren wir den Fehler und fahren fort.
                if (e.code === '42P01') { // 'undefined_table' error code in PostgreSQL
                    console.log(`[DB Info] Tabelle '${table}' nicht gefunden, wird übersprungen.`);
                    allData[table] = { "status": "Tabelle nicht gefunden." };
                } else {
                    throw e; // Andere Fehler werfen wir weiter
                }
            }
        }
        
        return allData;

    } catch (err) {
        console.error('[DB] Fehler beim Auslesen aller Tabellen:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } finally {
        client.release();
    }
};

module.exports = {
  testConnection,
  createDatabaseTables, // Behalten wir vorerst
  getComments,
  addComment,
  deleteComment,
  loginUser,
  saveValidationData,
  getLatestValidationData,
  logUserLogin,
  getAllTableData
};