// src/services/notificationService.js
import apiClient from './api';

const notificationService = {
  // Get user notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await apiClient.get('/notifications/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark a specific notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read/`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.post('/notifications/mark-all-read/');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete a specific notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  },

  // Clear all notifications
  clearAll: async () => {
    try {
      const response = await apiClient.post('/notifications/clear-all/');
      return response.data;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  },

  // Get user notification preferences
  getPreferences: async () => {
    try {
      const response = await apiClient.get('/notifications/preferences/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await apiClient.patch('/notifications/preferences/', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },
};

export default notificationService;
