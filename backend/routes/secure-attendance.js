const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');

// Generate secure attendance session (instructor only)
router.post('/sessions/:sessionId/start', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { latitude, longitude, radius = 100 } = req.body; // radius in meters
    
    // Generate unique attendance code (expires in 10 minutes)
    const attendanceCode = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Store attendance session
    await db.query(`
      INSERT INTO attendance_sessions (live_session_id, attendance_code, latitude, longitude, radius, expires_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (live_session_id) DO UPDATE SET
        attendance_code = $2,
        latitude = $3,
        longitude = $4,
        radius = $5,
        expires_at = $6,
        created_by = $7
    `, [sessionId, attendanceCode, latitude, longitude, radius, expiresAt, req.user.sub]);
    
    res.json({
      success: true,
      attendanceCode,
      qrCodeData: JSON.stringify({
        sessionId,
        code: attendanceCode,
        expires: expiresAt.getTime()
      }),
      expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student check-in with security validation
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const { sessionId, attendanceCode, latitude, longitude, isOnline = false } = req.body;
    const userId = req.user.sub;
    
    // Get user from database
    const userResult = await db.query('SELECT * FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    
    // Validate attendance session
    const sessionResult = await db.query(`
      SELECT * FROM attendance_sessions 
      WHERE live_session_id = $1 AND attendance_code = $2 AND expires_at > NOW()
    `, [sessionId, attendanceCode]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired attendance code' });
    }
    
    const session = sessionResult.rows[0];
    
    // Location validation (skip for online students)
    if (!isOnline && session.latitude && session.longitude && latitude && longitude) {
      const distance = calculateDistance(
        session.latitude, session.longitude,
        latitude, longitude
      );
      
      if (distance > session.radius) {
        return res.status(400).json({ 
          error: `You must be within ${session.radius}m of the class location to check in`,
          distance: Math.round(distance)
        });
      }
    }
    
    // Check if already checked in
    const existingAttendance = await db.query(`
      SELECT * FROM attendance WHERE user_id = $1 AND live_session_id = $2
    `, [user.id, sessionId]);
    
    if (existingAttendance.rows.length > 0) {
      return res.status(400).json({ error: 'Already checked in for this session' });
    }
    
    // Record attendance
    const attendanceResult = await db.query(`
      INSERT INTO attendance (user_id, live_session_id, join_time, status, latitude, longitude, attendance_type)
      VALUES ($1, $2, NOW(), 'present', $3, $4, $5)
      RETURNING *
    `, [user.id, sessionId, latitude, longitude, isOnline ? 'online' : 'in_person']);
    
    res.json({
      success: true,
      message: `Successfully checked in ${isOnline ? 'online' : 'in person'}`,
      attendance: attendanceResult.rows[0]
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active attendance session for students
router.get('/sessions/:sessionId/active', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessionResult = await db.query(`
      SELECT 
        ls.id,
        ls.session_date,
        ls.start_time,
        m.title as module_title,
        c.title as course_title,
        ats.expires_at,
        ats.attendance_code IS NOT NULL as is_active
      FROM live_sessions ls
      JOIN modules m ON ls.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      LEFT JOIN attendance_sessions ats ON ls.id = ats.live_session_id AND ats.expires_at > NOW()
      WHERE ls.id = $1
    `, [sessionId]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(sessionResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

module.exports = router;