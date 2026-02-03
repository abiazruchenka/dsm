import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      if (config.url?.includes('/photos/upload')) {
        console.log('Upload request - Token present:', token.substring(0, 20) + '...');
        console.log('Upload request - Headers:', {
          'Authorization': config.headers['Authorization']?.substring(0, 30) + '...',
          'Content-Type': config.headers['Content-Type']
        });
      }
    } else {
      console.warn('No token found in localStorage for request:', config.url);
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('authStateChanged'));
      window.location.href = '/login';
    }
    
    if (!error.response) {
      error.message = 'Network error - please check your connection';
    }
    
    return Promise.reject(error);
  }
);

export default api;

