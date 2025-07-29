// src/pages/Messages.jsx
import React, { useState } from 'react';
import ConversationsList from '../components/messaging/ConversationsList';
import ChatWindow from '../components/messaging/ChatWindow';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>
            <ConversationsList
              onSelectConversation={setSelectedConversation}
              selectedConversation={selectedConversation}
            />
          </div>
          
          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                onClose={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md h-full flex items-center justify-center text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;