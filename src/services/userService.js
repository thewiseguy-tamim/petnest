// src/services/userService.js
import apiClient from './api';

const userService = {
  // Get all users (admin)
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/admin/users/', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch users');
    }
  },

  // Get user details (admin)
  getUserDetails: async (userId) => {
    if (!userId) throw new Error('User ID is required');
    try {
      const response = await apiClient.get(`/users/admin/users/${userId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch user details');
    }
  },

  // Delete user (admin)
  deleteUser: async (userId) => {
    if (!userId) throw new Error('User ID is required');
    try {
      const response = await apiClient.delete(`/users/admin/users/${userId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete user');
    }
  },

  // Approve/reject user verification (admin)
  updateVerificationStatus: async (userId, status, notes = '') => {
    if (!userId) throw new Error('User ID is required for verification action');
    if (!['approved', 'rejected'].includes(status)) throw new Error('Invalid verification status');
    try {
      const response = await apiClient.post(`/users/admin/users/${userId}/approve/`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update verification status');
    }
  },

  // Update user role (admin)
  updateUserRole: async (userId, role) => {
    if (!userId) throw new Error('User ID is required');
    try {
      const response = await apiClient.post(`/users/admin/users/${userId}/role/`, {
        role,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update user role');
    }
  },

  // Get verification requests (moderator/admin)
  getVerificationRequests: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/admin/verification-requests/', { params });
      console.log('Verification requests response:', JSON.stringify(response.data, null, 2)); // Debug log
      // Validate that each request has a user ID
      if (Array.isArray(response.data)) {
        response.data.forEach((request, index) => {
          if (!request.user) {
            console.warn(`Missing user ID in verification request at index ${index}`, request);
          }
        });
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch verification requests');
    }
  },

  // Get posts (moderator/admin)
  getAdminPosts: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/admin/posts/', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch posts');
    }
  },

  // Get post details (moderator/admin)
  getAdminPostDetails: async (postId) => {
    if (!postId) throw new Error('Post ID is required');
    try {
      const response = await apiClient.get(`/users/admin/posts/${postId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch post details');
    }
  },

  // Delete post (moderator/admin)
  deletePost: async (postId) => {
    if (!postId) throw new Error('Post ID is required');
    try {
      const response = await apiClient.delete(`/users/admin/posts/${postId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete post');
    }
  },

  // Get user posts
  getUserPosts: async () => {
    try {
      const response = await apiClient.get('/users/posts/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch user posts');
    }
  },

  // Create post
  createPost: async (petId) => {
    if (!petId) throw new Error('Pet ID is required');
    try {
      const response = await apiClient.post('/users/posts/create/', { pet: petId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create post');
    }
  },
};

export default userService;