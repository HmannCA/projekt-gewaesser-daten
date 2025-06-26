const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test-Funktion
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Datenbankverbindung erfolgreich:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Datenbankverbindung fehlgeschlagen:', error);
    return false;
  }
}

module.exports = { pool, testConnection };