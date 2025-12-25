const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get discussions for a module
router.get('/module/:moduleId', authenticateToken, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const discussions = await db.query(`
      SELECT d.*, 
             u.first_name, u.last_name, u.role,
             COUNT(dp.id) as post_count
      FROM discussions d
      JOIN users u ON d.created_by = u.id
      LEFT JOIN discussion_posts dp ON d.id = dp.discussion_id
      WHERE d.module_id = $1
      GROUP BY d.id, u.first_name, u.last_name, u.role
      ORDER BY d.created_at DESC
    `, [moduleId]);
    
    res.json(discussions.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get discussion with posts
router.get('/:discussionId', authenticateToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    
    const discussion = await db.query(`
      SELECT d.*, 
             u.first_name, u.last_name, u.role
      FROM discussions d
      JOIN users u ON d.created_by = u.id
      WHERE d.id = $1
    `, [discussionId]);
    
    if (discussion.rows.length === 0) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    
    const posts = await db.query(`
      SELECT dp.*, 
             u.first_name, u.last_name, u.role
      FROM discussion_posts dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.discussion_id = $1
      ORDER BY dp.created_at ASC
    `, [discussionId]);
    
    res.json({
      discussion: discussion.rows[0],
      posts: posts.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create discussion (instructor only)
router.post('/', authenticateToken, requireRole(['instructor', 'admin']), async (req, res) => {
  try {
    const { moduleId, title, description } = req.body;
    const userId = req.user.sub;
    
    const userResult = await db.query('SELECT id FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const result = await db.query(`
      INSERT INTO discussions (module_id, title, description, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [moduleId, title, description, userResult.rows[0].id]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create discussion post
router.post('/:discussionId/posts', authenticateToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, parentPostId } = req.body;
    const userId = req.user.sub;
    
    const userResult = await db.query('SELECT id FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const result = await db.query(`
      INSERT INTO discussion_posts (discussion_id, user_id, content, parent_post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [discussionId, userResult.rows[0].id, content, parentPostId]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;