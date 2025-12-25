const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Record attendance for live session
router.post('/sessions/:sessionId/checkin', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.sub;
    const joinTime = new Date();

    const result = await db.query(`
      INSERT INTO attendance (user_id, live_session_id, join_time, status)
      VALUES ($1, $2, $3, 'present')
      ON CONFLICT (user_id, live_session_id)
      DO UPDATE SET join_time = $3, status = 'present'
      RETURNING *
    `, [userId, sessionId, joinTime]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record checkout time
router.post('/sessions/:sessionId/checkout', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.sub;
    const leaveTime = new Date();

    const result = await db.query(`
      UPDATE attendance 
      SET leave_time = $1,
          total_duration = EXTRACT(EPOCH FROM ($1 - join_time))/60
      WHERE user_id = $2 AND live_session_id = $3
      RETURNING *
    `, [leaveTime, userId, sessionId]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance report for a course
router.get('/courses/:courseId/report', authenticateToken, requireRole(['instructor', 'admin']), async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await db.query(`
      SELECT 
        u.first_name,
        u.last_name,
        u.email,
        m.title as module_title,
        m.week_number,
        ls.session_date,
        a.status,
        a.total_duration,
        CASE 
          WHEN a.total_duration >= 45 THEN 'Full'
          WHEN a.total_duration >= 30 THEN 'Partial'
          ELSE 'Minimal'
        END as attendance_quality
      FROM users u
      JOIN enrollments e ON u.id = e.user_id
      JOIN modules m ON e.course_id = m.course_id
      JOIN live_sessions ls ON m.id = ls.module_id
      LEFT JOIN attendance a ON u.id = a.user_id AND ls.id = a.live_session_id
      WHERE e.course_id = $1 AND e.status = 'active'
      ORDER BY u.last_name, m.week_number
    `, [courseId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student's attendance summary
router.get('/students/:userId/summary', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(`
      SELECT 
        c.title as course_title,
        COUNT(ls.id) as total_sessions,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as attended_sessions,
        ROUND(
          COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(ls.id), 0), 2
        ) as attendance_percentage,
        AVG(a.total_duration) as avg_session_duration
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN modules m ON c.id = m.course_id
      JOIN live_sessions ls ON m.id = ls.module_id
      LEFT JOIN attendance a ON e.user_id = a.user_id AND ls.id = a.live_session_id
      WHERE e.user_id = $1 AND e.status = 'active'
      GROUP BY c.id, c.title
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create live session (instructor/admin)
router.post('/sessions', authenticateToken, requireRole(['instructor', 'admin']), async (req, res) => {
  try {
    const { module_id, session_date, start_time, zoom_meeting_id } = req.body;
    const instructor_id = req.user.sub;

    const result = await db.query(`
      INSERT INTO live_sessions (module_id, session_date, start_time, zoom_meeting_id, instructor_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [module_id, session_date, start_time, zoom_meeting_id, instructor_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;