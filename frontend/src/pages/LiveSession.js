import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper
} from '@mui/material';
import { 
  VideoCall, 
  Schedule, 
  Person, 
  ExitToApp, 
  CheckCircle, 
  Warning,
  ArrowBack,
  AccessTime
} from '@mui/icons-material';
import { liveSessionService } from '../services/liveSessionService';
import LoadingSpinner from '../components/LoadingSpinner';

function LiveSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [joinDialog, setJoinDialog] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joinTime, setJoinTime] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const { data: sessionData, isLoading, error } = useQuery(
    ['liveSession', sessionId],
    () => liveSessionService.getSession(sessionId),
    {
      enabled: !!sessionId,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const joinMutation = useMutation(
    () => liveSessionService.joinSession(sessionId),
    {
      onSuccess: (data) => {
        setIsJoined(true);
        setJoinTime(new Date());
        setNotification({
          open: true,
          message: 'Successfully joined the session!',
          severity: 'success'
        });
        
        // Open Zoom if URL is provided
        if (data.data.zoom_url) {
          window.open(data.data.zoom_url, '_blank');
        }
      },
      onError: (error) => {
        setNotification({
          open: true,
          message: error.response?.data?.error || 'Failed to join session',
          severity: 'error'
        });
      }
    }
  );

  const leaveMutation = useMutation(
    () => liveSessionService.leaveSession(sessionId),
    {
      onSuccess: () => {
        setIsJoined(false);
        setJoinTime(null);
        setNotification({
          open: true,
          message: 'Successfully left the session',
          severity: 'info'
        });
      }
    }
  );

  // Auto-leave when component unmounts
  useEffect(() => {
    return () => {
      if (isJoined) {
        leaveMutation.mutate();
      }
    };
  }, [isJoined]);

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <LoadingSpinner message="Loading session..." />
      </Container>
    );
  }

  if (error || !sessionData) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Session not found or you don't have access to this session.
        </Alert>
        <Button onClick={() => navigate('/dashboard')} startIcon={<ArrowBack />}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const session = sessionData.data;
  const sessionStart = new Date(session.start_time);
  const sessionEnd = session.end_time ? new Date(session.end_time) : null;
  const now = new Date();
  
  const isUpcoming = sessionStart > now;
  const isLive = sessionStart <= now && (!sessionEnd || sessionEnd > now);
  const isEnded = sessionEnd && sessionEnd < now;

  const getSessionStatus = () => {
    if (isEnded) return { status: 'Ended', color: '#666', icon: <CheckCircle /> };
    if (isLive) return { status: 'Live Now', color: '#A1F360', icon: <VideoCall /> };
    if (isUpcoming) return { status: 'Upcoming', color: '#ff9800', icon: <Schedule /> };
    return { status: 'Unknown', color: '#666', icon: <Warning /> };
  };

  const sessionStatus = getSessionStatus();

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getCurrentDuration = () => {
    if (!joinTime) return 0;
    return Math.floor((new Date() - joinTime) / 1000 / 60);
  };

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{
              color: '#666',
              textTransform: 'none',
              fontWeight: 300,
              mb: 3,
              '&:hover': { backgroundColor: 'transparent', color: '#A1F360' }
            }}
          >
            Back to Dashboard
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c' }}>
              Live Session
            </Typography>
            <Chip
              icon={sessionStatus.icon}
              label={sessionStatus.status}
              sx={{
                backgroundColor: sessionStatus.color,
                color: sessionStatus.status === 'Live Now' ? '#2c2c2c' : '#fff',
                fontWeight: 500
              }}
            />
          </Box>
          
          <Typography variant="h5" sx={{ color: '#666', fontWeight: 300, mb: 1 }}>
            {session.course_title} - Week {session.week_number}
          </Typography>
          <Typography variant="h6" sx={{ color: '#2c2c2c', mb: 3 }}>
            {session.module_title}
          </Typography>
          
          <Box sx={{ width: 60, height: 3, backgroundColor: '#A1F360' }} />
        </Box>

        <Grid container spacing={6}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Session Info */}
            <Card sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                  Session Information
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Schedule sx={{ color: '#A1F360' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                          Start Time
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                          {sessionStart.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Person sx={{ color: '#A1F360' }} />
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

                {session.module_description && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 2 }}>
                      About This Session
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                      {session.module_description}
                    </Typography>
                  </Box>
                )}

                {/* Join/Leave Controls */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {!isJoined ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<VideoCall />}
                      onClick={() => setJoinDialog(true)}
                      disabled={!isLive || joinMutation.isLoading}
                      sx={{
                        backgroundColor: '#A1F360',
                        color: '#2c2c2c',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        '&:hover': { backgroundColor: '#8FE040' },
                        '&:disabled': { backgroundColor: '#f0f0f0', color: '#999' }
                      }}
                    >
                      {joinMutation.isLoading ? 'Joining...' : 'Join Session'}
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Button
                        variant="outlined"
                        startIcon={<ExitToApp />}
                        onClick={() => leaveMutation.mutate()}
                        disabled={leaveMutation.isLoading}
                        sx={{
                          borderColor: '#d32f2f',
                          color: '#d32f2f',
                          '&:hover': { borderColor: '#b71c1c', backgroundColor: 'rgba(211, 47, 47, 0.05)' }
                        }}
                      >
                        {leaveMutation.isLoading ? 'Leaving...' : 'Leave Session'}
                      </Button>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ color: '#A1F360', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Duration: {formatDuration(getCurrentDuration())}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                {!isLive && (
                  <Alert 
                    severity={isUpcoming ? "info" : "warning"} 
                    sx={{ mt: 3 }}
                  >
                    {isUpcoming 
                      ? `This session will start ${sessionStart.toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                        })}`
                      : 'This session has ended'
                    }
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Session Guidelines */}
            <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 3 }}>
                  Session Guidelines
                </Typography>
                
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Join on time"
                      secondary="Please join the session at the scheduled start time to avoid disruption"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Mute when not speaking"
                      secondary="Keep your microphone muted unless you're actively participating"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Use chat for questions"
                      secondary="Feel free to ask questions using the chat feature during the session"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Stay engaged"
                      secondary="Active participation helps create a better learning experience for everyone"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Session Status */}
            <Card sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 3 }}>
                  Session Status
                </Typography>
                
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {sessionStatus.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 400, color: sessionStatus.color, mb: 1 }}>
                    {sessionStatus.status}
                  </Typography>
                  {isJoined && (
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      You joined {formatDuration(getCurrentDuration())} ago
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Technical Requirements */}
            <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 3 }}>
                  Technical Requirements
                </Typography>
                
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Stable Internet Connection"
                      secondary="Broadband connection recommended"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Zoom Application"
                      secondary="Latest version of Zoom client"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="Audio & Video"
                      secondary="Working microphone and camera"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Join Confirmation Dialog */}
        <Dialog open={joinDialog} onClose={() => setJoinDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 300, fontSize: '1.5rem' }}>
            Join Live Session
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You're about to join the live session for:
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, color: '#2c2c2c' }}>
              {session.module_title}
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Your attendance will be recorded when you join this session.
            </Alert>
            {session.zoom_meeting_id && (
              <Alert severity="success">
                Zoom meeting will open automatically in a new window.
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setJoinDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setJoinDialog(false);
                joinMutation.mutate();
              }}
              variant="contained"
              sx={{
                backgroundColor: '#A1F360',
                color: '#2c2c2c',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#8FE040' }
              }}
            >
              Join Now
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification */}
        {notification.open && (
          <Alert 
            severity={notification.severity}
            onClose={() => setNotification({ ...notification, open: false })}
            sx={{ 
              position: 'fixed', 
              bottom: 20, 
              right: 20, 
              zIndex: 1000,
              minWidth: 300
            }}
          >
            {notification.message}
          </Alert>
        )}
      </Container>
    </Box>
  );
}

export default LiveSession;