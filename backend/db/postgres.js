// backend/db/postgres.js
// Vollständige Version mit allen Funktionen

const { Pool } = require('pg');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
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
// --- TABELLEN ERSTELLEN (Ihre wiederhergestellte Version) ---
const createDatabaseTables = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Validation tables
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

        // KOMMENTARE TABELLE
        const createCommentsTable = `
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                comment_id VARCHAR(255) UNIQUE NOT NULL,
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                author VARCHAR(255) NOT NULL,
                text TEXT NOT NULL,
                step_id VARCHAR(255),
                section_id VARCHAR(255),
                level VARCHAR(50)
            );
        `;
        await client.query(createCommentsTable);
        console.log('Tabelle "comments" erfolgreich geprüft/erstellt.');

        // BENUTZER ANMELDUNGEN TABELLE (existiert schon, aber zur Sicherheit)
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS benutzer_anmeldungen (
                id SERIAL PRIMARY KEY,
                vorname VARCHAR(255) NOT NULL,
                nachname VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                benachrichtigungen VARCHAR(50),
                erstellt_am TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                aktualisiert_am TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createUsersTable);
        console.log('Tabelle "benutzer_anmeldungen" erfolgreich geprüft/erstellt.');

        // MESSWERTE TABELLE (für die Python Pipeline)
        const createMesswerteTable = `
            CREATE TABLE IF NOT EXISTS messwerte (
                id SERIAL PRIMARY KEY,
                zeitstempel DATE NOT NULL,
                see VARCHAR(50) NOT NULL,
                parameter VARCHAR(100) NOT NULL,
                wert NUMERIC,
                qualitaets_flag INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(zeitstempel, see, parameter)
            );
        `;
        await client.query(createMesswerteTable);
        console.log('Tabelle "messwerte" erfolgreich geprüft/erstellt.');

        // In der createDatabaseTables Funktion, nach den bestehenden Tabellen hinzufügen:

        // NEUE TABELLE: Stündliche Messwerte (roh + validiert)
        const createHourlyMeasurementsTable = `
            CREATE TABLE IF NOT EXISTS hourly_measurements (
                id SERIAL PRIMARY KEY,
                station_id VARCHAR(50) NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL,
                parameter VARCHAR(100) NOT NULL,
                
                -- Rohdaten
                raw_value NUMERIC,
                raw_quality_flag INTEGER,
                
                -- Validierte Daten
                validated_value NUMERIC,
                validation_flag INTEGER,
                validation_reason TEXT,
                
                -- Metadaten
                validation_run_id INTEGER REFERENCES validation_runs(run_id),
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                
                UNIQUE(station_id, timestamp, parameter)
            );
        `;
        await client.query(createHourlyMeasurementsTable);
        console.log('Tabelle "hourly_measurements" erfolgreich geprüft/erstellt.');

        // Index für bessere Performance bei Zeitabfragen
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_hourly_measurements_timestamp 
            ON hourly_measurements(timestamp);
        `);

        // NEUE TABELLE: Tages-Aggregationen
        const createDailyAggregationsTable = `
            CREATE TABLE IF NOT EXISTS daily_aggregations (
                id SERIAL PRIMARY KEY,
                station_id VARCHAR(50) NOT NULL,
                date DATE NOT NULL,
                parameter VARCHAR(100) NOT NULL,
                
                -- Aggregierte Werte
                mean_value NUMERIC,
                min_value NUMERIC,
                max_value NUMERIC,
                std_dev NUMERIC,
                median_value NUMERIC,
                
                -- Qualitätsinformationen
                hourly_count INTEGER,
                good_values_count INTEGER,
                good_values_percentage NUMERIC,
                aggregated_flag INTEGER,
                aggregated_reasons TEXT,
                
                -- Metadaten
                validation_run_id INTEGER REFERENCES validation_runs(run_id),
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                
                UNIQUE(station_id, date, parameter)
            );
        `;
        await client.query(createDailyAggregationsTable);
        console.log('Tabelle "daily_aggregations" erfolgreich geprüft/erstellt.');

        // Index für bessere Performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_daily_aggregations_date 
            ON daily_aggregations(date);
        `);

        // OPTIONAL: View für einfachen Zugriff auf die neuesten Tageswerte
        const createLatestDailyView = `
            CREATE OR REPLACE VIEW latest_daily_values AS
            SELECT DISTINCT ON (station_id, parameter) 
                station_id,
                date,
                parameter,
                mean_value,
                min_value,
                max_value,
                good_values_percentage,
                aggregated_flag
            FROM daily_aggregations
            ORDER BY station_id, parameter, date DESC;
        `;
        await client.query(createLatestDailyView);
        console.log('View "latest_daily_values" erfolgreich erstellt.');

        // NEUE TABELLEN FÜR DASHBOARD-DATEN
        
        // Erweiterte Analysen
        const createAnalysesTable = `
            CREATE TABLE IF NOT EXISTS validation_analyses (
                id SERIAL PRIMARY KEY,
                run_id INTEGER REFERENCES validation_runs(run_id) ON DELETE CASCADE,
                analysis_type VARCHAR(50) NOT NULL,
                analysis_data JSONB NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createAnalysesTable);
        console.log('Tabelle "validation_analyses" erfolgreich geprüft/erstellt.');
        
        // Index für bessere Performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_validation_analyses_run_type 
            ON validation_analyses(run_id, analysis_type);
        `);

        // Fehlerhafte Einzelwerte
        const createErrorsTable = `
            CREATE TABLE IF NOT EXISTS validation_errors (
                id SERIAL PRIMARY KEY,
                run_id INTEGER REFERENCES validation_runs(run_id) ON DELETE CASCADE,
                station_id VARCHAR(50) NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL,
                parameter VARCHAR(100) NOT NULL,
                value NUMERIC,
                flag INTEGER NOT NULL,
                flag_name VARCHAR(50),
                reason TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createErrorsTable);
        console.log('Tabelle "validation_errors" erfolgreich geprüft/erstellt.');
        
        // Index für Zeitabfragen
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_validation_errors_timestamp 
            ON validation_errors(run_id, timestamp);
        `);

        // Validierungs-Zusammenfassung
        const createSummariesTable = `
            CREATE TABLE IF NOT EXISTS validation_summaries (
                id SERIAL PRIMARY KEY,
                run_id INTEGER REFERENCES validation_runs(run_id) ON DELETE CASCADE,
                status VARCHAR(20) NOT NULL,
                main_problems TEXT[],
                immediate_actions TEXT[],
                reporting_obligations TEXT[],
                risk_indicators JSONB,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(run_id)
            );
        `;
        await client.query(createSummariesTable);
        console.log('Tabelle "validation_summaries" erfolgreich geprüft/erstellt.');

        await client.query('COMMIT');

        await client.query('COMMIT');
        return { success: true, message: 'Alle Tabellen erfolgreich geprüft/erstellt.' };
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Fehler beim Erstellen der Tabellen:', err);
        return { success: false, message: `Fehler beim Erstellen der Tabellen: ${err.message}` };
    } finally {
        client.release();
    }
};

