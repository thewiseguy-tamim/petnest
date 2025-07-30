import api from './api';

const messageService = {
  // Get all conversations for the current user
  async getConversations() {
    console.log('[messageService.getConversations] Fetching conversations for user');
    try {
      const response = await api.get('/messenger/conversations/');
      console.log('[messageService.getConversations] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[messageService.getConversations] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
      if (error.response?.status === 404) {
        console.warn('[messageService.getConversations] Conversations endpoint not found. Returning empty array.');
        return [];
      }
      throw error;
    }
  },

  // Get messages for a specific conversation
  async getConversation(otherUserId, petId) {
    console.log(`[messageService.getConversation] Fetching conversation for user: ${otherUserId}, pet: ${petId}`);
    try {
      const response = await api.get(`/messenger/conversation/${otherUserId}/${petId}/`);
      console.log('[messageService.getConversation] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[messageService.getConversation] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
      throw error;
    }
  },

  // Send a message
  async sendMessage(messageData) {
    console.log('[messageService.sendMessage] Sending message with data:', messageData);
    try {
      const response = await api.post('/messenger/send/', messageData);
      console.log('[messageService.sendMessage] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[messageService.sendMessage] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
      throw error;
    }
  },

  // Mark messages as read
  async markAsRead(otherUserId, petId) {
    console.log(`[messageService.markAsRead] Marking messages as read for user: ${otherUserId}, pet: ${petId}`);
    try {
      const response = await api.patch(`/messenger/mark-read/${otherUserId}/${petId}/`);
      console.log('[messageService.markAsRead] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[messageService.markAsRead] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
      throw error;
    }
  },

  // Get unread message count
  async getUnreadCount() {
    console.log('[messageService.getUnreadCount] Calculating unread message count');
    try {
      const conversations = await this.getConversations();
      const count = conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);
      console.log('[messageService.getUnreadCount] Success: Unread count:', count);
      return count;
    } catch (error) {
      console.error('[messageService.getUnreadCount] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return 0;
    }
  },

  // Check if conversation exists
  async checkConversationExists(otherUserId, petId) {
    console.log(`[messageService.checkConversationExists] Checking conversation for user: ${otherUserId}, pet: ${petId}`);
    try {
      await this.getConversation(otherUserId, petId);
      console.log('[messageService.checkConversationExists] Conversation exists');
      return true;
    } catch (error) {
      console.error('[messageService.checkConversationExists] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
      if (error.response?.status === 404) {
        console.log('[messageService.checkConversationExists] Conversation does not exist');
        return false;
      }
      throw error;
    }
  },
};

export default messageService;