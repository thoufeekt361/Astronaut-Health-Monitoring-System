import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercept requests to attach JWT bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cosmic_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('cosmic_token');
        localStorage.removeItem('cosmic_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
