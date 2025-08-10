import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Edit, Pin, RefreshCw, MessageSquare } from 'lucide-react';
import messageService from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';

const ConversationsList = () => {
  const { user: _user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);     // only for first load
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // StrictMode / dedupe helpers
  const mountedRef = useRef(false);
  const intervalRef = useRef(null);
  const inFlightRef = useRef(false);
  const lastSigRef = useRef('');

  // Normalize conversation shape (keeps UUIDs as strings)
  const normalizeConversation = (c) => {
    const petObj =
      (typeof c.pet === 'object' && c.pet) ? c.pet :
      c.pet_detail ? { id: c.pet_detail.id, name: c.pet_detail.name } :
      (typeof c.pet === 'number') ? { id: c.pet, name: c.pet_detail?.name || '' } :
      null;

    let otherId = null;
    let otherUsername = '';

    if (c.other_user && typeof c.other_user === 'object') {
      otherId = c.other_user.id ?? c.other_user.pk ?? null;
      otherUsername = c.other_user.username || c.other_user.name || '';
    } else if (c.user && typeof c.user === 'object') {
      otherId = c.user.id ?? c.user.pk ?? null;
      otherUsername = c.user.username || c.user.name || '';
    } else if (typeof c.other_user === 'string' || typeof c.other_user === 'number') {
      otherId = c.other_user;
    } else if (typeof c.user === 'string' || typeof c.user === 'number') {
      otherId = c.user;
    }

    return {
      ...c,
      other_user: {
        id: otherId != null ? String(otherId) : null, // keep as string (UUID-friendly)
        username: otherUsername,
      },
      pet: petObj,
    };
  };

  const buildSignature = (list) =>
    list
      .map((c) => {
        const ou = c.other_user?.id ?? '';
        const pid = c.pet?.id ?? '';
        const lmId = c.latest_message?.id ?? '';
        const lmTs = c.latest_message?.timestamp ?? '';
        const uc = c.unread_count ?? 0;
        return `${ou}|${pid}|${lmId}|${lmTs}|${uc}`;
      })
      .join(',');

  const fetchConversations = useCallback(async (opts = { initial: false }) => {
    if (inFlightRef.current) return; // dedupe concurrent calls (StrictMode/poll)
    inFlightRef.current = true;

    try {
      if (opts.initial) setLoading(true);
      setError(null);

      const data = await messageService.getConversations();
      const array = Array.isArray(data) ? data : [];
      const normalized = array.map(normalizeConversation);

      // Skip state update if nothing changed
      const sig = buildSignature(normalized);
      if (sig !== lastSigRef.current) {
        lastSigRef.current = sig;
        setConversations(normalized);
      }
    } catch (error) {
      // Keep previous list; just show error
      const status = error?.response?.status;
      const detail =
        typeof error?.response?.data === 'string'
          ? error.response.data
          : error?.response?.data?.detail || error?.message || 'Unknown error';
      console.error('[ConversationsList] Error fetching conversations:', detail);
      setError(status ? `Server error (${status}).` : 'Network error. Please check your connection.');
    } finally {
      if (opts.initial) setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  // Run once on mount (StrictMode-safe)
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    fetchConversations({ initial: true });
  }, [fetchConversations]);

  // Poll every 10s only if there is no error. StrictMode-safe interval management.
  useEffect(() => {
    if (error) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalRef.current = setInterval(() => fetchConversations(), 10000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [error, fetchConversations]);

  const lastConversation = useMemo(() => {
    try {
      const raw = localStorage.getItem('lastConversation');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const handleRetry = () => {
    setError(null);
    fetchConversations({ initial: false });
  };

  const handleOpenLastChat = () => {
    if (!lastConversation?.other_user?.id || !lastConversation?.pet?.id) return;
    navigate(`/messages/${lastConversation.other_user.id}/${lastConversation.pet.id}`);
  };

  const filteredConversations = conversations.filter((conv) => {
    const username = conv.other_user?.username?.toLowerCase() || '';
    const petName = conv.pet?.name?.toLowerCase() || '';
    return (
      username.includes(searchQuery.toLowerCase()) ||
      petName.includes(searchQuery.toLowerCase())
    );
  });

  // Loading UI (first load only)
  if (loading) {
    return (
      <div className="w-80 bg-[#f8f9fa] h-full border-r border-[#dee2e6] flex items-center justify-center">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  // Error UI with fallback to last conversation
  if (error) {
    return (
      <div className="w-80 bg-[#f8f9fa] h-full border-r border-[#dee2e6] flex flex-col">
        <div className="p-4 border-b border-[#dee2e6]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" onClick={handleRetry}>
              <RefreshCw size={20} className="text-gray-600" />
            </button>
          </div>
          <div className="text-sm text-red-600">
            Unable to load conversations. {error}
          </div>

          <div className="mt-3 flex flex-col space-y-2">
            <button
              onClick={handleRetry}
              className="w-full py-2 text-sm bg-[#007bff] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>

            {lastConversation?.other_user?.id && lastConversation?.pet?.id && (
              <button
                onClick={handleOpenLastChat}
                className="w-full py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageSquare size={16} />
                <span>Open last chat</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center text-gray-500">
          {lastConversation?.other_user?.id && lastConversation?.pet?.id
            ? 'You can still open your last chat while the server recovers.'
            : 'We’ll retry when you press the button.'}
        </div>
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
            {searchQuery ? 'No conversations found' : (
              <div className="flex flex-col items-center space-y-3">
                <div>No conversations yet</div>
                {lastConversation?.other_user?.id && lastConversation?.pet?.id && (
                  <button
                    onClick={handleOpenLastChat}
                    className="inline-flex items-center space-x-2 px-3 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <MessageSquare size={16} />
                    <span>Open last chat</span>
                  </button>
                )}
              </div>
            )}
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
                const petId = conversation.pet?.id;
                const petName = conversation.pet?.name || 'Unnamed Pet';
                const otherId = conversation.other_user?.id;

                if (!petId || !otherId) {
                  console.warn('[ConversationsList] Skipping conversation with invalid IDs:', conversation);
                  return null;
                }

                const key = conversation.id || `${otherId}-${petId}`;
                const hasUnread = conversation.unread_count > 0;

                return (
                  <Link
                    key={key}
                    to={`/messages/${otherId}/${petId}`}
                    className={`flex items-center px-4 py-3 hover:bg-white transition-colors relative ${hasUnread ? 'bg-white' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-gray-600 font-medium text-sm">
                        {conversation.other_user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <p className={`font-medium text-gray-900 truncate ${hasUnread ? 'font-semibold' : ''}`}>
                          {conversation.other_user?.username || 'Unknown User'}
                        </p>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {conversation.latest_message?.timestamp
                            ? new Date(conversation.latest_message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
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