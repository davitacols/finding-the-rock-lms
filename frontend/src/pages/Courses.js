import React, { useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button, LinearProgress, Chip, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar } from '@mui/material';
import { School, Schedule, Assignment, CheckCircle, ArrowForward, Info, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { courseService } from '../services/courseService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

function Courses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [enrollDialog, setEnrollDialog] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const { data: coursesData, isLoading, error } = useQuery(
    'courses',
    courseService.getCourses,
    {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: enrollmentsData } = useQuery(
    'userEnrollments',
    () => courseService.getUserEnrollments(),
    {
      enabled: !!user,
      retry: 2,
    }
  );

  const enrollMutation = useMutation(
    (courseId) => courseService.enrollInCourse(courseId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userEnrollments');
        queryClient.invalidateQueries('courses');
        setNotification({
          open: true,
          message: 'Successfully enrolled in course!',
          severity: 'success'
        });
        setEnrollDialog(null);
      },
      onError: (error) => {
        setNotification({
          open: true,
          message: error.response?.data?.message || 'Failed to enroll in course',
          severity: 'error'
        });
      }
    }
  );

  if (isLoading) {
    return (
      <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="xl">
          <LoadingSpinner message="Loading courses..." />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ mb: 4 }}>
            Failed to load courses. Please try again later.
          </Alert>
        </Container>
      </Box>
    );
  }

  // Sample data with enrollment status
  const sampleCourses = [
    {
      id: 1,
      title: 'Finding the Rock',
      description: 'A foundational 12-week course on Christian discipleship and spiritual growth. Learn the basics of faith, prayer, and spiritual development.',
      duration_weeks: 12,
      level: 'Foundational',
      is_active: true,
      enrolled_students: 45,
      prerequisite_course_id: null,
      prerequisite_title: null
    },
    {
      id: 2,
      title: 'Understanding Spiritual Authority',
      description: 'An advanced 16-week course exploring spiritual leadership, authority, and responsibility in Christian ministry and daily life.',
      duration_weeks: 16,
      level: 'Advanced',
      is_active: true,
      enrolled_students: 23,
      prerequisite_course_id: 1,
      prerequisite_title: 'Finding the Rock'
    }
  ];

  const sampleEnrollments = [
    {
      course_id: 1,
      status: 'active',
      completion_percentage: 75,
      modules_completed: 9,
      total_modules: 12,
      next_session: '2024-12-21T19:00:00Z'
    }
  ];

  const courses = coursesData?.data || sampleCourses;
  const enrollments = enrollmentsData?.data || sampleEnrollments;

  const getEnrollmentStatus = (courseId) => {
    return enrollments.find(e => e.course_id === courseId);
  };

  const canEnroll = (course) => {
    if (!course.prerequisite_course_id) return true;
    const prerequisiteEnrollment = enrollments.find(e => 
      e.course_id === course.prerequisite_course_id && e.status === 'completed'
    );
    return !!prerequisiteEnrollment;
  };

  const handleEnroll = (course) => {
    if (!canEnroll(course)) {
      setNotification({
        open: true,
        message: `Please complete ${course.prerequisite_title} first`,
        severity: 'warning'
      });
      return;
    }
    setEnrollDialog(course);
  };

  const confirmEnroll = () => {
    if (enrollDialog) {
      enrollMutation.mutate(enrollDialog.id);
    }
  };

  const getStats = () => {
    const totalCourses = courses.length;
    const enrolledCount = enrollments.length;
    const avgProgress = enrollments.length > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length)
      : 0;
    const totalModules = enrollments.reduce((sum, e) => sum + (e.total_modules || 0), 0);

    return { totalCourses, enrolledCount, avgProgress, totalModules };
  };

  const stats = getStats();

  return (
    <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* MIT-style Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 2 }}>
            Courses
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', fontWeight: 300, mb: 3, lineHeight: 1.6 }}>
            Explore our discipleship courses designed to strengthen your faith and spiritual growth
          </Typography>
          <Box sx={{ width: 60, height: 3, backgroundColor: '#A1F360' }} />
        </Box>

        {/* Course Statistics */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                {stats.totalCourses}
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                Available Courses
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                {stats.enrolledCount}
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                Enrolled
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                {stats.avgProgress}%
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                Average Progress
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
              <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 1 }}>
                {stats.totalModules}
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                Total Modules
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Course Grid */}
        <Grid container spacing={4}>
          {courses.map((course) => {
            const enrollment = getEnrollmentStatus(course.id);
            const isEnrolled = !!enrollment;
            const canEnrollInCourse = canEnroll(course);

            return (
              <Grid item xs={12} lg={6} key={course.id}>
                <Paper 
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
                  <Box sx={{ p: 4 }}>
                    {/* Course Header */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c' }}>
                          {course.title}
                        </Typography>
                        <Box 
                          sx={{ 
                            px: 2, 
                            py: 0.5, 
                            backgroundColor: isEnrolled ? '#A1F360' : course.is_active ? '#f0f0f0' : '#ffebee',
                            color: isEnrolled ? '#2c2c2c' : course.is_active ? '#666' : '#d32f2f',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: 1
                          }}
                        >
                          {isEnrolled ? 'Enrolled' : course.is_active ? 'Available' : 'Inactive'}
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 3 }}>
                        {course.description}
                      </Typography>

                      {/* Course Metadata */}
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule sx={{ fontSize: 16, color: '#A1F360' }} />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>
                                Duration
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                                {course.duration_weeks} weeks
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <School sx={{ fontSize: 16, color: '#A1F360' }} />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>
                                Level
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                                {course.level || 'Foundational'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Assignment sx={{ fontSize: 16, color: '#A1F360' }} />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>
                                Students
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                                {course.enrolled_students || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Progress Section */}
                      {isEnrolled && enrollment && (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                              Progress
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                              {enrollment.completion_percentage || 0}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={enrollment.completion_percentage || 0} 
                            sx={{ 
                              height: 3,
                              backgroundColor: '#f0f0f0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#A1F360'
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                            {enrollment.modules_completed || 0} of {enrollment.total_modules || 0} modules completed
                          </Typography>
                        </Box>
                      )}

                      {/* Prerequisites */}
                      {course.prerequisite_title && (
                        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {canEnrollInCourse ? (
                              <CheckCircle sx={{ fontSize: 16, color: '#A1F360' }} />
                            ) : (
                              <Warning sx={{ fontSize: 16, color: '#ff9800' }} />
                            )}
                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                              Prerequisite
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#2c2c2c' }}>
                            {course.prerequisite_title}
                            {canEnrollInCourse ? ' ✓ Completed' : ' (Required)'}
                          </Typography>
                        </Box>
                      )}

                      {/* Next Session */}
                      {isEnrolled && enrollment?.next_session && (
                        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                            Next Live Session
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                            {new Date(enrollment.next_session).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Action Button */}
                    <Button
                      variant={isEnrolled ? "contained" : "outlined"}
                      endIcon={isEnrolled ? <ArrowForward /> : <School />}
                      onClick={() => isEnrolled ? navigate(`/courses/${course.id}`) : handleEnroll(course)}
                      disabled={!course.is_active || (!isEnrolled && !canEnrollInCourse)}
                      sx={{
                        width: '100%',
                        py: 1.5,
                        borderRadius: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        fontSize: '1rem',
                        ...(isEnrolled ? {
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
                          },
                          '&:disabled': {
                            borderColor: '#e0e0e0',
                            color: '#999'
                          }
                        })
                      }}
                    >
                      {isEnrolled 
                        ? 'Continue Course' 
                        : !course.is_active
                          ? 'Course Inactive'
                          : !canEnrollInCourse 
                            ? 'Complete Prerequisite First'
                            : 'Enroll Now'
                      }
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Additional Information */}
        <Box sx={{ mt: 8, pt: 6, borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Course Requirements
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Regular attendance at live sessions
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Completion of weekly assignments and reflections
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Active participation in discussions and peer assessments
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                  • Minimum 80% completion rate for certification
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
                Support & Resources
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • 24/7 access to course materials and videos
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Weekly live sessions with instructors
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
                  • Peer learning community and discussion forums
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                  • Certificate of completion upon successful finish
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Enrollment Confirmation Dialog */}
        <Dialog 
          open={!!enrollDialog} 
          onClose={() => setEnrollDialog(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 300, fontSize: '1.5rem' }}>
            Enroll in Course
          </DialogTitle>
          <DialogContent>
            {enrollDialog && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {enrollDialog.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', mb: 3, lineHeight: 1.6 }}>
                  {enrollDialog.description}
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    Course Details:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2c2c2c' }}>
                    • Duration: {enrollDialog.duration_weeks} weeks
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2c2c2c' }}>
                    • Level: {enrollDialog.level || 'Foundational'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2c2c2c' }}>
                    • Students enrolled: {enrollDialog.enrolled_students || 0}
                  </Typography>
                </Box>
                <Alert severity="info" icon={<Info />}>
                  By enrolling, you commit to regular participation and completion of all course requirements.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setEnrollDialog(null)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmEnroll}
              variant="contained"
              disabled={enrollMutation.isLoading}
              sx={{ 
                backgroundColor: '#A1F360',
                color: '#2c2c2c',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#8FE040' }
              }}
            >
              {enrollMutation.isLoading ? 'Enrolling...' : 'Confirm Enrollment'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert 
            onClose={() => setNotification({ ...notification, open: false })} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Courses;