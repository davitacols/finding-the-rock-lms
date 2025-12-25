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

async function addOnlineAttendance() {
  try {
    console.log('🔄 Adding online attendance support...');
    
    // Add attendance_type column
    await pool.query(`
      ALTER TABLE attendance 
      ADD COLUMN IF NOT EXISTS attendance_type VARCHAR(20) DEFAULT 'in_person' 
      CHECK (attendance_type IN ('in_person', 'online'));
    `);
    console.log('✅ Added attendance_type column');
    
    console.log('🎉 Online attendance support added successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

addOnlineAttendance();