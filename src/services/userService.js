import apiClient from './api';

const userService = {
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');
      const response = await apiClient.post('/users/token/refresh/', { refresh: refreshToken });
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      return access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw new Error('Session expired. Please log in again.');
    }
  },

  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/admin/users/', { params });
      if (!Array.isArray(response.data)) {
        console.warn('Expected array for users, got:', response.data);
        return [];
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get('/users/admin/users/', { params });
          if (!Array.isArray(retryResponse.data)) {
            console.warn('Expected array for users, got:', retryResponse.data);
            return [];
          }
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin.');
        }
      }
      console.error('getUsers error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch users.');
    }
  },

  getUserDetails: async (userId) => {
    if (!userId) throw new Error('User ID is required');
    try {
      const response = await apiClient.get(`/users/admin/users/${userId}/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get(`/users/admin/users/${userId}/`);
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin.');
        }
      }
      console.error('getUserDetails error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch user details.');
    }
  },

  deleteUser: async (userId) => {
    if (!userId) throw new Error('User ID is required');
    try {
      const response = await apiClient.delete(`/users/admin/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error('deleteUser error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to delete user.');
    }
  },

  updateVerificationStatus: async (userId, status, notes = '') => {
    if (!userId) throw new Error('User ID is required for verification action');
    if (!['approved', 'rejected', 'pending'].includes(status)) throw new Error('Invalid verification status');
    try {
      const response = await apiClient.post(`/users/admin/users/${userId}/approve/`, { status, notes });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.post(`/users/admin/users/${userId}/approve/`, { status, notes });
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin or moderator.');
        }
      }
      console.error('updateVerificationStatus error:', error.message, error.response?.data);
      throw new Error(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.response?.data?.status?.[0] ||
        'Failed to update verification status.'
      );
    }
  },

  updateUserRole: async (userId, role) => {
    if (!userId) throw new Error('User ID is required');
    try {
      const response = await apiClient.post(`/users/admin/users/${userId}/role/`, { role });
      return response.data;
    } catch (error) {
      console.error('updateUserRole error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to update user role.');
    }
  },

  getVerificationRequests: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/admin/verification-requests/', { params });
      if (!Array.isArray(response.data)) {
        console.warn('Expected array for verification requests, got:', response.data);
        return [];
      }
      response.data.forEach((request, index) => {
        if (!request.user?.id) {
          console.warn(`Missing user ID in verification request at index ${index}`, request);
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get('/users/admin/verification-requests/', { params });
          if (!Array.isArray(retryResponse.data)) {
            console.warn('Expected array for verification requests, got:', retryResponse.data);
            return [];
          }
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin or moderator.');
        }
      }
      console.error('getVerificationRequests error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch verification requests.');
    }
  },

  getAdminPosts: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/admin/posts/', { params });
      if (!Array.isArray(response.data)) {
        console.warn('Expected array for posts, got:', response.data);
        return [];
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get('/users/admin/posts/', { params });
          if (!Array.isArray(retryResponse.data)) {
            console.warn('Expected array for posts, got:', retryResponse.data);
            return [];
          }
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin or moderator.');
        }
      }
      console.error('getAdminPosts error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch posts.');
    }
  },

  getAdminPostDetails: async (postId) => {
    if (!postId) throw new Error('Post ID is required');
    try {
      const response = await apiClient.get(`/users/admin/posts/${postId}/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get(`/users/admin/posts/${postId}/`);
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin or moderator.');
        }
      }
      console.error('getAdminPostDetails error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch post details.');
    }
  },

  deletePost: async (postId) => {
    if (!postId) throw new Error('Post ID is required');
    try {
      const response = await apiClient.delete(`/users/admin/posts/${postId}/`);
      return response.data;
    } catch (error) {
      console.error('deletePost error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to delete post.');
    }
  },

  getUserPosts: async () => {
    try {
      const response = await apiClient.get('/users/posts/');
      if (!Array.isArray(response.data)) {
        console.warn('Expected array for user posts, got:', response.data);
        return [];
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get('/users/posts/');
          if (!Array.isArray(retryResponse.data)) {
            console.warn('Expected array for user posts, got:', retryResponse.data);
            return [];
          }
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          throw new Error('Session expired. Please log in again.');
        }
      }
      console.error('getUserPosts error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch user posts.');
    }
  },

  createPost: async (petId) => {
    if (!petId) throw new Error('Pet ID is required');
    try {
      const response = await apiClient.post('/users/posts/create/', { pet: petId });
      return response.data;
    } catch (error) {
      console.error('createPost error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to create post.');
    }
  },
};

export default userService;