import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Video, MoreVertical } from 'lucide-react';
import messageService from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

const ConversationDetail = () => {
  const { userId, petId } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastFetched, setLastFetched] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      
    } finally {
      setLoading(false);
    }
    setLastFetched(Date.now());
  }, [userId, petId, user.id]);

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(() => {
      if (Date.now() - lastFetched >= 10000) {
        fetchConversation();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchConversation, lastFetched]);

  // FIXED: Only scroll to bottom when new messages are added, not on every message change
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (content) => {
    try {
      const receiverUsername = conversation?.other_user?.username;
      if (!receiverUsername || !petId) {
        throw new Error('Invalid conversation data');
      }
      await messageService.sendMessage({
        receiver: receiverUsername,
        pet: parseInt(petId),
        content: content,
      });
      await fetchConversation();
    } catch (error) {
      console.error('[ConversationDetail] Error sending message:', error.response?.data || error.message);
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white h-screen">
        <div className="text-gray-500">Loading conversation...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white h-screen">
        <div className="text-gray-500">Conversation not found</div>
      </div>
    );
  }

  const petName = typeof conversation.pet === 'object' && conversation.pet ? conversation.pet.name : conversation.pet_detail?.name || 'Unnamed Pet';

  return (
    <div className="flex-1 flex flex-col bg-white h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#dee2e6] bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{petName}</h2>
            <p className="text-sm text-gray-600">with {conversation.other_user.username}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages - FIXED: Pass loading state properly */}
      <MessageList messages={messages} loading={false} />
      <div ref={messagesEndRef} />

      {/* Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ConversationDetail;
