import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, Avatar, Divider } from '@mui/material';
import { School, Dashboard, MenuBook, Assignment, BarChart, ExitToApp, Person, MoreVert } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e0e0e0'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <School sx={{ fontSize: 32, color: '#A1F360', mr: 2 }} />
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 300,
                color: '#2c2c2c',
                letterSpacing: '-0.5px'
              }}
            >
              Finding the Rock
            </Typography>
          </Box>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button 
              startIcon={<Dashboard />}
              onClick={() => navigate('/')}
              sx={{ 
                color: '#666', 
                fontWeight: 400,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 0,
                '&:hover': { 
                  backgroundColor: 'rgba(161, 243, 96, 0.1)',
                  color: '#2c2c2c'
                }
              }}
            >
              Dashboard
            </Button>
            <Button 
              startIcon={<MenuBook />}
              onClick={() => navigate('/courses')}
              sx={{ 
                color: '#666', 
                fontWeight: 400,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 0,
                '&:hover': { 
                  backgroundColor: 'rgba(161, 243, 96, 0.1)',
                  color: '#2c2c2c'
                }
              }}
            >
              Courses
            </Button>
            <Button 
              startIcon={<Assignment />}
              onClick={() => navigate('/attendance')}
              sx={{ 
                color: '#666', 
                fontWeight: 400,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 0,
                '&:hover': { 
                  backgroundColor: 'rgba(161, 243, 96, 0.1)',
                  color: '#2c2c2c'
                }
              }}
            >
              Attendance
            </Button>
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <Button 
                startIcon={<BarChart />}
                onClick={() => navigate('/reports')}
                sx={{ 
                  color: '#666', 
                  fontWeight: 400,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 0,
                  '&:hover': { 
                    backgroundColor: 'rgba(161, 243, 96, 0.1)',
                    color: '#2c2c2c'
                  }
                }}
              >
                Reports
              </Button>
            )}
            
            <Divider orientation="vertical" flexItem sx={{ mx: 2, height: 32, alignSelf: 'center' }} />
            
            <IconButton
              onClick={handleMenuOpen}
              sx={{ 
                ml: 1,
                '&:hover': { backgroundColor: 'rgba(161, 243, 96, 0.1)' }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  backgroundColor: '#A1F360',
                  color: '#2c2c2c',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                {getUserInitials()}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: '1px solid #e0e0e0',
                  minWidth: 180
                }
              }}
            >
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                  Signed in as
                </Typography>
                <Typography variant="body1" sx={{ color: '#2c2c2c', fontWeight: 500 }}>
                  {user?.name || user?.email || 'Student'}
                </Typography>
              </Box>
              <MenuItem 
                onClick={() => { handleMenuClose(); /* navigate to profile */ }}
                sx={{ py: 1.5, '&:hover': { backgroundColor: 'rgba(161, 243, 96, 0.1)' } }}
              >
                <Person sx={{ mr: 2, color: '#666' }} />
                Profile
              </MenuItem>
              <MenuItem 
                onClick={() => { handleMenuClose(); handleSignOut(); }}
                sx={{ py: 1.5, '&:hover': { backgroundColor: 'rgba(161, 243, 96, 0.1)' } }}
              >
                <ExitToApp sx={{ mr: 2, color: '#666' }} />
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
          
          {/* Mobile Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ color: '#2c2c2c' }}
            >
              <MoreVert />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: '1px solid #e0e0e0',
                  minWidth: 200
                }
              }}
            >
              <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }}>
                <Dashboard sx={{ mr: 2 }} /> Dashboard
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); navigate('/courses'); }}>
                <MenuBook sx={{ mr: 2 }} /> Courses
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); navigate('/attendance'); }}>
                <Assignment sx={{ mr: 2 }} /> Attendance
              </MenuItem>
              {(user?.role === 'instructor' || user?.role === 'admin') && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/reports'); }}>
                  <BarChart sx={{ mr: 2 }} /> Reports
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={() => { handleMenuClose(); handleSignOut(); }}>
                <ExitToApp sx={{ mr: 2 }} /> Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;