import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Amplify } from 'aws-amplify';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import AttendanceTracker from './pages/AttendanceTracker';
import Reports from './pages/Reports';
import SecureAttendance from './pages/SecureAttendance';
import InstructorOnboarding from './pages/InstructorOnboarding';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
      region: process.env.REACT_APP_AWS_REGION,
    }
  }
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#A1F360', // Sulu Green - House on the Rock brand color
      light: '#B8F584',
      dark: '#7EE03A',
      contrastText: '#000000',
    },
    secondary: {
      main: '#2C2C2C', // Dark Gray - Complementary color
      light: '#666666',
      dark: '#1A1A1A',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#666666',
    },
    success: {
      main: '#A1F360',
    },
    error: {
      main: '#D32F2F',
    },
  },
  typography: {
    fontFamily: '"League Spartan", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '3rem',
      color: '#2C2C2C',
    },
    h4: {
      fontWeight: 400,
      fontSize: '2rem',
      color: '#2C2C2C',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: '#2C2C2C',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          fontWeight: 500,
        },
        contained: {
          backgroundColor: '#A1F360',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#7EE03A',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(161,243,96,0.15)',
          borderRadius: 8,
          border: '1px solid #F0F0F0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#2C2C2C',
          boxShadow: '0 1px 3px rgba(161,243,96,0.1)',
        },
      },
    },
  },
});

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}

function AppContent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/instructor-onboarding" element={<InstructorOnboarding />} />
        <Route path="/" element={
          user ? (
            <>
              <Navbar />
              <Dashboard />
            </>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/courses" element={
          <ProtectedRoute>
            <Navbar />
            <Courses />
          </ProtectedRoute>
        } />
        <Route path="/courses/:courseId" element={
          <ProtectedRoute>
            <Navbar />
            <CourseDetail />
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute>
            <Navbar />
            <SecureAttendance />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            {(user?.role === 'instructor' || user?.role === 'admin') ? (
              <>
                <Navbar />
                <Reports />
              </>
            ) : (
              <Navigate to="/" />
            )}
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;