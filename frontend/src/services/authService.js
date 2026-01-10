import api from '../config/axios';

export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

login: async (credentials) => {
  try {
    const loginPayload = {
      email: credentials.email || credentials.username, 
      password: credentials.password
    };
    
    const response = await api.post('/api/auth/login', loginPayload);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  } catch (error) {

    const errorData = error.response?.data;
    let errorMessage = 'Login failed';
    
    if (errorData) {
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.errors) {
        errorMessage = errorData.errors.map(e => e.message || e).join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    const loginError = new Error(errorMessage);
    loginError.response = error.response;
    throw loginError;
  }
},

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get('/api/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

