import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Tab, Tabs, IconButton, InputAdornment, Grid } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, School, ChevronRight } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  );
}

function Login() {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const { signIn, signUp, confirmSignUp } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const result = await signIn(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.error || 'Sign in failed');
      setMessage(result.error);
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const result = await signUp(email, password, firstName, lastName);
    if (result.success) {
      setNeedsConfirmation(true);
      toast.success('Account created! Check your email for confirmation code.');
      setMessage('Please check your email for confirmation code');
    } else {
      toast.error(result.error || 'Account creation failed');
      setMessage(result.error);
    }
    setLoading(false);
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const result = await confirmSignUp(email, confirmationCode);
    if (result.success) {
      toast.success('Account confirmed! You can now sign in.');
      setMessage('Account confirmed! Please sign in.');
      setNeedsConfirmation(false);
      setTabValue(0);
    } else {
      toast.error(result.error || 'Confirmation failed');
      setMessage(result.error);
    }
    setLoading(false);
  };

  if (needsConfirmation) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
              <School sx={{ fontSize: 48, color: '#A1F360', mr: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 300, color: '#2c2c2c' }}>
                Finding the Rock
              </Typography>
            </Box>
            <Box sx={{ width: 60, height: 3, backgroundColor: '#A1F360', mx: 'auto', mb: 4 }} />
            <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 2 }}>
              Confirm Your Account
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', maxWidth: 400, mx: 'auto' }}>
              We've sent a confirmation code to your email address. Please enter it below to activate your account.
            </Typography>
          </Box>
          
          <Paper sx={{ p: 6, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none', backgroundColor: '#ffffff' }}>
            <Box component="form" onSubmit={handleConfirmSignUp}>
              <TextField
                fullWidth
                label="Confirmation Code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                required
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '&:hover fieldset': { borderColor: '#A1F360' },
                    '&.Mui-focused fieldset': { borderColor: '#A1F360' }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#A1F360' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#999' }} />
                    </InputAdornment>
                  )
                }}
              />
              
              {message && (
                <Box sx={{ p: 2, mb: 3, backgroundColor: '#f0f8ff', border: '1px solid #e3f2fd' }}>
                  <Typography variant="body2" sx={{ color: '#1976d2' }}>
                    {message}
                  </Typography>
                </Box>
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={<ChevronRight />}
                sx={{
                  py: 2,
                  backgroundColor: '#A1F360',
                  color: '#2c2c2c',
                  fontWeight: 500,
                  fontSize: '1rem',
                  borderRadius: 0,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#8FE040' },
                  '&:disabled': { backgroundColor: '#f0f0f0', color: '#999' }
                }}
              >
                {loading ? 'Confirming Account...' : 'Confirm Account'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={8} alignItems="center" sx={{ minHeight: 'calc(100vh - 128px)' }}>
          {/* Left Side - Branding */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ textAlign: { xs: 'center', lg: 'left' }, pr: { lg: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', lg: 'flex-start' }, mb: 4 }}>
                <School sx={{ fontSize: 56, color: '#A1F360', mr: 2 }} />
                <Typography variant="h2" sx={{ fontWeight: 300, color: '#2c2c2c' }}>
                  Finding the Rock
                </Typography>
              </Box>
              
              <Box sx={{ width: 80, height: 4, backgroundColor: '#A1F360', mb: 6, mx: { xs: 'auto', lg: 0 } }} />
              
              <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 3, lineHeight: 1.3 }}>
                Church Discipleship Learning Management System
              </Typography>
              
              <Typography variant="h6" sx={{ color: '#666', fontWeight: 300, mb: 4, lineHeight: 1.6 }}>
                Deepen your faith through structured learning, community engagement, and spiritual growth.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: { xs: 'auto', lg: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 8, height: 8, backgroundColor: '#A1F360', borderRadius: '50%' }} />
                  <Typography variant="body1" sx={{ color: '#666' }}>12-week structured courses</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 8, height: 8, backgroundColor: '#A1F360', borderRadius: '50%' }} />
                  <Typography variant="body1" sx={{ color: '#666' }}>Interactive discussions and peer learning</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 8, height: 8, backgroundColor: '#A1F360', borderRadius: '50%' }} />
                  <Typography variant="body1" sx={{ color: '#666' }}>Progress tracking and certificates</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Auth Form */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 6, border: '1px solid #e0e0e0', borderRadius: 0, boxShadow: 'none', backgroundColor: '#ffffff', maxWidth: 480, mx: 'auto' }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 300, color: '#2c2c2c', mb: 2 }}>
                  Welcome
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  Sign in to continue your learning journey
                </Typography>
              </Box>
              
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)} 
                sx={{ 
                  mb: 4,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 400,
                    color: '#666',
                    minHeight: 48,
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
                <Tab label="Sign In" sx={{ flex: 1 }} />
                <Tab label="Create Account" sx={{ flex: 1 }} />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Box component="form" onSubmit={handleSignIn}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#A1F360' },
                        '&.Mui-focused fieldset': { borderColor: '#A1F360' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#A1F360' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#999' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    sx={{ 
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#A1F360' },
                        '&.Mui-focused fieldset': { borderColor: '#A1F360' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#A1F360' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#999' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#999' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  {message && (
                    <Box sx={{ p: 2, mb: 3, backgroundColor: '#ffebee', border: '1px solid #ffcdd2' }}>
                      <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                        {message}
                      </Typography>
                    </Box>
                  )}
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    endIcon={<ChevronRight />}
                    sx={{
                      py: 2,
                      backgroundColor: '#A1F360',
                      color: '#2c2c2c',
                      fontWeight: 500,
                      fontSize: '1rem',
                      borderRadius: 0,
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#8FE040' },
                      '&:disabled': { backgroundColor: '#f0f0f0', color: '#999' }
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box component="form" onSubmit={handleSignUp}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0,
                          '&:hover fieldset': { borderColor: '#A1F360' },
                          '&.Mui-focused fieldset': { borderColor: '#A1F360' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#A1F360' }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: '#999' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0,
                          '&:hover fieldset': { borderColor: '#A1F360' },
                          '&.Mui-focused fieldset': { borderColor: '#A1F360' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#A1F360' }
                      }}
                    />
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#A1F360' },
                        '&.Mui-focused fieldset': { borderColor: '#A1F360' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#A1F360' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#999' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    sx={{ 
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '&:hover fieldset': { borderColor: '#A1F360' },
                        '&.Mui-focused fieldset': { borderColor: '#A1F360' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#A1F360' }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#999' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#999' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  {message && (
                    <Box sx={{ p: 2, mb: 3, backgroundColor: '#e8f5e8', border: '1px solid #c8e6c9' }}>
                      <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                        {message}
                      </Typography>
                    </Box>
                  )}
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    endIcon={<ChevronRight />}
                    sx={{
                      py: 2,
                      backgroundColor: '#A1F360',
                      color: '#2c2c2c',
                      fontWeight: 500,
                      fontSize: '1rem',
                      borderRadius: 0,
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#8FE040' },
                      '&:disabled': { backgroundColor: '#f0f0f0', color: '#999' }
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Box>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Login;