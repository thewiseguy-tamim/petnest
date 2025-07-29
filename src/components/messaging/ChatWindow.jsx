// src/components/messaging/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Minimize2 } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import messageService from '../../services/messageService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';

const ChatWindow = ({ conversation, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef(null);
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const markMessagesAsRead = React.useCallback(async () => {
    if (!conversation) return;
    try {
      await messageService.markAsRead(
        conversation.other_user.id,
        conversation.pet.id
      );
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [conversation]);

  const fetchMessages = React.useCallback(async () => {
    setLoading(true);
    setConnectionError(false);
    try {
      // Only fetch messages if it's an existing conversation
      if (conversation?.latest_message) {
        const data = await messageService.getConversation(
          conversation.other_user.id,
          conversation.pet.id
        );
        setMessages(Array.isArray(data) ? data : []);
        markMessagesAsRead();
      } else {
        // New conversation, no messages yet
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      // If error is 404, it means no messages exist yet
      if (error.response?.status === 404) {
        setMessages([]);
      } else {
        setConnectionError(true);
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Failed to load messages. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [conversation, addNotification, markMessagesAsRead]);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
    }
  }, [conversation, fetchMessages]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content) => {
    if (!content.trim() || sending) return;

    const tempMessage = {
      id: Date.now(), // Temporary ID
      content: content.trim(),
      sender: user,
      timestamp: new Date().toISOString(),
      temporary: true
    };

    // Optimistically add message to UI
    setMessages(prev => [...prev, tempMessage]);
    setSending(true);

    try {
      const newMessage = await messageService.sendMessage({
        receiver: conversation.other_user.username,
        pet: conversation.pet.id,
        content: content.trim(),
      });
      
      // Replace temporary message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.temporary && msg.content === content.trim() 
            ? newMessage 
            : msg
        ).filter(msg => !msg.temporary || msg.id === newMessage.id)
      );
      
      // Show notification for first message
      if (messages.length === 0) {
        addNotification({
          type: 'success',
          title: 'Message Sent',
          message: `Started conversation with ${conversation.other_user.username} about ${conversation.pet.name}`,
        });
      }
    } catch (error) {
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => !msg.temporary));
      
      addNotification({
        type: 'error',
        title: 'Message Failed',
        message: 'Failed to send message. Please try again.',
      });
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRetry = () => {
    fetchMessages();
  };

  if (!conversation) return null;

  return (
    <div className={`fixed bottom-0 right-4 w-96 bg-white rounded-t-lg shadow-xl border border-gray-200 flex flex-col z-50 transition-all duration-300 ${
      isMinimized ? 'h-14' : 'h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FFCAB0] to-[#FFB090] rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {conversation.other_user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.other_user.username}</h3>
            <p className="text-xs text-gray-500">About: {conversation.pet_detail?.name || conversation.pet.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages and Input - Hidden when minimized */}
      {!isMinimized && (
        <>
          {/* Connection Error Banner */}
          {connectionError && (
            <div className="bg-red-50 border-b border-red-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-red-600 text-sm">Connection error occurred</p>
                <button
                  onClick={handleRetry}
                  className="text-red-600 text-sm font-medium hover:text-red-800"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <MessageList messages={messages} loading={loading} />
          <div ref={messagesEndRef} />

          {/* Input */}
          <MessageInput onSend={sendMessage} disabled={sending || connectionError} />
        </>
      )}
    </div>
  );
};

export default ChatWindow;