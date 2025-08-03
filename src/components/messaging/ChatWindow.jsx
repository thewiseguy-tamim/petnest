import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Phone, Video, MoreVertical } from 'lucide-react';
import messageService from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

const ChatWindow = ({ conversation, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [lastFetched, setLastFetched] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    } finally {
      setLoading(false);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content) => {
    if (!conversation.pet?.id) {
      toast.error('Cannot send message: Invalid pet data');
      return;
    }

    try {
      await messageService.sendMessage({
        receiver: conversation.other_user.username,
        pet: conversation.pet.id,
        content: content,
      });
      await fetchMessages();
    } catch (error) {
      console.error('[ChatWindow] Error sending message:', error.response?.data || error.message);
      toast.error('Failed to send message');
    }
  };

  if (!conversation.pet?.id) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-4 w-96 h-[600px] bg-white shadow-2xl rounded-t-lg flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-[#dee2e6] rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {conversation.other_user.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{conversation.pet.name}</h3>
              <p className="text-xs text-gray-600">{conversation.other_user.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
              <Phone size={16} className="text-gray-600" />
            </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
              <Video size={16} className="text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
              <MoreVertical size={16} className="text-gray-600" />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors ml-2">
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} loading={loading} />
      <div ref={messagesEndRef} />

      {/* Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;