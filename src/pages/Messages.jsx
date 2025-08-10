import React from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import ConversationsList from '../components/messaging/ConversationsList';
import ConversationDetail from '../components/messaging/ConversationDetail';

const Messages = () => {
  const { userId, petId } = useParams();

  return (
    <div className="min-h-screen bg-[#f7f8fb] pt-26">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 sm:py-6">
        <div className="relative flex h-[78vh] rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
          {/* Left: Conversations */}
          <ConversationsList />

          {/* Right: Conversation Detail or Empty State */}
          {userId && petId ? (
            <ConversationDetail />
          ) : (
            <div className="flex-1 min-w-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <MessageSquare size={18} />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">Select a conversation</h3>
                <p className="text-sm text-gray-500">Choose a chat from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;