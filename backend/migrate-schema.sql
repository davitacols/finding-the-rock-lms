-- Finding the Rock LMS Database Schema

-- Users table with role-based access
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cognito_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_weeks INTEGER NOT NULL,
    prerequisite_course_id UUID REFERENCES courses(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course modules/weeks
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    week_number INTEGER NOT NULL,
    video_url VARCHAR(500),
    video_duration INTEGER,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    final_grade DECIMAL(5,2),
    UNIQUE(user_id, course_id)
);

-- Live sessions for attendance tracking
CREATE TABLE live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id),
    session_date TIMESTAMP NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    zoom_meeting_id VARCHAR(255),
    instructor_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance tracking
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    live_session_id UUID NOT NULL REFERENCES live_sessions(id),
    join_time TIMESTAMP,
    leave_time TIMESTAMP,
    total_duration INTEGER,
    status VARCHAR(20) DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'excused')),
    notes TEXT,
    UNIQUE(user_id, live_session_id)
);

-- Video watch progress
CREATE TABLE video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    module_id UUID NOT NULL REFERENCES modules(id),
    watch_duration INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- Assignments and assessments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('quiz', 'essay', 'reflection', 'discussion')),
    max_points INTEGER DEFAULT 100,
    due_date TIMESTAMP,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student submissions
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT,
    file_url VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade DECIMAL(5,2),
    feedback TEXT,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    UNIQUE(assignment_id, user_id)
);

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    certificate_type VARCHAR(100) NOT NULL,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_url VARCHAR(500),
    verification_code VARCHAR(50) UNIQUE,
    UNIQUE(user_id, course_id)
);

-- Insert initial courses
INSERT INTO courses (title, description, duration_weeks, prerequisite_course_id) VALUES
('Finding the Rock', 'Foundational discipleship course covering basic Christian principles', 12, NULL);

INSERT INTO courses (title, description, duration_weeks, prerequisite_course_id) VALUES
('Understanding Spiritual Authority', 'Advanced course on spiritual leadership and authority', 16, 
    (SELECT id FROM courses WHERE title = 'Finding the Rock'));

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_attendance_user_session ON attendance(user_id, live_session_id);