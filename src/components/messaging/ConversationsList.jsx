// src/components/messaging/ConversationsList.jsx
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import messageService from '../../services/messageService';
import LoadingSpinner from '../common/LoadingSpinner';

const ConversationsList = ({ onSelectConversation, selectedConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const isSelected = selectedConversation?.id === conversation.id;
        return (
          <div
            key={`${conversation.other_user.id}-${conversation.pet.id}`}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              isSelected ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <img
                src="/api/placeholder/48/48"
                alt={conversation.other_user.username}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {conversation.other_user.username}
                  </h3>
                  {conversation.latest_message && (
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.latest_message.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  About: {conversation.pet_detail.name}
                </p>
                {conversation.latest_message && (
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {conversation.latest_message.content}
                  </p>
                )}
                {conversation.unread_count > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-[#FFCAB0] rounded-full mt-1">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationsList;