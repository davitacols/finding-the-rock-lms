import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  School,
  Person,
  Settings,
  CheckCircle,
  VideoLibrary,
  Assignment,
  Forum,
  BarChart,
  ArrowForward,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const steps = ['Profile Setup', 'Course Assignment', 'Platform Overview', 'Complete Setup'];

function InstructorOnboarding() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    expertise: [],
    assignedCourses: [],
    experience: ''
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    // Save instructor data and redirect to dashboard
    navigate('/');
  };

  const expertiseOptions = [
    'Biblical Studies', 'Theology', 'Pastoral Care', 'Youth Ministry', 
    'Worship', 'Evangelism', 'Discipleship', 'Leadership'
  ];

  const availableCourses = [
    { id: 1, title: 'Finding the Rock', duration: '12 weeks', students: 98 },
    { id: 2, title: 'Understanding Spiritual Authority', duration: '14-20 weeks', students: 58 }
  ];

  const platformFeatures = [
    { icon: <VideoLibrary />, title: 'Video Management', desc: 'Upload and manage course videos' },
    { icon: <Assignment />, title: 'Assignment Creation', desc: 'Create and grade assignments' },
    { icon: <Forum />, title: 'Discussion Forums', desc: 'Facilitate student discussions' },
    { icon: <BarChart />, title: 'Analytics & Reports', desc: 'Track student progress and engagement' }
  ];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
              Tell us about yourself
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  sx={{ borderRadius: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  sx={{ borderRadius: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  sx={{ borderRadius: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  sx={{ borderRadius: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Bio / Background"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  sx={{ borderRadius: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Years of Experience</InputLabel>
                  <Select
                    value={formData.experience}
                    label="Years of Experience"
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    sx={{ borderRadius: 0 }}
                  >
                    <MenuItem value="1-2">1-2 years</MenuItem>
                    <MenuItem value="3-5">3-5 years</MenuItem>
                    <MenuItem value="6-10">6-10 years</MenuItem>
                    <MenuItem value="10+">10+ years</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Areas of Expertise</InputLabel>
                  <Select
                    multiple
                    value={formData.expertise}
                    label="Areas of Expertise"
                    onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                    sx={{ borderRadius: 0 }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {expertiseOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
              Course Assignments
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
              Select the courses you'll be teaching this semester.
            </Typography>
            <Grid container spacing={3}>
              {availableCourses.map((course) => (
                <Grid item xs={12} md={6} key={course.id}>
                  <Card 
                    sx={{ 
                      border: formData.assignedCourses.includes(course.id) ? '2px solid #A1F360' : '1px solid #e0e0e0',
                      borderRadius: 0,
                      boxShadow: 'none',
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#A1F360' }
                    }}
                    onClick={() => {
                      const newCourses = formData.assignedCourses.includes(course.id)
                        ? formData.assignedCourses.filter(id => id !== course.id)
                        : [...formData.assignedCourses, course.id];
                      setFormData({...formData, assignedCourses: newCourses});
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c' }}>
                          {course.title}
                        </Typography>
                        {formData.assignedCourses.includes(course.id) && (
                          <CheckCircle sx={{ color: '#A1F360' }} />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                        Duration: {course.duration}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Current Students: {course.students}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3 }}>
              Platform Overview
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
              Here's what you can do as an instructor on our platform.
            </Typography>
            <Grid container spacing={3}>
              {platformFeatures.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ backgroundColor: '#A1F360', color: '#2c2c2c', mr: 2 }}>
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c' }}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {feature.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 2 }}>
                Quick Start Checklist
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#A1F360' }} />
                  </ListItemIcon>
                  <ListItemText primary="Upload your first course video" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#A1F360' }} />
                  </ListItemIcon>
                  <ListItemText primary="Create your first discussion topic" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#A1F360' }} />
                  </ListItemIcon>
                  <ListItemText primary="Set up your first assignment" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#A1F360' }} />
                  </ListItemIcon>
                  <ListItemText primary="Review student analytics" />
                </ListItem>
              </List>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: '#A1F360', mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 2 }}>
              Welcome to Finding the Rock!
            </Typography>
            <Typography variant="h6" sx={{ color: '#666', fontWeight: 300, mb: 4 }}>
              Your instructor account is now set up and ready to use.
            </Typography>
            
            <Paper sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none', mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c2c2c', mb: 2 }}>
                Your Profile Summary
              </Typography>
              <Grid container spacing={2} sx={{ textAlign: 'left' }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Name:</Typography>
                  <Typography variant="body1" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                    {formData.firstName} {formData.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Experience:</Typography>
                  <Typography variant="body1" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                    {formData.experience}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#666' }}>Assigned Courses:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {formData.assignedCourses.map(courseId => {
                      const course = availableCourses.find(c => c.id === courseId);
                      return (
                        <Chip key={courseId} label={course?.title} color="primary" size="small" />
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <School sx={{ fontSize: 48, color: '#A1F360', mr: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 300, color: '#2c2c2c' }}>
              Instructor Onboarding
            </Typography>
          </Box>
          <Box sx={{ width: 80, height: 4, backgroundColor: '#A1F360', mx: 'auto', mb: 4 }} />
          <Typography variant="h6" sx={{ color: '#666', fontWeight: 300 }}>
            Let's get you set up to start teaching
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none', mb: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { color: '#666' },
                    '& .MuiStepLabel-label.Mui-active': { color: '#2c2c2c', fontWeight: 500 },
                    '& .MuiStepLabel-label.Mui-completed': { color: '#A1F360' },
                    '& .MuiStepIcon-root': { color: '#e0e0e0' },
                    '& .MuiStepIcon-root.Mui-active': { color: '#A1F360' },
                    '& .MuiStepIcon-root.Mui-completed': { color: '#A1F360' }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{
                color: '#666',
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(161, 243, 96, 0.1)' }
              }}
            >
              Back
            </Button>
            
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleComplete : handleNext}
              endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
              sx={{
                backgroundColor: '#A1F360',
                color: '#2c2c2c',
                fontWeight: 500,
                textTransform: 'none',
                px: 4,
                borderRadius: 0,
                '&:hover': { backgroundColor: '#8FE040' }
              }}
            >
              {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default InstructorOnboarding;