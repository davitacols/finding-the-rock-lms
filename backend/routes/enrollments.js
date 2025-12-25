const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user's enrollments
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const userResult = await db.query(
      'SELECT id FROM users WHERE cognito_user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const enrollments = await db.query(`
      SELECT 
        e.*,
        c.title as course_title,
        c.duration_weeks,
        COUNT(m.id) as total_modules,
        COUNT(CASE WHEN vp.completion_percentage = 100 THEN 1 END) as modules_completed,
        AVG(vp.completion_percentage) as completion_percentage,
        MIN(ls.start_time) as next_session
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN modules m ON c.id = m.course_id AND m.is_published = true
      LEFT JOIN video_progress vp ON m.id = vp.module_id AND vp.user_id = e.user_id
      LEFT JOIN live_sessions ls ON m.id = ls.module_id AND ls.start_time > NOW()
      WHERE e.user_id = $1
      GROUP BY e.id, c.title, c.duration_weeks
      ORDER BY e.enrollment_date DESC
    `, [userResult.rows[0].id]);
    
    res.json(enrollments.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll in a course
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.sub;
    
    const userResult = await db.query(
      'SELECT id FROM users WHERE cognito_user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if course exists and is active
    const courseResult = await db.query(
      'SELECT * FROM courses WHERE id = $1 AND is_active = true',
      [courseId]
    );
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found or inactive' });
    }
    
    const course = courseResult.rows[0];
    
    // Check if already enrolled
    const existingEnrollment = await db.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userResult.rows[0].id, courseId]
    );
    
    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    // Check prerequisites
    if (course.prerequisite_course_id) {
      const prerequisiteEnrollment = await db.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = $3',
        [userResult.rows[0].id, course.prerequisite_course_id, 'completed']
      );
      
      if (prerequisiteEnrollment.rows.length === 0) {
        return res.status(400).json({ error: 'Prerequisite course not completed' });
      }
    }
    
    // Create enrollment
    const enrollment = await db.query(`
      INSERT INTO enrollments (user_id, course_id, status)
      VALUES ($1, $2, 'active')
      RETURNING *
    `, [userResult.rows[0].id, courseId]);
    
    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment: enrollment.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update enrollment status
router.put('/:enrollmentId', authenticateToken, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { status } = req.body;
    const userId = req.user.sub;
    
    const userResult = await db.query(
      'SELECT id FROM users WHERE cognito_user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const result = await db.query(`
      UPDATE enrollments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [status, enrollmentId, userResult.rows[0].id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get enrollment details
router.get('/:enrollmentId', authenticateToken, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user.sub;
    
    const userResult = await db.query(
      'SELECT id FROM users WHERE cognito_user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const enrollment = await db.query(`
      SELECT 
        e.*,
        c.title as course_title,
        c.description as course_description,
        c.duration_weeks,
        COUNT(m.id) as total_modules,
        COUNT(CASE WHEN vp.completion_percentage = 100 THEN 1 END) as modules_completed,
        AVG(vp.completion_percentage) as completion_percentage
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN modules m ON c.id = m.course_id AND m.is_published = true
      LEFT JOIN video_progress vp ON m.id = vp.module_id AND vp.user_id = e.user_id
      WHERE e.id = $1 AND e.user_id = $2
      GROUP BY e.id, c.title, c.description, c.duration_weeks
    `, [enrollmentId, userResult.rows[0].id]);
    
    if (enrollment.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    res.json(enrollment.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;