import api from './api';

const authService = {
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await api.post('/users/login/', credentials);
      
      // The API returns JWT token pair
      const { access, refresh } = response.data;
      
      if (access) {
        localStorage.setItem('access_token', access);
      }
      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      throw error;
    }
  },

  register: async (userData) => {
    try {
      // API expects: username, email, password (min 8 chars)
      const response = await api.post('/users/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getProfile: async () => {
    try {
      const response = await api.get('/users/profile/');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  getUserStatus: async () => {
    try {
      const response = await api.get('/users/status/');
      return response.data;
    } catch (error) {
      console.error('Failed to get user status:', error);
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      // API expects: username, phone (optional), address (optional), 
      // city (optional), state (optional), postcode (optional), profile_picture (optional)
      const response = await api.put('/users/profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      // API expects: old_password, new_password (min 8 chars)
      const response = await api.post('/users/password/change/', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      // API expects: email
      const response = await api.post('/users/password/reset/', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      // API expects: token, new_password (min 8 chars)
      const response = await api.post('/users/password/reset/confirm/', {
        token,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Additional method for verification requests
  submitVerification: async (verificationData) => {
    try {
      // API expects: nid_number, nid_front, nid_back, phone, address, city, state, postcode
      const response = await api.post('/users/verification/', verificationData);
      return response.data;
    } catch (error) {
      console.error('Submit verification error:', error);
      throw error;
    }
  }
};

export default authService;