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

export const discussionService = {
  getModuleDiscussions: (moduleId) => api.get(`/discussions/module/${moduleId}`),
  getDiscussion: (discussionId) => api.get(`/discussions/${discussionId}`),
  createDiscussion: (data) => api.post('/discussions', data),
  createPost: (discussionId, data) => api.post(`/discussions/${discussionId}/posts`, data),
};