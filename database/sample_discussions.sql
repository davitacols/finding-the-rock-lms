-- Sample data for discussions

-- First, let's add some sample modules if they don't exist
INSERT INTO modules (course_id, title, description, week_number, is_published) 
SELECT 
  c.id,
  'Introduction to Faith',
  'Understanding the basics of Christian faith and belief.',
  1,
  true
FROM courses c 
WHERE c.title = 'Finding the Rock'
ON CONFLICT DO NOTHING;

INSERT INTO modules (course_id, title, description, week_number, is_published) 
SELECT 
  c.id,
  'Prayer and Worship',
  'Learning how to communicate with God through prayer.',
  2,
  true
FROM courses c 
WHERE c.title = 'Finding the Rock'
ON CONFLICT DO NOTHING;

INSERT INTO modules (course_id, title, description, week_number, is_published) 
SELECT 
  c.id,
  'Understanding God''s Love and Grace',
  'Exploring the depth of God''s love and grace in our lives.',
  3,
  true
FROM courses c 
WHERE c.title = 'Finding the Rock'
ON CONFLICT DO NOTHING;

-- Add sample instructor user
INSERT INTO users (cognito_user_id, email, first_name, last_name, role) 
VALUES ('instructor-001', 'instructor@hotr.com', 'Pastor', 'Johnson', 'instructor')
ON CONFLICT (email) DO NOTHING;

-- Add sample student users
INSERT INTO users (cognito_user_id, email, first_name, last_name, role) 
VALUES 
  ('student-001', 'john.doe@example.com', 'John', 'Doe', 'student'),
  ('student-002', 'jane.smith@example.com', 'Jane', 'Smith', 'student'),
  ('student-003', 'mike.wilson@example.com', 'Mike', 'Wilson', 'student')
ON CONFLICT (email) DO NOTHING;

-- Add sample discussions
INSERT INTO discussions (module_id, title, description, created_by)
SELECT 
  m.id,
  'What does faith mean to you personally?',
  'Share your personal understanding of faith and how it has impacted your life. Consider discussing moments when your faith was tested or strengthened.',
  u.id
FROM modules m, users u
WHERE m.title = 'Introduction to Faith' 
  AND u.email = 'instructor@hotr.com'
ON CONFLICT DO NOTHING;

INSERT INTO discussions (module_id, title, description, created_by)
SELECT 
  m.id,
  'Effective Prayer Practices',
  'Discuss different prayer methods you have tried or would like to explore. What has been most meaningful in your prayer life?',
  u.id
FROM modules m, users u
WHERE m.title = 'Prayer and Worship' 
  AND u.email = 'instructor@hotr.com'
ON CONFLICT DO NOTHING;

-- Add sample discussion posts
INSERT INTO discussion_posts (discussion_id, user_id, content)
SELECT 
  d.id,
  u.id,
  'Faith to me is like an anchor in stormy seas. It provides stability when life gets uncertain. I''ve found that my faith grows stronger through challenges, not despite them. When I lost my job last year, instead of losing hope, I learned to trust God''s timing and provision.'
FROM discussions d, users u
WHERE d.title = 'What does faith mean to you personally?' 
  AND u.email = 'john.doe@example.com';

INSERT INTO discussion_posts (discussion_id, user_id, content)
SELECT 
  d.id,
  u.id,
  'I see faith as a relationship rather than just belief. It''s about walking with God daily, not just believing He exists. My faith has taught me to see beyond my circumstances and trust in God''s greater plan for my life.'
FROM discussions d, users u
WHERE d.title = 'What does faith mean to you personally?' 
  AND u.email = 'jane.smith@example.com';

INSERT INTO discussion_posts (discussion_id, user_id, content)
SELECT 
  d.id,
  u.id,
  'I''ve been experimenting with different prayer styles lately. Morning devotions with scripture reading has been transformative for me. I also find that praying while walking in nature helps me feel more connected to God''s creation and presence.'
FROM discussions d, users u
WHERE d.title = 'Effective Prayer Practices' 
  AND u.email = 'mike.wilson@example.com';