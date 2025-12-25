import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getCurrentCourse: () => api.get('/dashboard/current-course'),
  getUpcomingSessions: () => api.get('/dashboard/upcoming-sessions'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};