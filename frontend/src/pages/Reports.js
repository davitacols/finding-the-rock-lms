import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  VideoLibrary,
  Download,
  DateRange,
  BarChart,
  PieChart,
  Timeline
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import LoadingSpinner from '../components/LoadingSpinner';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  );
}

function Reports() {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('month');
  const [courseFilter, setCourseFilter] = useState('all');

  // Sample data - replace with actual API calls
  const overviewStats = {
    totalStudents: 156,
    activeStudents: 142,
    completionRate: 78,
    avgGrade: 85,
    totalHours: 2340,
    coursesOffered: 2
  };

  const studentProgress = [
    { id: 1, name: 'John Smith', course: 'Finding the Rock', progress: 85, grade: 92, lastActive: '2 hours ago' },
    { id: 2, name: 'Sarah Johnson', course: 'Finding the Rock', progress: 92, grade: 88, lastActive: '1 day ago' },
    { id: 3, name: 'Michael Brown', course: 'Spiritual Authority', progress: 67, grade: 85, lastActive: '3 hours ago' },
    { id: 4, name: 'Emily Davis', course: 'Finding the Rock', progress: 100, grade: 95, lastActive: '5 hours ago' },
    { id: 5, name: 'David Wilson', course: 'Spiritual Authority', progress: 45, grade: 78, lastActive: '2 days ago' }
  ];

  const courseStats = [
    {
      course: 'Finding the Rock',
      enrolled: 98,
      completed: 76,
      avgProgress: 82,
      avgGrade: 87,
      dropoutRate: 8
    },
    {
      course: 'Understanding Spiritual Authority',
      enrolled: 58,
      completed: 32,
      avgProgress: 65,
      avgGrade: 83,
      dropoutRate: 12
    }
  ];

  const attendanceData = [
    { session: 'Week 1 - Introduction', attended: 89, total: 98, rate: 91 },
    { session: 'Week 2 - Prayer & Worship', attended: 85, total: 98, rate: 87 },
    { session: 'Week 3 - God\'s Love', attended: 82, total: 98, rate: 84 },
    { session: 'Week 4 - Faith Foundations', attended: 88, total: 98, rate: 90 }
  ];

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#A1F360';
    if (progress >= 60) return '#FFA726';
    return '#EF5350';
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', fontWeight: 300 }}>
            Comprehensive insights into student progress and course performance
          </Typography>
          <Box sx={{ width: 60, height: 3, backgroundColor: '#A1F360', mt: 2 }} />
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{ borderRadius: 0 }}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Course</InputLabel>
            <Select
              value={courseFilter}
              label="Course"
              onChange={(e) => setCourseFilter(e.target.value)}
              sx={{ borderRadius: 0 }}
            >
              <MenuItem value="all">All Courses</MenuItem>
              <MenuItem value="finding">Finding the Rock</MenuItem>
              <MenuItem value="authority">Spiritual Authority</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<Download />}
            sx={{
              borderColor: '#2c2c2c',
              color: '#2c2c2c',
              borderRadius: 0,
              textTransform: 'none',
              '&:hover': { borderColor: '#A1F360', backgroundColor: 'rgba(161, 243, 96, 0.05)' }
            }}
          >
            Export Data
          </Button>
        </Box>

        {/* Overview Stats */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={2}>
            <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <People sx={{ fontSize: 32, color: '#A1F360', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                  {overviewStats.totalStudents}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Total Students
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TrendingUp sx={{ fontSize: 32, color: '#A1F360', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                  {overviewStats.activeStudents}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Active Students
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Assignment sx={{ fontSize: 32, color: '#A1F360', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                  {overviewStats.completionRate}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Completion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <BarChart sx={{ fontSize: 32, color: '#A1F360', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                  {overviewStats.avgGrade}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Average Grade
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <VideoLibrary sx={{ fontSize: 32, color: '#A1F360', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                  {overviewStats.totalHours}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Total Hours
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Timeline sx={{ fontSize: 32, color: '#A1F360', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                  {overviewStats.coursesOffered}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Courses Offered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Reports Tabs */}
        <Paper sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
          <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                px: 4,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 400,
                  color: '#666',
                  minHeight: 64,
                  '&.Mui-selected': {
                    color: '#2c2c2c',
                    fontWeight: 500
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#A1F360',
                  height: 3
                }
              }}
            >
              <Tab label="Student Progress" />
              <Tab label="Course Performance" />
              <Tab label="Attendance Reports" />
              <Tab label="Engagement Analytics" />
            </Tabs>
          </Box>

          <Box sx={{ minHeight: 600 }}>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Individual Student Progress
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Student Name</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Course</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Progress</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Grade</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Last Active</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentProgress.map((student) => (
                      <TableRow key={student.id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                        <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>
                          {student.name}
                        </TableCell>
                        <TableCell sx={{ color: '#666' }}>
                          {student.course}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={student.progress}
                              sx={{
                                width: 100,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getProgressColor(student.progress)
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ color: '#666', minWidth: 40 }}>
                              {student.progress}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${student.grade}%`}
                            color={getGradeColor(student.grade)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#666' }}>
                          {student.lastActive}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.progress === 100 ? 'Completed' : student.progress > 0 ? 'In Progress' : 'Not Started'}
                            color={student.progress === 100 ? 'success' : student.progress > 0 ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Course Performance Overview
              </Typography>
              
              <Grid container spacing={4}>
                {courseStats.map((course, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Paper sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
                      <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 3 }}>
                        {course.course}
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa' }}>
                            <Typography variant="h4" sx={{ color: '#A1F360', fontWeight: 300 }}>
                              {course.enrolled}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase' }}>
                              Enrolled
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa' }}>
                            <Typography variant="h4" sx={{ color: '#A1F360', fontWeight: 300 }}>
                              {course.completed}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase' }}>
                              Completed
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa' }}>
                            <Typography variant="h4" sx={{ color: '#A1F360', fontWeight: 300 }}>
                              {course.avgProgress}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase' }}>
                              Avg Progress
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa' }}>
                            <Typography variant="h4" sx={{ color: '#A1F360', fontWeight: 300 }}>
                              {course.avgGrade}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase' }}>
                              Avg Grade
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 3, p: 2, backgroundColor: course.dropoutRate > 10 ? '#ffebee' : '#e8f5e8' }}>
                        <Typography variant="body2" sx={{ color: course.dropoutRate > 10 ? '#d32f2f' : '#2e7d32' }}>
                          Dropout Rate: {course.dropoutRate}%
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Live Session Attendance
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Session</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Attended</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Total Enrolled</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Attendance Rate</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>Visual</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.map((session, index) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                        <TableCell sx={{ fontWeight: 500, color: '#2c2c2c' }}>
                          {session.session}
                        </TableCell>
                        <TableCell sx={{ color: '#666' }}>
                          {session.attended}
                        </TableCell>
                        <TableCell sx={{ color: '#666' }}>
                          {session.total}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${session.rate}%`}
                            color={session.rate >= 85 ? 'success' : session.rate >= 70 ? 'warning' : 'error'}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={session.rate}
                            sx={{
                              width: 120,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: '#f0f0f0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: session.rate >= 85 ? '#A1F360' : session.rate >= 70 ? '#FFA726' : '#EF5350'
                              }
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Student Engagement Analytics
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 3 }}>
                      Discussion Participation
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>Active Participants</Typography>
                      <Typography variant="body2" sx={{ color: '#2c2c2c', fontWeight: 500 }}>89%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={89}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#A1F360' }
                      }}
                    />
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 3 }}>
                      Assignment Submission Rate
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>On-time Submissions</Typography>
                      <Typography variant="body2" sx={{ color: '#2c2c2c', fontWeight: 500 }}>76%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={76}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#A1F360' }
                      }}
                    />
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 3 }}>
                      Video Completion Rate
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>Videos Watched Fully</Typography>
                      <Typography variant="body2" sx={{ color: '#2c2c2c', fontWeight: 500 }}>82%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={82}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#A1F360' }
                      }}
                    />
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 3 }}>
                      Peer Review Participation
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>Active Reviewers</Typography>
                      <Typography variant="body2" sx={{ color: '#2c2c2c', fontWeight: 500 }}>68%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={68}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#A1F360' }
                      }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Reports;