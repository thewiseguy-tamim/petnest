// src/services/messageService.js
import api from './api'; // Changed from axiosInstance

const messageService = {
  getConversations: async () => {
    try {
      const response = await api.get('/messenger/messages/conversations/');
      console.log('[messageService.getConversations] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[messageService.getConversations] Error:', error.response?.data || error.message);
      throw error;
    }
  },

  checkConversationExists: async (userId, petId) => {
    try {
      const response = await api.get(`/messenger/messages/conversation/${userId}/${petId}/`);
      console.log('[messageService.checkConversationExists] Success:', response.data);
      return response.data.length > 0;
    } catch (error) {
      console.error('[messageService.checkConversationExists] Error:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  getConversation: async (userId, petId) => {
    try {
      const response = await api.get(`/messenger/messages/conversation/${userId}/${petId}/`);
      console.log('[messageService.getConversation] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[messageService.getConversation] Error:', error.response?.data || error.message);
      throw error;
    }
  },

  sendMessage: async ({ receiver, pet, content }) => {
    try {
      const response = await api.post('/messenger/messages/send/', {
        receiver,
        pet,
        content,
      });
      console.log('[messageService.sendMessage] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[messageService.sendMessage] Error:', error.response?.data || error.message);
      throw error;
    }
  },

  markAsRead: async (userId, petId) => {
    try {
      const response = await api.put(`/messenger/messages/mark-read/${userId}/${petId}/`);
      console.log('[messageService.markAsRead] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[messageService.markAsRead] Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default messageService;