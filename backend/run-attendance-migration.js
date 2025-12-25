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

async function runAttendanceMigration() {
  try {
    console.log('🔄 Running attendance security migration...');
    
    // Create attendance_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          live_session_id UUID NOT NULL REFERENCES live_sessions(id),
          attendance_code VARCHAR(32) NOT NULL,
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          radius INTEGER DEFAULT 100,
          expires_at TIMESTAMP NOT NULL,
          created_by UUID NOT NULL REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(live_session_id)
      );
    `);
    console.log('✅ Created attendance_sessions table');
    
    // Add location columns to attendance table
    await pool.query(`
      ALTER TABLE attendance 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
      ADD COLUMN IF NOT EXISTS device_info TEXT;
    `);
    console.log('✅ Added location columns to attendance table');
    
    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_attendance_sessions_code ON attendance_sessions(attendance_code);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_attendance_sessions_expires ON attendance_sessions(expires_at);
    `);
    console.log('✅ Created indexes');
    
    console.log('🎉 Attendance security migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

runAttendanceMigration();