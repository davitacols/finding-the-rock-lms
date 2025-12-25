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

async function createSampleData() {
  try {
    console.log('Creating sample data for dashboard...');
    
    // Get test user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['test@example.com']);
    if (userResult.rows.length === 0) {
      console.log('Test user not found. Please run add-test-user-db.js first');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('Found user:', user.email);
    
    // Get courses
    const coursesResult = await pool.query('SELECT * FROM courses ORDER BY created_at');
    const courses = coursesResult.rows;
    
    if (courses.length === 0) {
      console.log('No courses found');
      return;
    }
    
    // Enroll user in first course
    await pool.query(`
      INSERT INTO enrollments (user_id, course_id, status)
      VALUES ($1, $2, 'active')
      ON CONFLICT (user_id, course_id) DO NOTHING
    `, [user.id, courses[0].id]);
    
    console.log('✅ Enrolled user in:', courses[0].title);
    
    // Create modules for the course
    const moduleData = [
      { title: 'Introduction to Faith', week: 1, description: 'Understanding the basics of Christian faith' },
      { title: 'Prayer and Meditation', week: 2, description: 'Learning to communicate with God' },
      { title: 'Scripture Study', week: 3, description: 'How to read and understand the Bible' },
      { title: 'Community and Fellowship', week: 4, description: 'Building relationships in faith' }
    ];
    
    for (const module of moduleData) {
      const moduleResult = await pool.query(`
        INSERT INTO modules (course_id, title, description, week_number, is_published)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [courses[0].id, module.title, module.description, module.week]);
      
      if (moduleResult.rows.length > 0) {
        const moduleId = moduleResult.rows[0].id;
        
        // Add video progress
        await pool.query(`
          INSERT INTO video_progress (user_id, module_id, completion_percentage, watch_duration, last_watched_at)
          VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${module.week} days')
          ON CONFLICT (user_id, module_id) DO UPDATE SET
            completion_percentage = $3,
            watch_duration = $4,
            last_watched_at = NOW() - INTERVAL '${module.week} days'
        `, [user.id, moduleId, module.week <= 2 ? 100 : (module.week === 3 ? 65 : 0), module.week * 1800]);
        
        // Create assignments
        await pool.query(`
          INSERT INTO assignments (module_id, title, description, assignment_type, max_points)
          VALUES ($1, $2, $3, 'reflection', 100)
          ON CONFLICT DO NOTHING
        `, [moduleId, `${module.title} Reflection`, `Reflect on the key concepts from ${module.title}`]);
        
        // Create live sessions
        await pool.query(`
          INSERT INTO live_sessions (module_id, session_date, start_time, end_time)
          VALUES ($1, CURRENT_DATE + INTERVAL '${7 - module.week} days', 
                  CURRENT_DATE + INTERVAL '${7 - module.week} days' + INTERVAL '19 hours',
                  CURRENT_DATE + INTERVAL '${7 - module.week} days' + INTERVAL '20 hours')
          ON CONFLICT DO NOTHING
        `, [moduleId]);
      }
    }
    
    console.log('✅ Created modules and sample data');
    console.log('\nSample data created successfully!');
    console.log('You can now test the dashboard with real data.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createSampleData();