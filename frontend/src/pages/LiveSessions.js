import React from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button, Chip, Alert } from '@mui/material';
import { VideoCall, Schedule, Person, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { liveSessionService } from '../services/liveSessionService';
import LoadingSpinner from '../components/LoadingSpinner';

function LiveSessions() {
  const navigate = useNavigate();

  const { data: sessionsData, isLoading, error } = useQuery(
    'upcomingSessions',
    liveSessionService.getUpcomingSessions,
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  if (isLoading) {
    return (
      <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="xl">
          <LoadingSpinner message="Loading sessions..." />
        </Container>
      </Box>
    );
  }

  const sessions = sessionsData?.data || [];

  const getSessionStatus = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((start - now) / 1000 / 60);
    
    if (diffMinutes <= 0) return { status: 'Live Now', color: '#A1F360', canJoin: true };
    if (diffMinutes <= 15) return { status: 'Starting Soon', color: '#ff9800', canJoin: true };
    return { status: 'Upcoming', color: '#666', canJoin: false };
  };

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 2 }}>
            Live Sessions
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', fontWeight: 300, mb: 3, lineHeight: 1.6 }}>
            Join upcoming live sessions and interact with instructors and fellow students
          </Typography>
          <Box sx={{ width: 60, height: 3, backgroundColor: '#A1F360' }} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            Failed to load sessions. Please try again later.
          </Alert>
        )}

        {sessions.length === 0 ? (
          <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <VideoCall sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#666', mb: 2 }}>
                No Upcoming Sessions
              </Typography>
              <Typography variant="body1" sx={{ color: '#999' }}>
                Live sessions will appear here when scheduled by your instructors
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={4}>
            {sessions.map((session) => {
              const sessionStatus = getSessionStatus(session.start_time);
              const startTime = new Date(session.start_time);
              
              return (
                <Grid item xs={12} lg={6} key={session.id}>
                  <Card 
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 0, 
                      boxShadow: 'none',
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#A1F360',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      {/* Session Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                            {session.course_title}
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                            Week {session.week_number}: {session.module_title}
                          </Typography>
                        </Box>
                        <Chip
                          label={sessionStatus.status}
                          sx={{
                            backgroundColor: sessionStatus.color,
                            color: sessionStatus.status === 'Live Now' ? '#2c2c2c' : '#fff',
                            fontWeight: 500
                          }}
                        />
                      </Box>

                      {/* Session Details */}
                      <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Schedule sx={{ color: '#A1F360', fontSize: 20 }} />
                            <Box>
                              <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Session Time
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                                {startTime.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Person sx={{ color: '#A1F360', fontSize: 20 }} />
                            <Box>
                              <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Instructor
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                                {session.instructor_first_name} {session.instructor_last_name}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Attendance Status */}
                      {session.attendance_status && (
                        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                            Attendance Status
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: session.attendance_status === 'present' ? '#A1F360' : '#666',
                            fontWeight: 500,
                            textTransform: 'capitalize'
                          }}>
                            {session.attendance_status === 'present' ? '✓ Attended' : session.attendance_status}
                          </Typography>
                        </Box>
                      )}

                      {/* Action Button */}
                      <Button
                        variant={sessionStatus.canJoin ? "contained" : "outlined"}
                        endIcon={sessionStatus.canJoin ? <VideoCall /> : <ArrowForward />}
                        onClick={() => navigate(`/live-sessions/${session.id}`)}
                        sx={{
                          width: '100%',
                          py: 1.5,
                          borderRadius: 0,
                          textTransform: 'none',
                          fontWeight: 400,
                          fontSize: '1rem',
                          ...(sessionStatus.canJoin ? {
                            backgroundColor: '#A1F360',
                            color: '#2c2c2c',
                            '&:hover': {
                              backgroundColor: '#8FE040'
                            }
                          } : {
                            borderColor: '#2c2c2c',
                            color: '#2c2c2c',
                            '&:hover': {
                              borderColor: '#A1F360',
                              backgroundColor: 'rgba(161, 243, 96, 0.05)'
                            }
                          })
                        }}
                      >
                        {sessionStatus.canJoin ? 'Join Session' : 'View Details'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Information Section */}
        <Box sx={{ mt: 8, pt: 6, borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Before Joining
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Test your audio and video equipment
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Ensure you have a stable internet connection
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Download and install the latest Zoom client
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                  • Find a quiet space for the session
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                During Sessions
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Mute your microphone when not speaking
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Use the chat feature for questions
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Participate actively in discussions
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                  • Stay for the entire session duration
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default LiveSessions;