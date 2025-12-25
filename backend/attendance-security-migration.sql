-- Add attendance sessions table for secure check-in
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_session_id UUID NOT NULL REFERENCES live_sessions(id),
    attendance_code VARCHAR(32) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius INTEGER DEFAULT 100, -- meters
    expires_at TIMESTAMP NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(live_session_id)
);

-- Add location columns to attendance table
ALTER TABLE attendance ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE attendance ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE attendance ADD COLUMN device_info TEXT;

-- Create index for performance
CREATE INDEX idx_attendance_sessions_code ON attendance_sessions(attendance_code);
CREATE INDEX idx_attendance_sessions_expires ON attendance_sessions(expires_at);