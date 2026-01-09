import api from '../config/axios';

export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await api.get('/api/events');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/api/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/api/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  registerForEvent: async (eventId, registrationData) => {
    try {
      const response = await api.post(`/api/events/${eventId}/register`, registrationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEventRegistrations: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}/registrations`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserRegistrations: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/registrations`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

