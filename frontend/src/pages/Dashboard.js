import React from 'react';
import { Container, Grid, Typography, Box, Button, LinearProgress, List, ListItem, ListItemText, Paper } from '@mui/material';
import { PlayArrow, Assignment, Person, TrendingUp, ArrowForward } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { dashboardService } from '../services/dashboardService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    dashboardService.getStats
  );

  if (statsLoading) {
    return (
      <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <LoadingSpinner message="Loading dashboard..." />
        </Container>
      </Box>
    );
  }

  // Sample data for when API returns empty
  const sampleStats = {
    user: { name: user?.name || user?.email?.split('@')[0] || 'Student' },
    courses: { active: 2, completed: 1 },
    progress: { average: 75, modules_completed: 8, modules_started: 12 },
    assignments: { completed: 6, avg_grade: 85 },
    attendance: { attendance_rate: 92, total_watch_time: 24 }
  };

  const displayStats = stats?.data || sampleStats;

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* MIT-style Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', fontWeight: 300 }}>
            Welcome back, {displayStats.user.name}
          </Typography>
          <Box sx={{ width: 60, height: 3, backgroundColor: '#A1F360', mt: 2 }} />
        </Box>

        {/* Key Metrics - MIT Style */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                {displayStats.progress.average}%
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                Overall Progress
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                {displayStats.courses.active}
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                Active Courses
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                {displayStats.assignments.avg_grade}%
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                Average Grade
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                {displayStats.attendance.total_watch_time}h
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                Hours Studied
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={6}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Current Course - MIT Style */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Current Course
              </Typography>
              
              <Paper sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
                <Box sx={{ p: 4 }}>
                  <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Typography variant="h5" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 2 }}>
                        Finding the Rock
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', mb: 3, lineHeight: 1.6 }}>
                        Week 3: Understanding God's Love and Grace
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                            Progress
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                            65%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={65} 
                          sx={{ 
                            height: 2,
                            backgroundColor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#A1F360'
                            }
                          }}
                        />
                      </Box>
                      
                      <Button 
                        variant="outlined"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/courses/1')}
                        sx={{ 
                          borderColor: '#2c2c2c',
                          color: '#2c2c2c',
                          textTransform: 'none',
                          fontWeight: 400,
                          px: 3,
                          py: 1,
                          borderRadius: 0,
                          '&:hover': { 
                            borderColor: '#A1F360',
                            backgroundColor: 'rgba(161, 243, 96, 0.05)'
                          }
                        }}
                      >
                        Continue Course
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box 
                        sx={{ 
                          height: 200,
                          backgroundImage: 'url(https://images.unsplash.com/photo-1507692049790-de58290a4334?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e0e0e0',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.3)'
                          }
                        }}
                      >
                        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                          <Box 
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              backgroundColor: 'rgba(161, 243, 96, 0.9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 1,
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#A1F360' }
                            }}
                          >
                            <PlayArrow sx={{ fontSize: 32, color: '#2c2c2c' }} />
                          </Box>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                            45 min video
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Box>

            {/* Quick Actions - MIT Grid Style */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Quick Actions
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 0, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 0, 
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                      '&:hover': { 
                        borderColor: '#A1F360',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box 
                      sx={{
                        height: 120,
                        backgroundImage: 'url(https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.3)'
                        }
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}>
                        <Assignment sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 1 }}>
                        Assignments
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        View and submit coursework
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 0, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 0, 
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                      '&:hover': { 
                        borderColor: '#A1F360',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box 
                      sx={{
                        height: 120,
                        backgroundImage: 'url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.3)'
                        }
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}>
                        <Person sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 1 }}>
                        Discussions
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Engage with peers
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 0, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 0, 
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                      '&:hover': { 
                        borderColor: '#A1F360',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box 
                      sx={{
                        height: 120,
                        backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.3)'
                        }
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}>
                        <TrendingUp sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 1 }}>
                        Peer Review
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Review submissions
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Upcoming Sessions */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Upcoming Sessions
              </Typography>
              
              <Paper sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ mb: 3, pb: 3, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 1 }}>
                      Finding the Rock - Week 4
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      Thursday, December 21 at 7:00 PM
                    </Typography>
                    <Box 
                      sx={{ 
                        backgroundColor: '#A1F360', 
                        color: '#2c2c2c',
                        fontWeight: 500,
                        borderRadius: 0,
                        px: 2,
                        py: 0.5,
                        fontSize: '0.75rem',
                        display: 'inline-block'
                      }} 
                    >
                      Live Session
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body1" sx={{ color: '#2c2c2c', mb: 1 }}>
                      Finding the Rock - Week 5
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Thursday, December 28 at 7:00 PM
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Recent Activity */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Recent Activity
              </Typography>
              
              <Paper sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ py: 2, px: 3, borderBottom: '1px solid #f0f0f0' }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ color: '#2c2c2c', mb: 1 }}>
                          Understanding God's Love and Grace
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                            Video progress completed
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                            2 days ago
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  <ListItem sx={{ py: 2, px: 3, borderBottom: '1px solid #f0f0f0' }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ color: '#2c2c2c', mb: 1 }}>
                          Week 2 Reflection Assignment
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                            Assignment submitted
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                            5 days ago
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ color: '#2c2c2c', mb: 1 }}>
                          Week 2 Live Session
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                            Session attended
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                            1 week ago
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard;