const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const attendanceRoutes = require('./routes/attendance');
const videoRoutes = require('./routes/videos');
const assignmentRoutes = require('./routes/assignments');
const certificateRoutes = require('./routes/certificates');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');
const secureAttendanceRoutes = require('./routes/secure-attendance');
const discussionRoutes = require('./routes/discussions');
const peerAssessmentRoutes = require('./routes/peer-assessment');
const liveSessionRoutes = require('./routes/live-sessions');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/secure-attendance', secureAttendanceRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/peer-assessment', peerAssessmentRoutes);
app.use('/api/live-sessions', liveSessionRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});