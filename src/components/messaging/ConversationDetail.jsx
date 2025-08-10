import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Video, MoreVertical } from 'lucide-react';
import messageService from '../../services/messageService';
import petService from '../../services/petService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

const ConversationDetail = () => {
  const { userId, petId } = useParams();
  const { user } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true); // only for first load

  // StrictMode & dedupe helpers
  const mountedRef = useRef(false);
  const intervalRef = useRef(null);
  const inFlightRef = useRef(false);
  const lastSigRef = useRef('');

  const scrollToBottomRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = () => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const buildMsgSig = (list) =>
    list.map((m) => `${m.id ?? ''}|${m.timestamp ?? ''}|${m.is_read ? 1 : 0}`).join(',');

  const fetchConversation = useCallback(async (opts = { initial: false }) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      if (opts.initial) setLoading(true);

      // 1) Fetch messages
      const messagesData = await messageService.getConversation(String(userId), String(petId));
      const messagesArray = Array.isArray(messagesData) ? messagesData : [];

      // Skip setMessages if unchanged
      const sig = buildMsgSig(messagesArray);
      if (sig !== lastSigRef.current) {
        lastSigRef.current = sig;
        setMessages(messagesArray);
      }

      // 2) Infer other_user and pet name
      let other = null;
      if (user && messagesArray.length > 0) {
        const diffSender = messagesArray.find((m) => m.sender?.id !== user.id);
        if (diffSender?.sender) other = diffSender.sender;
        if (!other) {
          const withReceiver = messagesArray.find((m) => m.receiver?.id && m.receiver?.id !== user.id);
          if (withReceiver?.receiver) other = withReceiver.receiver;
        }
      }

      let petName = '';
      try {
        const pet = await petService.getPetDetails(petId);
        petName = pet?.name || '';
        if (!other && pet?.owner) other = pet.owner;
      } catch (e) {
        console.warn('[ConversationDetail] Could not fetch pet details:', e?.response?.data || e.message);
      }

      // Fallback to lastConversation
      if (!other) {
        try {
          const raw = localStorage.getItem('lastConversation');
          if (raw) {
            const last = JSON.parse(raw);
            if (String(last?.other_user?.id) === String(userId) && String(last?.pet?.id) === String(petId)) {
              other = last.other_user;
              if (!petName) petName = last.pet?.name || '';
            }
          }
        } catch {}
      }

      setConversation((prev) => {
        const next = {
          other_user: { id: String(other?.id ?? userId), username: other?.username || '' },
          pet: { id: Number(petId), name: petName || '' },
        };
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });

      // 3) Mark unread as read
      const hasUnread = user && messagesArray.some((m) => !m.is_read && m.sender?.id !== user.id);
      if (hasUnread) {
        try {
          await messageService.markAsRead(String(userId), String(petId));
        } catch (e) {
          console.warn('[ConversationDetail] Failed to mark as read:', e?.response?.data || e.message);
        }
      }
    } catch (error) {
      console.error('[ConversationDetail] Error fetching conversation/messages:', error.response?.data || error.message);
    } finally {
      if (opts.initial) setLoading(false);
      inFlightRef.current = false;
    }
  }, [userId, petId, user?.id]);

  // Run once on mount (StrictMode-safe)
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    fetchConversation({ initial: true });
  }, [fetchConversation]);

  // Polling (StrictMode-safe)
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalRef.current = setInterval(() => fetchConversation(), 10000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchConversation]);

  // Scroll to bottom when new messages are added
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
        pet: parseInt(String(petId), 10),
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
      <div className="flex-1 flex items-center justify-center bg-white h-full">
        <div className="text-gray-500">Loading conversation...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white h-full">
        <div className="text-gray-500">Conversation not found</div>
      </div>
    );
  }

  const petName = conversation.pet?.name || 'Unnamed Pet';

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-white h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#dee2e6] bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{petName}</h2>
            <p className="text-sm text-gray-600">with {conversation.other_user?.username || 'User'}</p>
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

      {/* Messages (make this area scrollable) */}
      <div className="flex-1 min-h-0 flex flex-col">
        <MessageList messages={messages} loading={false} />
        <div ref={scrollToBottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ConversationDetail;