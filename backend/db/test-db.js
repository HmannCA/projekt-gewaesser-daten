require('dotenv').config();
const { testConnection } = require('./db/postgres');


async function test() {
  console.log('Teste Datenbankverbindung...');
  console.log('DATABASE_URL vorhanden:', !!process.env.DATABASE_URL);
  
  const success = await testConnection();
  
  if (success) {
    console.log('✅ Test erfolgreich!');
  } else {
    console.log('❌ Test fehlgeschlagen!');
  }
  
  process.exit(0);
}

test();