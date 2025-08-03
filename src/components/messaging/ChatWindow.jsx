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
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!user) {
      console.log('[ChatWindow] User not loaded yet, waiting...');
      return;
    }

    if (!conversation?.other_user?.id || !conversation?.pet?.id) {
      console.error('[ChatWindow] Missing conversation data:', conversation);
      setMessages([]);
      setLoading(false);
      return;
    }

    // Convert IDs to strings to ensure consistency
    const otherUserId = String(conversation.other_user.id);
    const petId = String(conversation.pet.id);

    console.log('[ChatWindow] fetchMessages called');
    console.log('  - otherUserId:', otherUserId);
    console.log('  - petId:', petId);
    console.log('  - current user ID:', user?.id);

    try {
      // Call the API with the correct parameters
      const messagesData = await messageService.getConversation(otherUserId, petId);
      console.log('[ChatWindow] Messages fetched:', messagesData);
      
      // Ensure we have an array
      const messagesArray = Array.isArray(messagesData) ? messagesData : [];
      setMessages(messagesArray);

      // Mark unread messages as read
      const hasUnread = messagesArray.some((m) => !m.is_read && m.sender.id !== user.id);
      if (hasUnread) {
        try {
          await messageService.markAsRead(otherUserId, petId);
        } catch (markReadError) {
          console.warn('[ChatWindow] Failed to mark as read:', markReadError);
        }
      }
    } catch (error) {
      console.error('[ChatWindow] Error fetching messages:', error);
      console.error('[ChatWindow] Error details:', error.response?.data || error.message);
      
      // If it's a 404, it means no messages exist yet - that's okay
      if (error.response?.status === 404) {
        setMessages([]);
      } 
    } finally {
      setLoading(false);
    }
  }, [conversation, user]);

  // Initial fetch when component mounts or user/conversation changes
  useEffect(() => {
    if (user && conversation) {
      console.log('[ChatWindow] Initial fetch triggered');
      fetchMessages();
    }
  }, [user, conversation, fetchMessages]);

  // Polling for new messages
  useEffect(() => {
    if (!user || !conversation) return;

    const interval = setInterval(() => {
      console.log('[ChatWindow] Polling for new messages');
      fetchMessages();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchMessages, user, conversation]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (content) => {
    if (!content.trim()) {
      return;
    }

    const receiverUsername = conversation?.other_user?.username;
    const petId = conversation?.pet?.id;

    if (!receiverUsername || !petId) {
      toast.error('Cannot send message: Invalid conversation data');
      return;
    }

    try {
      console.log('[ChatWindow] Sending message...');
      await messageService.sendMessage({
        receiver: receiverUsername,
        pet: parseInt(petId),
        content: content,
      });

      console.log('[ChatWindow] Message sent, refreshing...');
      await fetchMessages();
    } catch (error) {
      console.error('[ChatWindow] Error sending message:', error.response?.data || error.message);
      toast.error('Failed to send message');
    }
  };

  const petName = conversation?.pet?.name || 'Unknown Pet';
  const otherUsername = conversation?.other_user?.username || 'Unknown User';

  if (!conversation?.other_user?.id || !conversation?.pet?.id) {
    return (
      <div className="fixed bottom-0 right-4 w-96 h-[600px] bg-white shadow-2xl rounded-t-lg flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Invalid conversation data</div>
        </div>
      </div>
    );
  }

  console.log('[ChatWindow] Render - messages:', messages.length, 'loading:', loading);

  return (
    <div className="fixed bottom-0 right-4 w-96 h-[600px] bg-white shadow-2xl rounded-t-lg flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-[#dee2e6] rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {otherUsername.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{petName}</h3>
              <p className="text-xs text-gray-600">{otherUsername}</p>
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