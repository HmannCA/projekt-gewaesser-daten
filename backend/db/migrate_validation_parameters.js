const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function migrateValidationParameters() {
    const client = await pool.connect();
    
    try {
        // Lade JSON-Daten
        const jsonPath = path.join(__dirname, '..', 'validation_parameters.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        
        await client.query('BEGIN');
        
        for (const param of jsonData.validation_parameters) {
            await client.query(`
                INSERT INTO validation_parameters 
                (parameter_name, unit, gross_range_min, gross_range_max, 
                 climatology_min, climatology_max, climatology_thresholds, 
                 notes, updated_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (parameter_name) DO UPDATE SET
                    unit = EXCLUDED.unit,
                    gross_range_min = EXCLUDED.gross_range_min,
                    gross_range_max = EXCLUDED.gross_range_max,
                    climatology_min = EXCLUDED.climatology_min,
                    climatology_max = EXCLUDED.climatology_max,
                    climatology_thresholds = EXCLUDED.climatology_thresholds,
                    notes = EXCLUDED.notes,
                    updated_at = CURRENT_TIMESTAMP,
                    updated_by = EXCLUDED.updated_by
            `, [
                param.parameter_name,
                param.unit,
                param.gross_range_min,
                param.gross_range_max,
                param.climatology_min,
                param.climatology_max,
                param.climatology_thresholds ? JSON.stringify(param.climatology_thresholds) : null,
                param.notes,
                'Initial Migration'
            ]);
        }
        
        await client.query('COMMIT');
        console.log('✅ Validierungsparameter erfolgreich migriert!');
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Fehler bei der Migration:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrateValidationParameters();