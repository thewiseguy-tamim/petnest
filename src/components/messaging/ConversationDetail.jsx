// src/components/messaging/ConversationDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { X, Send } from 'lucide-react';
import messageService from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const ConversationDetail = () => {
  const { userId, petId } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [lastFetched, setLastFetched] = useState(Date.now());

  const fetchConversation = useCallback(async () => {
    try {
      const conversations = await messageService.getConversations();
      const found = conversations.find(
        (c) => {
          const cPetId = typeof c.pet === 'object' && c.pet ? c.pet.id : c.pet;
          return c.other_user.id === userId && cPetId === parseInt(petId);
        }
      );
      if (!found) {
        throw new Error('Conversation not found');
      }
      setConversation(found);
      const messagesData = await messageService.getConversation(userId, petId);
      setMessages(messagesData);

      const hasUnread = messagesData.some((m) => !m.is_read && m.sender.id !== user.id);
      if (hasUnread) {
        await messageService.markAsRead(userId, petId);
      }
    } catch (error) {
      console.error('[ConversationDetail] Error:', error.response?.data || error.message);
      toast.error('Failed to load conversation');
    }
    setLastFetched(Date.now());
  }, [userId, petId, user.id]); // Added user.id to dependencies

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(() => {
      if (Date.now() - lastFetched >= 10000) {
        fetchConversation();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchConversation, lastFetched]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const receiverUsername = conversation?.other_user?.username;
      if (!receiverUsername || !petId) {
        throw new Error('Invalid conversation data');
      }
      await messageService.sendMessage({
        receiver: receiverUsername,
        pet: parseInt(petId),
        content: newMessage,
      });
      setNewMessage('');
      await fetchConversation();
    } catch (error) {
      console.error('[ConversationDetail] Error sending message:', error.response?.data || error.message);
      toast.error('Failed to send message');
    }
  };

  if (!conversation) {
    return <div>Loading conversation...</div>;
  }

  const petName = typeof conversation.pet === 'object' && conversation.pet ? conversation.pet.name : conversation.pet_detail?.name || 'Unnamed Pet';

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {conversation.other_user.username} - {petName}
          </h2>
        </div>
        <div className="h-96 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.sender.id === user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  message.sender.id === user.id
                    ? 'bg-[#FFCAB0] text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCAB0]"
            />
            <button
              type="submit"
              className="p-2 bg-[#FFCAB0] text-white rounded-lg hover:bg-[#FFB090]"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationDetail;