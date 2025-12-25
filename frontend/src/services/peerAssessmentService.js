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

export const peerAssessmentService = {
  getModuleTopics: (moduleId) => api.get(`/peer-assessment/module/${moduleId}`),
  getTopic: (topicId) => api.get(`/peer-assessment/${topicId}`),
  submitResponse: (topicId, content) => api.post(`/peer-assessment/${topicId}/submit`, { content }),
  submitReview: (submissionId, data) => api.post(`/peer-assessment/submissions/${submissionId}/review`, data),
  getSubmission: (submissionId) => api.get(`/peer-assessment/submissions/${submissionId}`),
  addResponse: (submissionId, data) => api.post(`/peer-assessment/submissions/${submissionId}/respond`, data),
};