const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Get user from database
    const userResult = await db.query(
      'SELECT * FROM users WHERE cognito_user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get enrollment stats
    const enrollmentStats = await db.query(`
      SELECT 
        COUNT(*) as total_courses,
        COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active_courses,
        COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_courses
      FROM enrollments e
      WHERE e.user_id = $1
    `, [user.id]);
    
    // Get progress stats
    const progressStats = await db.query(`
      SELECT 
        AVG(vp.completion_percentage) as avg_progress,
        COUNT(vp.id) as modules_started,
        COUNT(CASE WHEN vp.completion_percentage = 100 THEN 1 END) as modules_completed
      FROM video_progress vp
      JOIN modules m ON vp.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id AND e.user_id = vp.user_id
      WHERE vp.user_id = $1 AND e.status = 'active'
    `, [user.id]);
    
    // Get attendance stats
    const attendanceStats = await db.query(`
      SELECT 
        COUNT(ls.id) as total_sessions,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as attended_sessions,
        SUM(a.total_duration) as total_watch_time
      FROM live_sessions ls
      JOIN modules m ON ls.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN attendance a ON ls.id = a.live_session_id AND a.user_id = e.user_id
      WHERE e.user_id = $1 AND e.status = 'active'
    `, [user.id]);
    
    // Get assignment stats
    const assignmentStats = await db.query(`
      SELECT 
        COUNT(a.id) as total_assignments,
        COUNT(s.id) as completed_assignments,
        AVG(s.grade) as avg_grade
      FROM assignments a
      JOIN modules m ON a.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.user_id = e.user_id
      WHERE e.user_id = $1 AND e.status = 'active'
    `, [user.id]);
    
    const stats = {
      user: {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email
      },
      courses: {
        total: parseInt(enrollmentStats.rows[0].total_courses) || 0,
        active: parseInt(enrollmentStats.rows[0].active_courses) || 0,
        completed: parseInt(enrollmentStats.rows[0].completed_courses) || 0
      },
      progress: {
        average: Math.round(parseFloat(progressStats.rows[0].avg_progress) || 0),
        modules_started: parseInt(progressStats.rows[0].modules_started) || 0,
        modules_completed: parseInt(progressStats.rows[0].modules_completed) || 0
      },
      attendance: {
        total_sessions: parseInt(attendanceStats.rows[0].total_sessions) || 0,
        attended_sessions: parseInt(attendanceStats.rows[0].attended_sessions) || 0,
        attendance_rate: attendanceStats.rows[0].total_sessions > 0 ? 
          Math.round((attendanceStats.rows[0].attended_sessions / attendanceStats.rows[0].total_sessions) * 100) : 0,
        total_watch_time: Math.round((parseInt(attendanceStats.rows[0].total_watch_time) || 0) / 60) // convert to hours
      },
      assignments: {
        total: parseInt(assignmentStats.rows[0].total_assignments) || 0,
        completed: parseInt(assignmentStats.rows[0].completed_assignments) || 0,
        avg_grade: Math.round(parseFloat(assignmentStats.rows[0].avg_grade) || 0)
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current course progress
router.get('/current-course', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const userResult = await db.query(
      'SELECT * FROM users WHERE cognito_user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get current active course with latest progress
    const currentCourse = await db.query(`
      SELECT 
        c.id,
        c.title,
        c.description,
        m.id as current_module_id,
        m.title as current_module_title,
        m.week_number,
        m.video_url,
        vp.completion_percentage,
        vp.last_watched_at
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN modules m ON c.id = m.course_id
      LEFT JOIN video_progress vp ON m.id = vp.module_id AND vp.user_id = $1
      WHERE e.user_id = $1 AND e.status = 'active'
      ORDER BY m.week_number ASC, vp.last_watched_at DESC NULLS LAST
      LIMIT 1
    `, [user.id]);
    
    if (currentCourse.rows.length === 0) {
      return res.json(null);
    }
    
    res.json(currentCourse.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming sessions
router.get('/upcoming-sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const userResult = await db.query(
      'SELECT * FROM users WHERE cognito_user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    const upcomingSessions = await db.query(`
      SELECT 
        ls.id,
        ls.session_date,
        ls.start_time,
        ls.zoom_meeting_id,
        m.title as module_title,
        m.week_number,
        c.title as course_title
      FROM live_sessions ls
      JOIN modules m ON ls.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = $1 AND e.status = 'active'
        AND ls.start_time > NOW()
      ORDER BY ls.start_time ASC
      LIMIT 3
    `, [user.id]);
    
    res.json(upcomingSessions.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const userResult = await db.query(
      'SELECT * FROM users WHERE cognito_user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get recent video progress
    const recentActivity = await db.query(`
      (SELECT 
        'video_progress' as type,
        m.title as title,
        'Watched ' || vp.completion_percentage || '% of video' as description,
        vp.last_watched_at as timestamp
      FROM video_progress vp
      JOIN modules m ON vp.module_id = m.id
      WHERE vp.user_id = $1 AND vp.last_watched_at IS NOT NULL)
      
      UNION ALL
      
      (SELECT 
        'assignment' as type,
        a.title as title,
        'Submitted assignment' as description,
        s.submitted_at as timestamp
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.user_id = $1)
      
      UNION ALL
      
      (SELECT 
        'attendance' as type,
        m.title as title,
        'Attended live session' as description,
        att.join_time as timestamp
      FROM attendance att
      JOIN live_sessions ls ON att.live_session_id = ls.id
      JOIN modules m ON ls.module_id = m.id
      WHERE att.user_id = $1 AND att.status = 'present')
      
      ORDER BY timestamp DESC
      LIMIT 5
    `, [user.id]);
    
    res.json(recentActivity.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;