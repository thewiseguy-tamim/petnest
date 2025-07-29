// src/services/authService.js
import apiClient from './api';

const authService = {
  // Register new user
  register: (userData) =>
    apiClient.post('/users/register/', userData).then((res) => res.data),

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/users/login/', credentials);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Get current user profile
  getProfile: () => apiClient.get('/users/profile/').then((res) => res.data),

  // Get user status
  getUserStatus: () => apiClient.get('/users/status/').then((res) => res.data),

  // Update user profile
  updateProfile: (profileData) => {
    const formData = new FormData();
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });

    return apiClient
      .patch('/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  // Request password reset
  requestPasswordReset: (email) =>
    apiClient.post('/users/password/reset/', { email }).then((res) => res.data),

  // Confirm password reset
  confirmPasswordReset: (token, newPassword) =>
    apiClient
      .post('/users/password/reset/confirm/', {
        token,
        new_password: newPassword,
      })
      .then((res) => res.data),

  // Change password
  changePassword: (oldPassword, newPassword) =>
    apiClient
      .post('/users/password/change/', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      .then((res) => res.data),

  // Submit verification request
  submitVerification: (verificationData) => {
    const formData = new FormData();
    Object.keys(verificationData).forEach((key) => {
      formData.append(key, verificationData[key]);
    });

    return apiClient
      .post('/users/verification/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
};

export default authService;