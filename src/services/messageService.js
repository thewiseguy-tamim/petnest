// src/services/messageService.js
import api from './api'; // Assuming you have a base API service

const messageService = {
  // Get all conversations for the current user
  async getConversations() {
    try {
      const response = await api.get('/messages/conversations/');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get messages for a specific conversation
  async getConversation(otherUserId, petId) {
    try {
      const response = await api.get(`/messages/conversation/${otherUserId}/${petId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(messageData) {
    try {
      const response = await api.post('/messages/send/', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  async markAsRead(otherUserId, petId) {
    try {
      const response = await api.patch(`/messages/mark-read/${otherUserId}/${petId}/`);
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Note: The following methods are utility functions that would need 
  // corresponding backend endpoints if you want to implement them later
  
  // Get unread message count (would need backend endpoint)
  async getUnreadCount() {
    try {
      // This endpoint doesn't exist in your API, but you can calculate from conversations
      const conversations = await this.getConversations();
      return conversations.reduce((total, conv) => total + conv.unread_count, 0);
    } catch (error) {
      console.error('Error calculating unread count:', error);
      return 0;
    }
  },

  // Check if conversation exists by attempting to fetch it
  async checkConversationExists(otherUserId, petId) {
    try {
      await this.getConversation(otherUserId, petId);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      console.error('Error checking conversation:', error);
      throw error;
    }
  }
};

export default messageService;