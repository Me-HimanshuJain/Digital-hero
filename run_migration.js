const fs = require('fs');
const postgres = require('postgres');
const path = require('path');

async function run() {
  const connectionString = 'postgresql://postgres:PAMHjain%40440@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';
  const sql = postgres(connectionString);

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '0000_schema.sql'), 'utf8');
    
    console.log('Running migration...');
    await sql.unsafe(schemaSql);
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

run();
