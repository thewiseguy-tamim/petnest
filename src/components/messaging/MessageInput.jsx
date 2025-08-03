import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="px-4 py-3 bg-white border-t border-[#dee2e6]">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={disabled}
        >
          <Paperclip size={20} className="text-gray-500" />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Sending..." : "Type a message..."}
            disabled={disabled}
            className="w-full px-4 py-2.5 pr-12 bg-[#f8f9fa] border border-gray-300 rounded-lg focus:outline-none focus:border-[#007bff] focus:ring-1 focus:ring-[#007bff] disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            aria-label="Type a message"
          />
          
          {message.trim() && (
            <button
              type="submit"
              disabled={disabled}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-[#007bff] hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {disabled ? (
                <div className="w-5 h-5 border-2 border-[#007bff] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={18} />
              )}
            </button>
          )}
        </div>
        
        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={disabled}
        >
          <Smile size={20} className="text-gray-500" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;