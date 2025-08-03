import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Pin } from 'lucide-react';
import messageService from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';

const ConversationsList = () => {
  const { user: _user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredConversations = conversations.filter(conv => {
    const username = conv.other_user.username?.toLowerCase() || '';
    const petName = (typeof conv.pet === 'object' && conv.pet ? conv.pet.name : conv.pet_detail?.name || '').toLowerCase();
    return username.includes(searchQuery.toLowerCase()) || petName.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="w-80 bg-[#f8f9fa] h-full border-r border-[#dee2e6] flex items-center justify-center">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#f8f9fa] h-full border-r border-[#dee2e6] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#dee2e6]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <Edit size={20} className="text-gray-600" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#007bff] focus:ring-1 focus:ring-[#007bff] text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div>
            {/* Pinned Section (placeholder) */}
            <div className="px-4 py-2 flex items-center text-xs font-medium text-gray-600">
              <Pin size={14} className="mr-1" />
              PINNED
            </div>
            
            {/* Conversations */}
            <div>
              {filteredConversations.map((conversation) => {
                const petId = typeof conversation.pet === 'object' && conversation.pet ? conversation.pet.id : conversation.pet;
                const petName = typeof conversation.pet === 'object' && conversation.pet ? conversation.pet.name : conversation.pet_detail?.name || 'Unnamed Pet';

                if (!petId) {
                  console.warn('[ConversationsList] Skipping conversation with invalid pet ID:', conversation);
                  return null;
                }

                const key = conversation.id || `${conversation.other_user.id}-${petId}`;
                const hasUnread = conversation.unread_count > 0;
                
                return (
                  <Link
                    key={key}
                    to={`/messages/${conversation.other_user.id}/${petId}`}
                    className={`flex items-center px-4 py-3 hover:bg-white transition-colors relative ${
                      hasUnread ? 'bg-white' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-gray-600 font-medium text-sm">
                        {conversation.other_user.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <p className={`font-medium text-gray-900 truncate ${hasUnread ? 'font-semibold' : ''}`}>
                          {conversation.other_user.username || 'Unknown User'}
                        </p>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {conversation.latest_message?.timestamp ? 
                            new Date(conversation.latest_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{petName}</p>
                      <p className={`text-sm truncate ${hasUnread ? 'text-gray-900' : 'text-gray-500'}`}>
                        {conversation.latest_message?.content || 'No messages yet'}
                      </p>
                    </div>
                    
                    {/* Unread Badge */}
                    {hasUnread && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-[#dc3545] rounded-full">
                          {conversation.unread_count}
                        </span>
                      </div>
                    )}
                    
                    {/* Online Indicator */}
                    <div className="absolute bottom-3 left-11 w-3 h-3 bg-[#28a745] rounded-full border-2 border-[#f8f9fa]"></div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;