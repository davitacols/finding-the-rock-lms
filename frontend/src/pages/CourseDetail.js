import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Container,
  Grid,
  Typography,
  LinearProgress,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import { PlayArrow, CheckCircle, ArrowBack, VideoLibrary, Assignment, Forum, RateReview, MenuBook, Schedule } from '@mui/icons-material';
import { courseService } from '../services/courseService';
import { videoService } from '../services/videoService';
import DiscussionForum from '../components/DiscussionForum';
import PeerAssessment from '../components/PeerAssessment';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate, useParams } from 'react-router-dom';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  );
}

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [currentModule, setCurrentModule] = useState(null);
  const queryClient = useQueryClient();

  const { data: courseData, isLoading } = useQuery(
    ['course', courseId],
    () => courseService.getCourseDetail(courseId),
    {
      retry: false,
      onError: (error) => {
        console.error('Course fetch error:', error);
      }
    }
  );

  // Fallback sample data
  const sampleCourse = {
    course: {
      id: courseId,
      title: 'Finding the Rock',
      description: 'A foundational 12-week course on Christian discipleship and spiritual growth.'
    },
    modules: [
      {
        id: 1,
        title: 'Introduction to Faith',
        week_number: 1,
        description: 'Understanding the basics of Christian faith and belief.',
        video_url: null
      },
      {
        id: 2,
        title: 'Prayer and Worship',
        week_number: 2,
        description: 'Learning how to communicate with God through prayer.',
        video_url: null
      },
      {
        id: 3,
        title: 'Understanding God\'s Love and Grace',
        week_number: 3,
        description: 'Exploring the depth of God\'s love and grace in our lives.',
        video_url: null
      }
    ]
  };
  
  const { course, modules } = courseData || sampleCourse;

  // Auto-select first module if none selected
  React.useEffect(() => {
    if (modules.length > 0 && !currentModule) {
      setCurrentModule(modules[0]);
    }
  }, [modules, currentModule]);

  if (isLoading) return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <LoadingSpinner message="Loading course..." />
    </Container>
  );

  const getModuleProgress = (moduleId) => {
    if (moduleId <= 2) return 100;
    if (moduleId === 3) return 65;
    return 0;
  };

  const isModuleCompleted = (moduleId) => getModuleProgress(moduleId) === 100;

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/courses')}
            sx={{
              color: '#666',
              textTransform: 'none',
              fontWeight: 300,
              mb: 3,
              '&:hover': { backgroundColor: 'transparent', color: '#A1F360' }
            }}
          >
            Back to Courses
          </Button>
          
          <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 2 }}>
            {course.title}
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', fontWeight: 300, mb: 4, lineHeight: 1.6 }}>
            {course.description}
          </Typography>
          
          {/* Course Progress Overview */}
          <Paper sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none', mb: 4 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 2 }}>
                  Course Progress
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#A1F360'
                    }
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                  75% Complete • 9 of 12 weeks
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 300, color: '#A1F360' }}>9</Typography>
                    <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Completed
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c' }}>3</Typography>
                    <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Remaining
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Box sx={{ width: 60, height: 3, backgroundColor: '#A1F360' }} />
        </Box>

        <Grid container spacing={6}>
          {/* Module Sidebar */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none', mb: 4 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MenuBook sx={{ color: '#A1F360' }} />
                  Course Modules
                </Typography>
              </Box>
              
              <List sx={{ p: 0 }}>
                {modules.map((module, index) => {
                  const progress = getModuleProgress(module.id);
                  const isCompleted = isModuleCompleted(module.id);
                  const isCurrent = module.id === currentModule?.id;
                  
                  return (
                    <ListItem 
                      key={module.id}
                      button
                      onClick={() => setCurrentModule(module)}
                      sx={{ 
                        py: 3,
                        px: 3,
                        borderBottom: index < modules.length - 1 ? '1px solid #f0f0f0' : 'none',
                        backgroundColor: isCurrent ? 'rgba(161, 243, 96, 0.05)' : 'transparent',
                        borderLeft: isCurrent ? '4px solid #A1F360' : '4px solid transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(161, 243, 96, 0.02)'
                        }
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box 
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: isCompleted ? '#A1F360' : progress > 0 ? '#A1F360' : '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isCompleted || progress > 0 ? '#2c2c2c' : '#999',
                              mr: 2,
                              fontSize: '1rem',
                              fontWeight: 500
                            }}
                          >
                            {isCompleted ? <CheckCircle sx={{ fontSize: 20 }} /> : module.week_number}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c2c2c', mb: 0.5 }}>
                              Week {module.week_number}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                              {module.title}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ 
                              height: 3,
                              borderRadius: 2,
                              backgroundColor: '#f0f0f0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#A1F360'
                              }
                            }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {progress}% complete
                            </Typography>
                            {isCompleted && (
                              <Chip 
                                label="Complete" 
                                size="small" 
                                sx={{ 
                                  height: 18, 
                                  fontSize: '0.65rem',
                                  backgroundColor: '#A1F360', 
                                  color: '#2c2c2c' 
                                }} 
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>

            {/* Quick Stats */}
            <Paper sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c' }}>
                  Your Statistics
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                      <Typography variant="h5" sx={{ color: '#A1F360', fontWeight: 600 }}>24</Typography>
                      <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Hours Watched
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                      <Typography variant="h5" sx={{ color: '#A1F360', fontWeight: 600 }}>85%</Typography>
                      <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Average Grade
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                      <Typography variant="h5" sx={{ color: '#A1F360', fontWeight: 600 }}>92%</Typography>
                      <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Attendance
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                      <Typography variant="h5" sx={{ color: '#A1F360', fontWeight: 600 }}>6</Typography>
                      <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Assignments
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Current Module Video */}
            {currentModule && (
              <Paper sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none', mb: 4 }}>
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                    Week {currentModule.week_number}: {currentModule.title}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      height: 350,
                      backgroundColor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #e0e0e0',
                      mb: 3,
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Box 
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          backgroundColor: '#A1F360',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#8FE040' }
                        }}
                      >
                        <PlayArrow sx={{ fontSize: 40, color: '#2c2c2c' }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: '#666', fontWeight: 300, mb: 1 }}>
                        Video Content
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        45 minutes • HD Quality
                      </Typography>
                    </Box>
                    
                    {/* Progress indicator */}
                    <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getModuleProgress(currentModule.id)} 
                        sx={{ 
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#A1F360'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 3 }}>
                    {currentModule.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      sx={{
                        backgroundColor: '#A1F360',
                        color: '#2c2c2c',
                        fontWeight: 500,
                        px: 3,
                        '&:hover': { backgroundColor: '#8FE040' }
                      }}
                    >
                      {getModuleProgress(currentModule.id) > 0 ? 'Continue Watching' : 'Start Watching'}
                    </Button>
                    
                    {getModuleProgress(currentModule.id) > 0 && (
                      <Button
                        variant="outlined"
                        startIcon={<Schedule />}
                        sx={{
                          borderColor: '#2c2c2c',
                          color: '#2c2c2c',
                          '&:hover': { borderColor: '#A1F360', backgroundColor: 'rgba(161, 243, 96, 0.05)' }
                        }}
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Activity Tabs */}
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
                  <Tab icon={<Assignment />} iconPosition="start" label="Assignments" />
                  <Tab icon={<Forum />} iconPosition="start" label="Discussions" />
                  <Tab icon={<RateReview />} iconPosition="start" label="Peer Assessment" />
                  <Tab icon={<VideoLibrary />} iconPosition="start" label="Resources" />
                </Tabs>
              </Box>

              <Box sx={{ minHeight: 400 }}>
                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                    Weekly Assignments
                  </Typography>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Complete assignments to track your progress and earn your certificate.
                  </Alert>
                  <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                    Assignment content will be available here. Students will be able to view assignment details, 
                    submission requirements, and due dates in this section.
                  </Typography>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <DiscussionForum moduleId={currentModule?.id} />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <PeerAssessment moduleId={currentModule?.id} />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                    Course Resources
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                    Additional reading materials, reference documents, and supplementary resources 
                    will be made available in this section.
                  </Typography>
                </TabPanel>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default CourseDetail;