// src/components/messaging/ConversationsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import messageService from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';

const ConversationsList = () => {
  const { user: _user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(Date.now());

  const fetchConversations = async () => {
    try {
      const data = await messageService.getConversations();
      console.log('[ConversationsList] Fetched conversations:', data);
      setConversations(data);
    } catch (error) {
      console.error('[ConversationsList] Error fetching conversations:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setLastFetched(Date.now());
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      if (Date.now() - lastFetched >= 10000) {
        fetchConversations();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [lastFetched]);

  if (loading) return <div>Loading conversations...</div>;
  if (!conversations.length) return <div>No conversations found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Conversations</h2>
      <div className="space-y-4">
        {conversations.map((conversation) => {
          // Handle pet as number or object
          const petId = typeof conversation.pet === 'object' && conversation.pet ? conversation.pet.id : conversation.pet;
          const petName = typeof conversation.pet === 'object' && conversation.pet ? conversation.pet.name : conversation.pet_detail?.name || 'Unnamed Pet';

          if (!petId) {
            console.warn('[ConversationsList] Skipping conversation with invalid pet ID:', conversation);
            return null;
          }

          const key = conversation.id || `${conversation.other_user.id}-${petId}`;
          return (
            <Link
              key={key}
              to={`/messages/${conversation.other_user.id}/${petId}`}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                <span className="text-gray-600 font-medium">
                  {conversation.other_user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {conversation.other_user.username || 'Unknown User'}
                </p>
                <p className="text-gray-600">{petName}</p>
                <p className="text-sm text-gray-500">
                  {conversation.latest_message?.content || 'No messages yet'}
                </p>
              </div>
              {conversation.unread_count > 0 && (
                <span className="bg-[#FFCAB0] text-white rounded-full px-2 py-1 text-sm">
                  {conversation.unread_count}
                </span>
              )}
              <MessageCircle size={20} className="ml-4 text-gray-500" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationsList;