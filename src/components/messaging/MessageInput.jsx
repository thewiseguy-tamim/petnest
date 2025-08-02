import React, { useState } from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Sending..." : "Type a message..."}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#FFCAB0] focus:ring-1 focus:ring-[#FFCAB0] disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-label="Type a message"
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-[#FFCAB0] text-white p-2 rounded-full hover:bg-[#FFB090] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[40px]"
        >
          {disabled ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;