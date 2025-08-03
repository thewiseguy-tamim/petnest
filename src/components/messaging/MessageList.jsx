import React from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageList = ({ messages, loading }) => {
  const { user } = useAuth();

  const formatMessageDate = (date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      const date = formatMessageDate(new Date(message.timestamp));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  // Show loading spinner only when explicitly loading
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  // Debug logging
  console.log('[MessageList] Render state:', {
    loading,
    messagesLength: messages?.length,
    messages: messages,
    user: user?.username
  });

  // Check if user is not authenticated - but only if we're not loading and have no messages
  if (!user && (!messages || messages.length === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
        <p>Please log in to view messages.</p>
      </div>
    );
  }

  // If messages is not an array or is undefined, treat as empty
  if (!Array.isArray(messages)) {
    console.warn('[MessageList] Messages is not an array:', messages);
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  // Only show "no messages" if we're not loading AND we have an empty array AND user is authenticated
  if (!loading && messages.length === 0 && user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
        <p>You can not send text to yourself</p>
      </div>
    );
  }

  // If we have messages but no user, still render the messages
  // This handles cases where user auth state might be temporarily unavailable
  if (messages.length > 0) {
    const groupedMessages = groupMessagesByDate(messages);

    return (
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-3 text-xs font-medium text-gray-500">{date}</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              // Check if the message sender's username matches current user's username
              // If match = current user sent it (RIGHT side, blue)
              // If no match = other user sent it (LEFT side, gray)
              const isFromCurrentUser = user && message.sender?.username === user?.username;
              const showAvatar = (index === 0 || dateMessages[index - 1]?.sender?.id !== message.sender?.id);
              const isLastInGroup = index === dateMessages.length - 1 || dateMessages[index + 1]?.sender?.id !== message.sender?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex items-end mb-1 ${isFromCurrentUser ? 'justify-end' : 'justify-start'} ${isLastInGroup ? 'mb-3' : ''}`}
                >
                  {/* Avatar for OTHER user's messages - LEFT side */}
                  {!isFromCurrentUser && (
                    <div className="w-8 mr-2 flex-shrink-0">
                      {showAvatar && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-xs font-medium">
                            {message.sender?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`group relative max-w-[70%]`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isFromCurrentUser
                          ? 'bg-blue-500 text-white' // Current user's messages - blue on RIGHT
                          : 'bg-gray-200 text-gray-900' // Other user's messages - gray on LEFT
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    
                    {/* Timestamp on hover */}
                    <div className={`absolute -bottom-5 ${isFromCurrentUser ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <span className="text-xs text-gray-500">
                        {format(new Date(message.timestamp), 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  {/* Avatar for CURRENT user's messages - RIGHT side */}
                  {isFromCurrentUser && (
                    <div className="w-8 ml-2 flex-shrink-0">
                      {showAvatar && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Fallback - should rarely be reached
  return (
    <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
      <p>No messages yet. Start the conversation!</p>
    </div>
  );
};

export default MessageList;