const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get live sessions for a module
router.get('/module/:moduleId', authenticateToken, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const sessions = await db.query(`
      SELECT ls.*, 
             m.title as module_title,
             c.title as course_title,
             u.first_name as instructor_first_name,
             u.last_name as instructor_last_name,
             COUNT(a.id) as attendee_count
      FROM live_sessions ls
      JOIN modules m ON ls.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      LEFT JOIN users u ON ls.instructor_id = u.id
      LEFT JOIN attendance a ON ls.id = a.live_session_id AND a.status = 'present'
      WHERE ls.module_id = $1
      GROUP BY ls.id, m.title, c.title, u.first_name, u.last_name
      ORDER BY ls.start_time DESC
    `, [moduleId]);
    
    res.json(sessions.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming sessions for user
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const userResult = await db.query('SELECT id FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const sessions = await db.query(`
      SELECT ls.*, 
             m.title as module_title,
             m.week_number,
             c.title as course_title,
             u.first_name as instructor_first_name,
             u.last_name as instructor_last_name,
             a.status as attendance_status
      FROM live_sessions ls
      JOIN modules m ON ls.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id AND e.user_id = $1 AND e.status = 'active'
      LEFT JOIN users u ON ls.instructor_id = u.id
      LEFT JOIN attendance a ON ls.id = a.live_session_id AND a.user_id = $1
      WHERE ls.start_time > NOW()
      ORDER BY ls.start_time ASC
      LIMIT 10
    `, [userResult.rows[0].id]);
    
    res.json(sessions.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session details
router.get('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await db.query(`
      SELECT ls.*, 
             m.title as module_title,
             m.week_number,
             m.description as module_description,
             c.title as course_title,
             u.first_name as instructor_first_name,
             u.last_name as instructor_last_name
      FROM live_sessions ls
      JOIN modules m ON ls.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      LEFT JOIN users u ON ls.instructor_id = u.id
      WHERE ls.id = $1
    `, [sessionId]);
    
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join session (record attendance)
router.post('/:sessionId/join', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.sub;
    
    const userResult = await db.query('SELECT id FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if session exists and is active
    const session = await db.query(`
      SELECT ls.*, m.course_id
      FROM live_sessions ls
      JOIN modules m ON ls.module_id = m.id
      WHERE ls.id = $1
    `, [sessionId]);
    
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is enrolled in the course
    const enrollment = await db.query(`
      SELECT * FROM enrollments 
      WHERE user_id = $1 AND course_id = $2 AND status = 'active'
    `, [userResult.rows[0].id, session.rows[0].course_id]);
    
    if (enrollment.rows.length === 0) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }
    
    // Record attendance
    const attendance = await db.query(`
      INSERT INTO attendance (user_id, live_session_id, join_time, status)
      VALUES ($1, $2, NOW(), 'present')
      ON CONFLICT (user_id, live_session_id)
      DO UPDATE SET join_time = NOW(), status = 'present'
      RETURNING *
    `, [userResult.rows[0].id, sessionId]);
    
    res.json({
      message: 'Successfully joined session',
      attendance: attendance.rows[0],
      zoom_url: session.rows[0].zoom_meeting_id ? `https://zoom.us/j/${session.rows[0].zoom_meeting_id}` : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave session (update attendance)
router.post('/:sessionId/leave', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.sub;
    
    const userResult = await db.query('SELECT id FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update attendance with leave time
    const attendance = await db.query(`
      UPDATE attendance 
      SET leave_time = NOW(),
          total_duration = EXTRACT(EPOCH FROM (NOW() - join_time))/60
      WHERE user_id = $1 AND live_session_id = $2
      RETURNING *
    `, [userResult.rows[0].id, sessionId]);
    
    if (attendance.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.json({
      message: 'Successfully left session',
      attendance: attendance.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create session (instructor only)
router.post('/', authenticateToken, requireRole(['instructor', 'admin']), async (req, res) => {
  try {
    const { moduleId, sessionDate, startTime, endTime, zoomMeetingId } = req.body;
    const userId = req.user.sub;
    
    const userResult = await db.query('SELECT id FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const session = await db.query(`
      INSERT INTO live_sessions (module_id, session_date, start_time, end_time, zoom_meeting_id, instructor_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [moduleId, sessionDate, startTime, endTime, zoomMeetingId, userResult.rows[0].id]);
    
    res.status(201).json(session.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session attendance
router.get('/:sessionId/attendance', authenticateToken, requireRole(['instructor', 'admin']), async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const attendance = await db.query(`
      SELECT a.*, 
             u.first_name, 
             u.last_name, 
             u.email
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.live_session_id = $1
      ORDER BY a.join_time ASC
    `, [sessionId]);
    
    res.json(attendance.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;