-- Peer Assessment System Tables (UoPeople Style)

-- Weekly topics for peer assessment
CREATE TABLE peer_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    min_words INTEGER DEFAULT 200,
    max_words INTEGER DEFAULT 500,
    due_date TIMESTAMP NOT NULL,
    peer_review_due_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student submissions to peer topics
CREATE TABLE peer_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES peer_topics(id),
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    word_count INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT false,
    UNIQUE(topic_id, user_id)
);

-- Peer reviews/ratings
CREATE TABLE peer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES peer_submissions(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    criteria_scores JSONB, -- Store individual criteria ratings
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id, reviewer_id)
);

-- Peer responses (comments on submissions)
CREATE TABLE peer_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES peer_submissions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    parent_response_id UUID REFERENCES peer_responses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample peer topics for Finding the Rock course
INSERT INTO peer_topics (module_id, title, description, instructions, due_date, peer_review_due_date)
SELECT 
    m.id,
    'Personal Faith Journey Reflection',
    'Reflect on your personal faith journey and share a significant moment that strengthened or challenged your faith.',
    'Write a 200-500 word reflection discussing: 1) A specific experience that impacted your faith, 2) How this experience changed your perspective, 3) What you learned about God''s character through this experience. Be authentic and specific in your examples.',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '10 days'
FROM modules m
WHERE m.title = 'Introduction to Faith'
ON CONFLICT DO NOTHING;

INSERT INTO peer_topics (module_id, title, description, instructions, due_date, peer_review_due_date)
SELECT 
    m.id,
    'Prayer Life Assessment',
    'Analyze your current prayer practices and discuss how you can develop a more meaningful prayer life.',
    'Write a 200-500 word analysis covering: 1) Your current prayer habits and frequency, 2) Challenges you face in maintaining consistent prayer, 3) Specific strategies you will implement to improve your prayer life, 4) How you hope prayer will impact your spiritual growth.',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '10 days'
FROM modules m
WHERE m.title = 'Prayer and Worship'
ON CONFLICT DO NOTHING;

INSERT INTO peer_topics (module_id, title, description, instructions, due_date, peer_review_due_date)
SELECT 
    m.id,
    'Experiencing God''s Grace',
    'Share a personal example of how you have experienced God''s grace in your life and its impact on your relationships.',
    'Write a 200-500 word reflection including: 1) A specific situation where you experienced God''s grace, 2) How this experience affected your understanding of grace, 3) Ways this has influenced how you extend grace to others, 4) Practical applications for living gracefully in daily life.',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '10 days'
FROM modules m
WHERE m.title = 'Understanding God''s Love and Grace'
ON CONFLICT DO NOTHING;

-- Sample submissions
INSERT INTO peer_submissions (topic_id, user_id, content, word_count)
SELECT 
    pt.id,
    u.id,
    'My faith journey took a significant turn during my college years when I faced financial hardship. I was working two jobs while studying full-time, barely making ends meet. During this challenging period, I questioned whether God truly cared about my struggles. One evening, feeling overwhelmed and defeated, I received an unexpected call from my church offering me a scholarship I had forgotten I applied for months earlier. This moment taught me that God''s timing is perfect, even when we cannot see His plan. The experience strengthened my faith and taught me to trust in God''s provision, even during uncertainty. It also showed me God''s character as a loving Father who cares about every detail of our lives, not just the big spiritual matters.',
    247
FROM peer_topics pt, users u
WHERE pt.title = 'Personal Faith Journey Reflection' 
  AND u.email = 'john.doe@example.com';

INSERT INTO peer_submissions (topic_id, user_id, content, word_count)
SELECT 
    pt.id,
    u.id,
    'Prayer has always been challenging for me because I struggle with consistency and focus. Currently, I pray sporadically, usually only when facing difficulties or before meals. My main challenge is maintaining regular prayer time due to my busy schedule and tendency to get distracted. To improve my prayer life, I plan to implement three strategies: First, I will establish a fixed morning prayer time of 15 minutes before checking my phone. Second, I will use a prayer journal to write down my prayers and track God''s answers. Third, I will incorporate prayer walks in nature to help me focus better. I hope these changes will deepen my relationship with God and help me recognize His presence throughout my day, not just during crisis moments.',
    312
FROM peer_topics pt, users u
WHERE pt.title = 'Prayer Life Assessment' 
  AND u.email = 'jane.smith@example.com';

-- Sample peer reviews
INSERT INTO peer_reviews (submission_id, reviewer_id, rating, feedback, criteria_scores)
SELECT 
    ps.id,
    u.id,
    4,
    'Great reflection! I really appreciated how you shared a specific, personal example rather than speaking in generalities. Your insight about God''s timing being perfect resonates with my own experiences. The connection you made between receiving provision and understanding God''s character as a caring Father was particularly meaningful. One suggestion: you could have expanded a bit more on how this experience continues to influence your daily faith walk.',
    '{"authenticity": 5, "biblical_insight": 4, "personal_application": 4, "writing_quality": 4}'::jsonb
FROM peer_submissions ps, users u
WHERE ps.content LIKE '%financial hardship%' 
  AND u.email = 'jane.smith@example.com';

-- Create indexes
CREATE INDEX idx_peer_topics_module ON peer_topics(module_id);
CREATE INDEX idx_peer_submissions_topic_user ON peer_submissions(topic_id, user_id);
CREATE INDEX idx_peer_reviews_submission ON peer_reviews(submission_id);
CREATE INDEX idx_peer_responses_submission ON peer_responses(submission_id);