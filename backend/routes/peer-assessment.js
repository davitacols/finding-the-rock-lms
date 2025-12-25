const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get peer topics for a module
router.get('/module/:moduleId', authenticateToken, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const topics = await db.query(`
      SELECT pt.*, 
             COUNT(ps.id) as submission_count,
             COUNT(CASE WHEN ps.user_id = u.id THEN 1 END) as user_submitted
      FROM peer_topics pt
      LEFT JOIN peer_submissions ps ON pt.id = ps.topic_id
      LEFT JOIN users u ON u.cognito_user_id = $2
      WHERE pt.module_id = $1 AND pt.is_active = true
      GROUP BY pt.id
      ORDER BY pt.created_at DESC
    `, [moduleId, req.user.sub]);
    
    res.json(topics.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get topic details with submissions for peer review
router.get('/:topicId', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.sub;
    
    const userResult = await db.query('SELECT id FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const topic = await db.query('SELECT * FROM peer_topics WHERE id = $1', [topicId]);
    if (topic.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    // Get user's submission
    const userSubmission = await db.query(`
      SELECT * FROM peer_submissions 
      WHERE topic_id = $1 AND user_id = $2
    `, [topicId, userResult.rows[0].id]);
    
    // Get other submissions for peer review (excluding user's own)
    const submissions = await db.query(`
      SELECT ps.*, u.first_name, u.last_name,
             AVG(pr.rating) as avg_rating,
             COUNT(pr.id) as review_count,
             COUNT(CASE WHEN pr.reviewer_id = $2 THEN 1 END) as user_reviewed
      FROM peer_submissions ps
      JOIN users u ON ps.user_id = u.id
      LEFT JOIN peer_reviews pr ON ps.id = pr.submission_id
      WHERE ps.topic_id = $1 AND ps.user_id != $2
      GROUP BY ps.id, u.first_name, u.last_name
      ORDER BY ps.submitted_at DESC
    `, [topicId, userResult.rows[0].id]);
    
    res.json({
      topic: topic.rows[0],
      userSubmission: userSubmission.rows[0] || null,
      submissions: submissions.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit response to peer topic
router.post('/:topicId/submit', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;
    const userId = req.user.sub;
    
    const userResult = await db.query('SELECT id FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const wordCount = content.split(/\s+/).length;
    const isLate = new Date() > new Date(); // Check against due_date in real implementation
    
    const result = await db.query(`
      INSERT INTO peer_submissions (topic_id, user_id, content, word_count, is_late)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (topic_id, user_id) 
      DO UPDATE SET content = $3, word_count = $4, submitted_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [topicId, userResult.rows[0].id, content, wordCount, isLate]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit peer review
router.post('/submissions/:submissionId/review', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { rating, feedback, criteriaScores } = req.body;
    const userId = req.user.sub;
    
    const userResult = await db.query('SELECT id FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const result = await db.query(`
      INSERT INTO peer_reviews (submission_id, reviewer_id, rating, feedback, criteria_scores)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (submission_id, reviewer_id)
      DO UPDATE SET rating = $3, feedback = $4, criteria_scores = $5, reviewed_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [submissionId, userResult.rows[0].id, rating, feedback, JSON.stringify(criteriaScores)]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get submission details with reviews and responses
router.get('/submissions/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await db.query(`
      SELECT ps.*, u.first_name, u.last_name, pt.title as topic_title
      FROM peer_submissions ps
      JOIN users u ON ps.user_id = u.id
      JOIN peer_topics pt ON ps.topic_id = pt.id
      WHERE ps.id = $1
    `, [submissionId]);
    
    if (submission.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const reviews = await db.query(`
      SELECT pr.*, u.first_name, u.last_name
      FROM peer_reviews pr
      JOIN users u ON pr.reviewer_id = u.id
      WHERE pr.submission_id = $1
      ORDER BY pr.reviewed_at DESC
    `, [submissionId]);
    
    const responses = await db.query(`
      SELECT pr.*, u.first_name, u.last_name
      FROM peer_responses pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.submission_id = $1
      ORDER BY pr.created_at ASC
    `, [submissionId]);
    
    res.json({
      submission: submission.rows[0],
      reviews: reviews.rows,
      responses: responses.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add response to submission
router.post('/submissions/:submissionId/respond', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { content, parentResponseId } = req.body;
    const userId = req.user.sub;
    
    const userResult = await db.query('SELECT id FROM users WHERE cognito_user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const result = await db.query(`
      INSERT INTO peer_responses (submission_id, user_id, content, parent_response_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [submissionId, userResult.rows[0].id, content, parentResponseId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;