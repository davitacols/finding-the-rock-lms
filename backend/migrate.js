const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('🗄️  Running database migrations...');
    
    // Read and execute schema
    const fs = require('fs');
    const schema = fs.readFileSync('./migrate-schema.sql', 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();