const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, 
             COUNT(e.id) as enrolled_students,
             pc.title as prerequisite_title
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      LEFT JOIN courses pc ON c.prerequisite_course_id = pc.id
      WHERE c.is_active = true
      GROUP BY c.id, pc.title
      ORDER BY 
        CASE WHEN c.prerequisite_course_id IS NULL THEN 0 ELSE 1 END,
        c.created_at
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course details with modules
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const courseResult = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const modulesResult = await db.query(`
      SELECT m.*, 
             COUNT(ls.id) as live_sessions_count
      FROM modules m
      LEFT JOIN live_sessions ls ON m.id = ls.module_id
      WHERE m.course_id = $1 AND m.is_published = true
      GROUP BY m.id
      ORDER BY m.week_number
    `, [courseId]);

    res.json({
      course: courseResult.rows[0],
      modules: modulesResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student progress for a course
router.get('/:courseId/progress', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.sub;

    const progressResult = await db.query(`
      SELECT 
        m.id as module_id,
        m.title,
        m.week_number,
        vp.completion_percentage,
        COUNT(s.id) as assignments_completed,
        COUNT(a.id) as total_assignments
      FROM modules m
      LEFT JOIN video_progress vp ON m.id = vp.module_id AND vp.user_id = $1
      LEFT JOIN assignments a ON m.id = a.module_id
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.user_id = $1
      WHERE m.course_id = $2 AND m.is_published = true
      GROUP BY m.id, m.title, m.week_number, vp.completion_percentage
      ORDER BY m.week_number
    `, [userId, courseId]);

    res.json(progressResult.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new course (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { title, description, duration_weeks, prerequisite_course_id } = req.body;
    
    const result = await db.query(`
      INSERT INTO courses (title, description, duration_weeks, prerequisite_course_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, description, duration_weeks, prerequisite_course_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;