// ========================================================
// --- KOMMENTAR FUNKTIONEN ---

const getComments = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM comments ORDER BY timestamp DESC');
        return result.rows;
    } catch (err) {
        console.error('[DB] Fehler beim Abrufen der Kommentare:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } finally {
        client.release();
    }
};

const addComment = async (commentData) => {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO comments (comment_id, author, text, step_id, section_id, level, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            Date.now().toString(), // comment_id
            commentData.author,
            commentData.text,
            commentData.stepId,
            commentData.sectionId,
            commentData.level,
            new Date() // timestamp
        ];
        
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error('[DB] Fehler beim Hinzufügen des Kommentars:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } finally {
        client.release();
    }
};

const deleteComment = async (commentId) => {
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM comments WHERE comment_id = $1 RETURNING *';
        const result = await client.query(query, [commentId]);
        
        if (result.rowCount === 0) {
            throw new Error('Kommentar nicht gefunden');
        }
        
        return { success: true, message: 'Kommentar gelöscht' };
    } catch (err) {
        console.error('[DB] Fehler beim Löschen des Kommentars:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } finally {
        client.release();
    }
};

// ========================================================
// --- BENUTZER FUNKTIONEN ---

const loginUser = async (userData) => {
    const client = await pool.connect();
    try {
        // Prüfe ob Benutzer existiert
        const checkQuery = 'SELECT * FROM benutzer_anmeldungen WHERE email = $1';
        const existingUser = await client.query(checkQuery, [userData.email]);
        
        if (existingUser.rows.length > 0) {
            // Update existing user
            const updateQuery = `
                UPDATE benutzer_anmeldungen 
                SET vorname = $1, nachname = $2, benachrichtigungen = $3, aktualisiert_am = CURRENT_TIMESTAMP
                WHERE email = $4
                RETURNING *
            `;
            const result = await client.query(updateQuery, [
                userData.firstName,
                userData.lastName,
                userData.notificationFrequency,
                userData.email
            ]);
            return result.rows[0];
        } else {
            // Insert new user
            const insertQuery = `
                INSERT INTO benutzer_anmeldungen (vorname, nachname, email, benachrichtigungen)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const result = await client.query(insertQuery, [
                userData.firstName,
                userData.lastName,
                userData.email,
                userData.notificationFrequency
            ]);
            return result.rows[0];
        }
    } catch (err) {
        console.error('[DB] Fehler beim Login/Registrierung:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } finally {
        client.release();
    }
};

const getAllUsers = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM benutzer_anmeldungen ORDER BY email');
        return result.rows;
    } catch (err) {
        console.error('[DB] Fehler beim Abrufen der Benutzer:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } finally {
        client.release();
    }
};

// ========================================================
// --- VALIDIERUNGS-DATEN FUNKTIONEN ---

const getLatestValidationData = async () => {
    const client = await pool.connect();
    try {
        const lastRunRes = await client.query(
            'SELECT * FROM validation_runs ORDER BY run_timestamp DESC LIMIT 1'
        );

        if (lastRunRes.rows.length === 0) {
            return { message: "Noch keine Validierungsdaten in der Datenbank gefunden." };
        }
        const lastRun = lastRunRes.rows[0];

        const dailyResultsRes = await client.query(
            'SELECT * FROM daily_results WHERE run_id = $1 ORDER BY result_date, parameter_name',
            [lastRun.run_id]
        );
        const dailyResults = dailyResultsRes.rows;

        const rawDataRes = await client.query(
            'SELECT * FROM raw_data_points WHERE run_id = $1 ORDER BY "timestamp" LIMIT 10',
            [lastRun.run_id]
        );
        const rawDataSample = rawDataRes.rows;

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

const getStationId = (resultData) => {
    if (!resultData) return null;
    const firstDayKey = Object.keys(resultData)[0];
    if (!firstDayKey) return null;
    const firstDayData = resultData[firstDayKey];
    const firstParamKey = Object.keys(firstDayData)[0];
    if (!firstParamKey || !firstParamKey.includes('_')) return null;
    return 'wamo_placeholder';
};

const saveValidationData = async (resultData, sourceFile, stationId = null, hourlyDataPath = null, extendedData = null) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const actualStationId = stationId || 'wamo_placeholder';

        // 1. Validierungslauf erstellen
        const runResult = await client.query(
            'INSERT INTO validation_runs (station_id, source_zip_file) VALUES ($1, $2) RETURNING run_id',
            [actualStationId, sourceFile]
        );
        const runId = runResult.rows[0].run_id;
        console.log(`Neuer Validierungslauf mit ID ${runId} für Station ${actualStationId} erstellt.`);

        // 2. Stundenwerte speichern (wenn vorhanden)
        if (hourlyDataPath && fs.existsSync(hourlyDataPath)) {
            console.log('Lade und speichere Stundenwerte...');
            const hourlyData = JSON.parse(fs.readFileSync(hourlyDataPath, 'utf-8'));
            await saveHourlyMeasurements(hourlyData, runId, client);
        }

        // 3. Tageswerte speichern (wie vorher)
        for (const dateStr in resultData) {
            const dayData = resultData[dateStr];
            const resultDate = new Date(dateStr).toISOString().split('T')[0];

            // Gruppiere die Daten nach Parameter
            const parameters = {};
            
            for (const key in dayData) {
                let paramName, valueType;
                
                if (key.endsWith('_Mittelwert')) {
                    paramName = key.replace('_Mittelwert', '');
                    valueType = 'Mittelwert';
                } else if (key.endsWith('_Min')) {
                    paramName = key.replace('_Min', '');
                    valueType = 'Min';
                } else if (key.endsWith('_Max')) {
                    paramName = key.replace('_Max', '');
                    valueType = 'Max';
                } else if (key.endsWith('_StdAbw')) {
                    paramName = key.replace('_StdAbw', '');
                    valueType = 'StdAbw';
                } else if (key.endsWith('_Median')) {
                    paramName = key.replace('_Median', '');
                    valueType = 'Median';
                } else if (key.endsWith('_Anteil_Guter_Werte_Prozent')) {
                    paramName = key.replace('_Anteil_Guter_Werte_Prozent', '');
                    valueType = 'Anteil';
                } else if (key.endsWith('_Aggregat_QARTOD_Flag')) {
                    paramName = key.replace('_Aggregat_QARTOD_Flag', '');
                    valueType = 'Flag';
                } else if (key.endsWith('_Aggregat_Gruende')) {
                    paramName = key.replace('_Aggregat_Gruende', '');
                    valueType = 'Gruende';
                } else if (key.endsWith('_Anzahl_Stunden')) {
                    paramName = key.replace('_Anzahl_Stunden', '');
                    valueType = 'AnzahlStunden';
                } else {
                    continue;
                }
                
                if (!parameters[paramName]) parameters[paramName] = {};
                parameters[paramName][valueType] = dayData[key];
            }

            // Speichere in beiden Tabellen
            for (const paramName in parameters) {
                const p = parameters[paramName];
                
                if (p.Mittelwert !== undefined || p.Min !== undefined || p.Max !== undefined) {
                    
                    // ALTE Tabelle (daily_results)
                    await client.query(
                        `INSERT INTO daily_results 
                         (run_id, result_date, parameter_name, mean_value, min_value, max_value, 
                          std_dev, median_value, qartod_flag, qartod_reason, good_value_percentage)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                        [
                            runId, resultDate, paramName, 
                            p.Mittelwert || null, p.Min || null, p.Max || null,
                            p.StdAbw || null, p.Median || null,
                            p.Flag || null, p.Gruende || null, p.Anteil || null
                        ]
                    );

                    // NEUE Tabelle (daily_aggregations)
                    const hourlyCount = p.AnzahlStunden || 24;
                    const goodPercentage = p.Anteil || 0;
                    const goodCount = Math.round((goodPercentage / 100) * hourlyCount);

                    await client.query(
                        `INSERT INTO daily_aggregations 
                         (station_id, date, parameter, mean_value, min_value, max_value, 
                          std_dev, median_value, hourly_count, good_values_count, 
                          good_values_percentage, aggregated_flag, aggregated_reasons, validation_run_id)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                         ON CONFLICT (station_id, date, parameter) 
                         DO UPDATE SET 
                            mean_value = EXCLUDED.mean_value,
                            min_value = EXCLUDED.min_value,
                            max_value = EXCLUDED.max_value,
                            std_dev = EXCLUDED.std_dev,
                            median_value = EXCLUDED.median_value,
                            hourly_count = EXCLUDED.hourly_count,
                            good_values_count = EXCLUDED.good_values_count,
                            good_values_percentage = EXCLUDED.good_values_percentage,
                            aggregated_flag = EXCLUDED.aggregated_flag,
                            aggregated_reasons = EXCLUDED.aggregated_reasons,
                            validation_run_id = EXCLUDED.validation_run_id`,
                        [
                            actualStationId, resultDate, paramName,
                            p.Mittelwert || null, p.Min || null, p.Max || null,
                            p.StdAbw || null, p.Median || null,
                            hourlyCount, goodCount, goodPercentage,
                            p.Flag || null, p.Gruende || null, runId
                        ]
                    );
                }
            }
        }
        
        // 4. NEU: Erweiterte Daten speichern (wenn übergeben)
        if (extendedData) {
            console.log('\n=== Speichere erweiterte Dashboard-Daten ===');
            
            // Erweiterte Analysen
            if (extendedData.erweiterte_analysen) {
                await saveExtendedAnalyses(runId, extendedData.erweiterte_analysen, client);
            }
            
            // Zusammenfassung
            if (extendedData.zusammenfassung) {
                await saveValidationSummary(runId, extendedData.zusammenfassung, client);
            }
            
            // Fehlerhafte Werte
            if (extendedData.fehlerhafte_werte) {
                await saveValidationErrors(runId, extendedData.fehlerhafte_werte, actualStationId, client);
            }
        }
        
        console.log(`✅ Alle Daten erfolgreich gespeichert.`);

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
        ON CONFLICT (email) 
        DO UPDATE SET 
            aktualisiert_am = CURRENT_TIMESTAMP,
            benachrichtigungen = EXCLUDED.benachrichtigungen
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
        // Erst alle Tabellen aus dem public Schema ermitteln
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;
        
        const tablesResult = await client.query(tablesQuery);
        const tables = tablesResult.rows.map(row => row.table_name);
        
        console.log(`Gefundene Tabellen: ${tables.join(', ')}`);
        
        const allData = {};

        // Dann alle Tabellen durchgehen
        for (const table of tables) {
            try {
                const res = await client.query(`SELECT * FROM ${table} ORDER BY 1 DESC LIMIT 100`);
                allData[table] = res.rows;
            } catch (e) {
                console.error(`Fehler beim Lesen der Tabelle '${table}':`, e.message);
                allData[table] = { "error": e.message };
            }
        }
        
        // Optional: Auch Views einbeziehen
        const viewsQuery = `
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        
        const viewsResult = await client.query(viewsQuery);
        const views = viewsResult.rows.map(row => row.table_name);
        
        if (views.length > 0) {
            console.log(`Gefundene Views: ${views.join(', ')}`);
            
            for (const view of views) {
                try {
                    const res = await client.query(`SELECT * FROM ${view} LIMIT 100`);
                    allData[`VIEW: ${view}`] = res.rows;
                } catch (e) {
                    console.error(`Fehler beim Lesen der View '${view}':`, e.message);
                    allData[`VIEW: ${view}`] = { "error": e.message };
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

const saveHourlyMeasurements = async (hourlyData, runId, client) => {
    // const client = await pool.connect();
    try {
        console.log(`Speichere ${hourlyData.stundenwerte.length} Stundenwerte...`);
        
        // Batch-Insert für bessere Performance
        const values = [];
        const placeholders = [];
        let paramIndex = 1;
        
        hourlyData.stundenwerte.forEach((measurement) => {
            placeholders.push(
                `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, 
                  $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
            );
            
            values.push(
                measurement.station_id,
                measurement.timestamp,
                measurement.parameter,
                measurement.raw_value,
                measurement.validated_value,
                measurement.validation_flag,
                measurement.validation_reason,
                runId
            );
        });
        
        if (placeholders.length > 0) {
            const query = `
                INSERT INTO hourly_measurements 
                (station_id, timestamp, parameter, raw_value, validated_value, 
                 validation_flag, validation_reason, validation_run_id)
                VALUES ${placeholders.join(', ')}
                ON CONFLICT (station_id, timestamp, parameter) 
                DO UPDATE SET 
                    validated_value = EXCLUDED.validated_value,
                    validation_flag = EXCLUDED.validation_flag,
                    validation_reason = EXCLUDED.validation_reason,
                    validation_run_id = EXCLUDED.validation_run_id
            `;
            
            await client.query(query, values);
            console.log(`✅ ${hourlyData.stundenwerte.length} Stundenwerte erfolgreich gespeichert.`);
        }
        
        return { success: true };
    } catch (err) {
        console.error('Fehler beim Speichern der Stundenwerte:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } 
    //finally {
    //    client.release();
    //}
};

// ========================================================
// --- NEUE DASHBOARD DATEN FUNKTIONEN ---
// ========================================================

const saveExtendedAnalyses = async (runId, analyses, client) => {
    try {
        console.log('Speichere erweiterte Analysen...');
        
        for (const [analysisType, analysisData] of Object.entries(analyses)) {
            await client.query(
                `INSERT INTO validation_analyses (run_id, analysis_type, analysis_data) 
                 VALUES ($1, $2, $3)`,
                [runId, analysisType, analysisData]
            );
            console.log(`  - ${analysisType} gespeichert`);
        }
        
        console.log('✅ Alle erweiterten Analysen erfolgreich gespeichert');
    } catch (err) {
        console.error('Fehler beim Speichern der erweiterten Analysen:', err);
        throw new Error(`DB-Fehler bei erweiterten Analysen: ${err.message}`);
    }
};

const saveValidationSummary = async (runId, summary, client) => {
    try {
        console.log('Speichere Validierungs-Zusammenfassung...');
        
        await client.query(
            `INSERT INTO validation_summaries 
             (run_id, status, main_problems, immediate_actions, 
              reporting_obligations, risk_indicators) 
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (run_id) DO UPDATE SET
                status = EXCLUDED.status,
                main_problems = EXCLUDED.main_problems,
                immediate_actions = EXCLUDED.immediate_actions,
                reporting_obligations = EXCLUDED.reporting_obligations,
                risk_indicators = EXCLUDED.risk_indicators`,
            [
                runId,
                summary.status || 'unbekannt',
                summary.hauptprobleme || [],
                summary.sofortmassnahmen || [],
                summary.meldepflichten || [],
                summary.risk_indicators || {}
            ]
        );
        
        console.log('✅ Validierungs-Zusammenfassung erfolgreich gespeichert');
    } catch (err) {
        console.error('Fehler beim Speichern der Zusammenfassung:', err);
        throw new Error(`DB-Fehler bei Zusammenfassung: ${err.message}`);
    }
};

const saveValidationErrors = async (runId, errors, stationId, client) => {
    try {
        if (!errors || errors.length === 0) {
            console.log('Keine fehlerhaften Werte zu speichern');
            return;
        }
        
        console.log(`Speichere ${errors.length} fehlerhafte Werte...`);
        
        // Batch-Insert für bessere Performance
        const values = [];
        const placeholders = [];
        let paramIndex = 1;
        
        errors.forEach((error) => {
            placeholders.push(
                `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, 
                  $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, 
                  $${paramIndex++}, $${paramIndex++})`
            );
            
            values.push(
                runId,
                stationId,
                error.zeitpunkt,
                error.parameter,
                error.wert,
                error.flag,
                error.flag_name,
                error.grund
            );
        });
        
        if (placeholders.length > 0) {
            const query = `
                INSERT INTO validation_errors 
                (run_id, station_id, timestamp, parameter, value, flag, flag_name, reason)
                VALUES ${placeholders.join(', ')}
            `;
            
            await client.query(query, values);
            console.log(`✅ ${errors.length} fehlerhafte Werte erfolgreich gespeichert`);
        }
        
    } catch (err) {
        console.error('Fehler beim Speichern der fehlerhaften Werte:', err);
        throw new Error(`DB-Fehler bei fehlerhaften Werten: ${err.message}`);
    }
};

// Dashboard-Daten aus DB laden
const getDashboardData = async (stationId, date) => {
    const client = await pool.connect();
    try {
        // 1. Finde den neuesten Validierungslauf für diese Station
        let runQuery = `
            SELECT run_id, run_timestamp 
            FROM validation_runs 
            WHERE station_id = $1
        `;
        const params = [stationId];
        
        // Optional: Nach Datum filtern
        if (date) {
            runQuery += ` AND DATE(run_timestamp) = $2`;
            params.push(date);
        }
        
        runQuery += ` ORDER BY run_timestamp DESC LIMIT 1`;
        
        const runResult = await client.query(runQuery, params);
        
        if (runResult.rows.length === 0) {
            return { error: 'Keine Validierungsdaten gefunden' };
        }
        
        const runId = runResult.rows[0].run_id;
        const runTimestamp = runResult.rows[0].run_timestamp;
        
        // 2. Hole alle Daten für dieses run_id
        const [
            dailyData,
            analyses,
            summary,
            errors
        ] = await Promise.all([
            // Tageswerte
            client.query(
                `SELECT * FROM daily_aggregations 
                 WHERE station_id = $1 AND validation_run_id = $2
                 ORDER BY date, parameter`,
                [stationId, runId]
            ),
            // Erweiterte Analysen
            client.query(
                `SELECT * FROM validation_analyses 
                 WHERE run_id = $1`,
                [runId]
            ),
            // Zusammenfassung
            client.query(
                `SELECT * FROM validation_summaries 
                 WHERE run_id = $1`,
                [runId]
            ),
            // Fehlerhafte Werte
            client.query(
                `SELECT * FROM validation_errors 
                 WHERE run_id = $1 
                 ORDER BY timestamp, parameter`,
                [runId]
            )
        ]);
        
        // 3. Formatiere die Daten für das Dashboard
        const dashboardData = {
            station_id: stationId,
            run_timestamp: runTimestamp,
            zeitraum: {
                von: null,
                bis: null
            },
            basis_validierung: {},
            erweiterte_analysen: {},
            zusammenfassung: {},
            fehlerhafte_werte: errors.rows
        };
        
        // Konvertiere Tageswerte in das erwartete Format
        dailyData.rows.forEach(row => {
            const dateStr = row.date.toISOString().split('T')[0];
            
            if (!dashboardData.basis_validierung[dateStr]) {
                dashboardData.basis_validierung[dateStr] = {};
            }
            
            // Setze Zeitraum
            if (!dashboardData.zeitraum.von || dateStr < dashboardData.zeitraum.von) {
                dashboardData.zeitraum.von = dateStr;
            }
            if (!dashboardData.zeitraum.bis || dateStr > dashboardData.zeitraum.bis) {
                dashboardData.zeitraum.bis = dateStr;
            }
            
            // Füge Parameter-Daten hinzu
            const param = row.parameter;
            dashboardData.basis_validierung[dateStr][`${param}_Mittelwert`] = row.mean_value;
            dashboardData.basis_validierung[dateStr][`${param}_Min`] = row.min_value;
            dashboardData.basis_validierung[dateStr][`${param}_Max`] = row.max_value;
            dashboardData.basis_validierung[dateStr][`${param}_StdAbw`] = row.std_dev;
            dashboardData.basis_validierung[dateStr][`${param}_Median`] = row.median_value;
            dashboardData.basis_validierung[dateStr][`${param}_Anteil_Guter_Werte_Prozent`] = row.good_values_percentage;
            dashboardData.basis_validierung[dateStr][`${param}_Aggregat_QARTOD_Flag`] = row.aggregated_flag;
            dashboardData.basis_validierung[dateStr][`${param}_Aggregat_Gruende`] = row.aggregated_reasons;
        });
        
        // Konvertiere erweiterte Analysen
        analyses.rows.forEach(row => {
            dashboardData.erweiterte_analysen[row.analysis_type] = row.analysis_data;
        });
        
        // Konvertiere Zusammenfassung
        if (summary.rows.length > 0) {
            const sum = summary.rows[0];
            dashboardData.zusammenfassung = {
                status: sum.status,
                hauptprobleme: sum.main_problems || [],
                sofortmassnahmen: sum.immediate_actions || [],
                meldepflichten: sum.reporting_obligations || []
            };
        }
        
        return dashboardData;
        
    } catch (err) {
        console.error('Fehler beim Laden der Dashboard-Daten:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } finally {
        client.release();
    }
};

// Hole Konfigurations-Daten für Dashboard
// Hole Konfigurations-Daten für Dashboard
const getStationConfig = async (stationId) => {
    const client = await pool.connect();
    try {
        // 1. Hole Station-Details
        const stationQuery = `
            SELECT s.*, 
                   sc.latitude, sc.longitude,
                   sca.agrar_anteil_prozent, sca.wald_anteil_prozent, 
                   sca.siedlung_anteil_prozent, sca.sonstiger_anteil_prozent
            FROM stations s
            LEFT JOIN station_coordinates sc ON s.station_id = sc.station_id
            LEFT JOIN station_catchment_areas sca ON s.station_id = sca.station_id
            WHERE s.station_code = $1
        `;
        const stationResult = await client.query(stationQuery, [stationId]);
        
        // 2. Hole ALLE validation_range Regeln (auch ohne parameter_id)
        const rulesQuery = `
            SELECT p.parameter_name, r.config_json, r.rule_type
            FROM config_rules r
            LEFT JOIN parameters p ON r.parameter_id = p.parameter_id
            WHERE r.rule_type IN ('validation_range', 'RANGE', 'RANGE_REGIONAL')
            AND (r.station_id IS NULL OR r.station_id = (
                SELECT station_id FROM stations WHERE station_code = $1
            ))
        `;
        const rulesResult = await client.query(rulesQuery, [stationId]);
        
        // 3. FALLBACK: Hole globale Regeln aus parameters Tabelle
        const globalRulesQuery = `
            SELECT parameter_name, 
                   json_build_object('min', 0, 'max', 100) as config_json
            FROM parameters
            WHERE parameter_name IN (
                'Nitrat', 'pH', 'Gelöster Sauerstoff', 'Wassertemperatur',
                'Chl-a', 'Trübung', 'Leitfähigkeit'
            )
        `;
        const globalRulesResult = await client.query(globalRulesQuery);
        
        // Formatiere Ergebnis
        const config = {
            station: stationResult.rows[0] || {
                station_name: stationId,
                gemeinde: 'Unbekannt',
                latitude: 54.0,
                longitude: 13.0
            },
            validation_rules: {}
        };
        
        // Erst globale Regeln
        globalRulesResult.rows.forEach(row => {
            config.validation_rules[row.parameter_name] = row.config_json;
        });
        
        // Dann spezifische Regeln (überschreiben globale)
        rulesResult.rows.forEach(row => {
            if (row.parameter_name) {
                config.validation_rules[row.parameter_name] = row.config_json;
            }
        });
        
        // TEMPORÄR: Füge Standard-Grenzwerte hinzu falls keine gefunden
        if (Object.keys(config.validation_rules).length === 0) {
            config.validation_rules = {
                'Wassertemperatur': { min: -0.5, max: 32.0 },
                'pH': { min: 6.0, max: 10.0 },
                'Nitrat': { min: 0.0, max: 50.0 },
                'Gelöster Sauerstoff': { min: 0.0, max: 20.0 },
                'Chl-a': { min: 0.0, max: 250.0 },
                'Trübung': { min: 0.0, max: 150.0 },
                'Leitfähigkeit': { min: 100, max: 1500 }
            };
        }
        
        return config;
        
    } catch (err) {
        console.error('Fehler beim Laden der Station-Config:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } finally {
        client.release();
    }
};

// Hole Dashboard-Daten für Station und Zeitraum (unabhängig von Läufen)
const getDashboardDataByDateRange = async (stationId, startDate, endDate) => {
    const client = await pool.connect();
    try {
        console.log(`Lade Daten für ${stationId} vom ${startDate} bis ${endDate}`);
        
        // 1. Hole Tageswerte für den Zeitraum
        const dailyData = await client.query(
            `SELECT * FROM daily_aggregations 
             WHERE station_id = $1 
             AND date >= $2 
             AND date <= $3
             ORDER BY date, parameter`,
            [stationId, startDate, endDate]
        );
        
        // 2. Hole die neuesten erweiterten Analysen für diesen Zeitraum
        const analyses = await client.query(
            `SELECT DISTINCT ON (analysis_type) 
                    analysis_type, analysis_data
             FROM validation_analyses va
             JOIN validation_runs vr ON va.run_id = vr.run_id
             WHERE vr.station_id = $1
             AND vr.run_timestamp >= $2
             ORDER BY analysis_type, vr.run_timestamp DESC`,
            [stationId, startDate]
        );
        
        // 3. Hole fehlerhafte Werte für den Zeitraum
        const errors = await client.query(
            `SELECT * FROM validation_errors 
             WHERE station_id = $1 
             AND DATE(timestamp) >= $2 
             AND DATE(timestamp) <= $3
             ORDER BY timestamp, parameter`,
            [stationId, startDate, endDate]
        );
        
        // 4. Generiere Zusammenfassung basierend auf den Daten
        const summary = generateSummaryFromData(dailyData.rows, errors.rows);
        
        // 5. Formatiere wie gewohnt
        const dashboardData = {
            station_id: stationId,
            zeitraum: {
                von: startDate,
                bis: endDate
            },
            basis_validierung: {},
            erweiterte_analysen: {},
            zusammenfassung: summary,
            fehlerhafte_werte: errors.rows
        };
        
        // Konvertiere Tageswerte
        dailyData.rows.forEach(row => {
            const dateStr = row.date.toISOString().split('T')[0];
            
            if (!dashboardData.basis_validierung[dateStr]) {
                dashboardData.basis_validierung[dateStr] = {};
            }
            
            const param = row.parameter;
            dashboardData.basis_validierung[dateStr][`${param}_Mittelwert`] = row.mean_value;
            dashboardData.basis_validierung[dateStr][`${param}_Min`] = row.min_value;
            dashboardData.basis_validierung[dateStr][`${param}_Max`] = row.max_value;
            dashboardData.basis_validierung[dateStr][`${param}_StdAbw`] = row.std_dev;
            dashboardData.basis_validierung[dateStr][`${param}_Median`] = row.median_value;
            dashboardData.basis_validierung[dateStr][`${param}_Anteil_Guter_Werte_Prozent`] = row.good_values_percentage;
            dashboardData.basis_validierung[dateStr][`${param}_Aggregat_QARTOD_Flag`] = row.aggregated_flag;
            dashboardData.basis_validierung[dateStr][`${param}_Aggregat_Gruende`] = row.aggregated_reasons;
        });
        
        // Konvertiere Analysen
        analyses.rows.forEach(row => {
            dashboardData.erweiterte_analysen[row.analysis_type] = row.analysis_data;
        });
        
        return dashboardData;
        
    } catch (err) {
        console.error('Fehler beim Laden der Dashboard-Daten:', err);
        throw new Error(`DB-Fehler: ${err.message}`);
    } finally {
        client.release();
    }
};

// Hilfsfunktion für Zusammenfassung
function generateSummaryFromData(dailyData, errors) {
    let status = 'gut';
    const hauptprobleme = [];
    const sofortmassnahmen = [];
    
    // Analysiere Fehler
    const errorCount = errors.length;
    const criticalErrors = errors.filter(e => e.flag === 4).length;
    
    if (criticalErrors > 10) {
        status = 'kritisch';
        hauptprobleme.push(`${criticalErrors} kritische Messfehler`);
        sofortmassnahmen.push('Sensoren prüfen');
    } else if (errorCount > 20) {
        status = 'warnung';
        hauptprobleme.push(`${errorCount} fehlerhafte Messungen`);
    }
    
    // Analysiere Grenzwertüberschreitungen
    const parameterProblems = {};
    dailyData.forEach(row => {
        if (row.aggregated_flag === 4) {
            parameterProblems[row.parameter] = (parameterProblems[row.parameter] || 0) + 1;
        }
    });
    
    Object.entries(parameterProblems).forEach(([param, count]) => {
        if (count > 3) {
            status = status === 'gut' ? 'warnung' : status;
            hauptprobleme.push(`${param} häufig außerhalb Grenzwerte`);
        }
    });
    
    return {
        status,
        hauptprobleme,
        sofortmassnahmen,
        meldepflichten: []
    };
}

module.exports = {
    testConnection,
    createDatabaseTables,
    getComments,
    addComment,
    deleteComment,
    loginUser,
    getAllUsers,
    saveValidationData,
    getLatestValidationData,
    logUserLogin,
    getAllTableData,
    saveHourlyMeasurements,
     saveExtendedAnalyses,
    saveValidationSummary,
    saveValidationErrors,
    getDashboardData,
    getStationConfig,
    getDashboardDataByDateRange
};