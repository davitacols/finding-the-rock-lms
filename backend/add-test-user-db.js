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

async function addTestUser() {
  try {
    console.log('Adding test user to database...');
    
    const result = await pool.query(`
      INSERT INTO users (cognito_user_id, email, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `, ['test-user-id', 'test@example.com', 'Test', 'User', 'student']);
    
    if (result.rows.length > 0) {
      console.log('✅ Test user added to database');
    } else {
      console.log('✅ Test user already exists in database');
    }
    
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: TestPass123!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addTestUser();