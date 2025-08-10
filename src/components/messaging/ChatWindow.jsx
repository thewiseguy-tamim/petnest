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
  const [loading, setLoading] = useState(true); // only for first load

  // StrictMode/dedupe helpers
  const mountedRef = useRef(false);
  const intervalRef = useRef(null);
  const inFlightRef = useRef(false);
  const lastSigRef = useRef('');

  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const getPetId = (conv) =>
    conv?.pet?.id ?? conv?.pet_detail?.id ?? (typeof conv?.pet === 'number' ? conv.pet : null);
  const getPetName = (conv) =>
    conv?.pet?.name ?? conv?.pet_detail?.name ?? 'Unknown Pet';
  const getOtherUserId = (conv) =>
    conv?.other_user?.id ? String(conv.other_user.id) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Persist last opened conversation (store IDs as strings)
  useEffect(() => {
    const otherId = getOtherUserId(conversation);
    const pId = getPetId(conversation);
    if (otherId && pId) {
      const data = {
        other_user: {
          id: String(otherId),
          username: conversation?.other_user?.username || '',
        },
        pet: {
          id: Number(pId),
          name: getPetName(conversation) || '',
        },
        savedAt: Date.now(),
      };
      try {
        localStorage.setItem('lastConversation', JSON.stringify(data));
      } catch {}
    }
  }, [conversation]);

  const buildMsgSig = (list) =>
    list.map((m) => `${m.id ?? ''}|${m.timestamp ?? ''}|${m.is_read ? 1 : 0}`).join(',');

  const fetchMessages = useCallback(async (opts = { initial: false }) => {
    if (!user) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      if (opts.initial) setLoading(true);

      const otherId = getOtherUserId(conversation);
      const petIdVal = getPetId(conversation);
      if (!otherId || !petIdVal) {
        console.error('[ChatWindow] Missing conversation data:', conversation);
        if (opts.initial) setLoading(false);
        inFlightRef.current = false;
        return;
      }

      const messagesData = await messageService.getConversation(String(otherId), String(petIdVal));
      const messagesArray = Array.isArray(messagesData) ? messagesData : [];

      const sig = buildMsgSig(messagesArray);
      if (sig !== lastSigRef.current) {
        lastSigRef.current = sig;
        setMessages(messagesArray);
      }

      const hasUnread = messagesArray.some((m) => !m.is_read && m.sender?.id !== user.id);
      if (hasUnread) {
        try {
          await messageService.markAsRead(String(otherId), String(petIdVal));
        } catch (markReadError) {
          console.warn('[ChatWindow] Failed to mark as read:', markReadError);
        }
      }
    } catch (error) {
      console.error('[ChatWindow] Error fetching messages:', error.response?.data || error.message);
    } finally {
      if (opts.initial) setLoading(false);
      inFlightRef.current = false;
    }
  }, [conversation, user]);

  // Run once on mount (StrictMode-safe)
  useEffect(() => {
    if (!user || !conversation) return;
    if (mountedRef.current) return;
    mountedRef.current = true;
    fetchMessages({ initial: true });
  }, [user, conversation, fetchMessages]);

  // Polling (StrictMode-safe)
  useEffect(() => {
    if (!user || !conversation) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalRef.current = setInterval(() => fetchMessages(), 10000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchMessages, user, conversation]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    const receiverUsername = conversation?.other_user?.username;
    const petIdVal = getPetId(conversation);

    if (!receiverUsername || !petIdVal) {
      toast.error('Cannot send message: Invalid conversation data');
      return;
    }

    try {
      await messageService.sendMessage({
        receiver: receiverUsername,
        pet: parseInt(String(petIdVal), 10),
        content: content,
      });

      // Update lastConversation after sending
      try {
        localStorage.setItem(
          'lastConversation',
          JSON.stringify({
            other_user: { id: getOtherUserId(conversation), username: receiverUsername },
            pet: { id: Number(petIdVal), name: getPetName(conversation) || '' },
            savedAt: Date.now(),
          })
        );
      } catch {}

      await fetchMessages();
    } catch (error) {
      console.error('[ChatWindow] Error sending message:', error.response?.data || error.message);
      toast.error('Failed to send message');
    }
  };

  const petName = getPetName(conversation);
  const otherUsername = conversation?.other_user?.username || 'Unknown User';
  const validOtherId = getOtherUserId(conversation);
  const validPetId = getPetId(conversation);

  if (!validOtherId || !validPetId) {
    return (
      <div className="fixed bottom-0 right-4 w-96 h-[600px] bg-white shadow-2xl rounded-t-lg flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Invalid conversation data</div>
        </div>
      </div>
    );
  }

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