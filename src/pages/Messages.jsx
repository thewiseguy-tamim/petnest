import React from 'react';
import { useParams } from 'react-router-dom';
import ConversationsList from '../components/messaging/ConversationsList';
import ConversationDetail from '../components/messaging/ConversationDetail';

const Messages = () => {
  const { userId, petId } = useParams();

  return (
    <div className="flex h-screen bg-white">
      {/* Conversations List - Always visible on desktop */}
      <ConversationsList />
      
      {/* Conversation Detail or Empty State */}
      {userId && petId ? (
        <ConversationDetail />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;