import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, Button, Box, TextField, Alert, Switch, FormControlLabel } from '@mui/material';
import { LocationOn, QrCodeScanner, CheckCircle, Wifi } from '@mui/icons-material';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

function SecureAttendance() {
  const [location, setLocation] = useState(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isInstructor, setIsInstructor] = useState(false);
  const [isOnlineStudent, setIsOnlineStudent] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          toast.error('Location access required for attendance');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error('Geolocation not supported by this browser');
    }
  };

  const startAttendanceSession = async () => {
    if (!location) {
      toast.error('Location required to start session');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/secure-attendance/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 100 // 100 meter radius
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Generate QR code
        const qrUrl = await QRCode.toDataURL(data.qrCodeData);
        setQrCodeUrl(qrUrl);
        setAttendanceCode(data.attendanceCode);
        toast.success('Attendance session started');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to start attendance session');
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async () => {
    if (!isOnlineStudent && !location) {
      toast.error('Location required for in-person check-in');
      return;
    }

    if (!attendanceCode || !sessionId) {
      toast.error('Please enter attendance code and session ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/secure-attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          sessionId,
          attendanceCode,
          latitude: location?.latitude,
          longitude: location?.longitude,
          isOnline: isOnlineStudent
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Secure Attendance
      </Typography>

      {/* Location Status */}
      <Alert 
        severity={location ? 'success' : isOnlineStudent ? 'info' : 'warning'} 
        icon={isOnlineStudent ? <Wifi /> : <LocationOn />}
        sx={{ mb: 3 }}
      >
        {isOnlineStudent 
          ? 'Online attendance mode - location verification disabled'
          : location 
            ? `Location detected: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
            : 'Location access required for in-person attendance verification'
        }
      </Alert>

      {/* Instructor Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Instructor: Start Attendance Session
          </Typography>
          
          <TextField
            fullWidth
            label="Session ID"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            onClick={startAttendanceSession}
            disabled={loading || !location}
            sx={{ mb: 2 }}
          >
            Start Attendance Session
          </Button>

          {qrCodeUrl && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                QR Code for Students
              </Typography>
              <img src={qrCodeUrl} alt="Attendance QR Code" style={{ maxWidth: '200px' }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Code: {attendanceCode}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Expires in 10 minutes
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Student Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Student: Check In
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={isOnlineStudent}
                onChange={(e) => setIsOnlineStudent(e.target.checked)}
                color="primary"
              />
            }
            label="Online Student (Outside Town)"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Session ID"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Attendance Code"
            value={attendanceCode}
            onChange={(e) => setAttendanceCode(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Enter code from QR or instructor"
          />
          
          <Button
            variant="contained"
            color="success"
            onClick={checkIn}
            disabled={loading || (!isOnlineStudent && !location)}
            startIcon={isOnlineStudent ? <Wifi /> : <CheckCircle />}
            fullWidth
          >
            Check In {isOnlineStudent ? '(Online)' : '(In Person)'}
          </Button>
        </CardContent>
      </Card>

      {/* Security Features Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Anti-Cheating Security Features:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>📍 Location verification (in-person students within 100m)</li>
          <li>🌐 Online mode for remote students (outside town)</li>
          <li>⏰ Time-limited codes (expire in 10 minutes)</li>
          <li>🔒 Unique codes per session</li>
          <li>📱 Device tracking and IP logging</li>
          <li>🚫 Prevents duplicate check-ins</li>
          <li>📊 Real-time instructor monitoring</li>
          <li>🏷️ Attendance type tracking (in-person vs online)</li>
        </Typography>
      </Box>
    </Container>
  );
}

export default SecureAttendance;