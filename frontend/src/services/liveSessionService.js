import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const liveSessionService = {
  getModuleSessions: (moduleId) => api.get(`/live-sessions/module/${moduleId}`),
  getUpcomingSessions: () => api.get('/live-sessions/upcoming'),
  getSession: (sessionId) => api.get(`/live-sessions/${sessionId}`),
  joinSession: (sessionId) => api.post(`/live-sessions/${sessionId}/join`),
  leaveSession: (sessionId) => api.post(`/live-sessions/${sessionId}/leave`),
  createSession: (data) => api.post('/live-sessions', data),
  getAttendance: (sessionId) => api.get(`/live-sessions/${sessionId}/attendance`),
};