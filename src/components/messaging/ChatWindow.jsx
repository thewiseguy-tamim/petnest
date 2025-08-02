// src/components/messaging/ChatWindow.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, Send } from 'lucide-react';
import messageService from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const ChatWindow = ({ conversation, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [lastFetched, setLastFetched] = useState(Date.now());

  const fetchMessages = useCallback(async () => {
    if (!conversation.pet?.id) {
      console.error('[ChatWindow] Invalid pet ID:', conversation);
      toast.error('Cannot load conversation: Invalid pet data');
      return;
    }
    try {
      const data = await messageService.getConversation(conversation.other_user.id, conversation.pet.id);
      console.log('[ChatWindow] Fetched messages:', data);
      setMessages(data);

      const hasUnread = data.some(m => !m.is_read && m.sender.id !== user.id);
      if (hasUnread) {
        await messageService.markAsRead(conversation.other_user.id, conversation.pet.id);
      }
    } catch (error) {
      console.error('[ChatWindow] Error fetching messages:', error.response?.data || error.message);
    }
    setLastFetched(Date.now());
  }, [conversation.other_user.id, conversation.pet?.id, user.id]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      if (Date.now() - lastFetched >= 10000) {
        fetchMessages();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages, lastFetched]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation.pet?.id) {
      toast.error('Cannot send message: Invalid input or pet data');
      return;
    }

    try {
      await messageService.sendMessage({
        receiver: conversation.other_user.username,
        pet: conversation.pet.id,
        content: newMessage,
      });
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('[ChatWindow] Error sending message:', error.response?.data || error.message);
      toast.error('Failed to send message');
    }
  };

  if (!conversation.pet?.id) {
    return null; // Don't render if pet.id is missing
  }

  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-96 bg-white shadow-lg rounded-t-lg">
      <div className="flex justify-between items-center p-4 bg-[#FFCAB0] text-white rounded-t-lg">
        <h3 className="font-semibold">
          {conversation.other_user.username} - {conversation.pet.name}
        </h3>
        <button onClick={onClose} className="hover:text-gray-200">
          <X size={20} />
        </button>
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
  );
};

export default ChatWindow;