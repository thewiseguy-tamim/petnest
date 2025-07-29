// src/services/userService.js
import apiClient from './api';

const userService = {
  // Get all users (admin)
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/users/admin/users/', { params });
    return response.data;
  },

  // Get user details (admin)
  getUserDetails: async (userId) => {
    const response = await apiClient.get(`/users/admin/users/${userId}/`);
    return response.data;
  },

  // Delete user (admin)
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/users/admin/users/${userId}/`);
    return response.data;
  },

  // Approve/reject user verification (admin)
  updateVerificationStatus: async (userId, status, notes = '') => {
    const response = await apiClient.post(`/users/admin/users/${userId}/approve/`, {
      status,
      notes,
    });
    return response.data;
  },

  // Update user role (admin)
  updateUserRole: async (userId, role) => {
    const response = await apiClient.post(`/users/admin/users/${userId}/role/`, {
      role,
    });
    return response.data;
  },

  // Get verification requests (moderator/admin)
  getVerificationRequests: async (params = {}) => {
    const response = await apiClient.get('/users/admin/verification-requests/', { params });
    return response.data;
  },

  // Get posts (moderator/admin)
  getAdminPosts: async (params = {}) => {
    const response = await apiClient.get('/users/admin/posts/', { params });
    return response.data;
  },

  // Get post details (moderator/admin)
  getAdminPostDetails: async (postId) => {
    const response = await apiClient.get(`/users/admin/posts/${postId}/`);
    return response.data;
  },

  // Delete post (moderator/admin)
  deletePost: async (postId) => {
    const response = await apiClient.delete(`/users/admin/posts/${postId}/`);
    return response.data;
  },

  // Get user posts
  getUserPosts: async () => {
    const response = await apiClient.get('/users/posts/');
    return response.data;
  },

  // Create post
  createPost: async (petId) => {
    const response = await apiClient.post('/users/posts/create/', { pet: petId });
    return response.data;
  },
};

export default userService;