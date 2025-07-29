// src/components/common/ErrorMessage.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
      <AlertCircle className="text-red-500 mr-3" size={20} />
      <p className="text-red-700">{message}</p>
    </div>
  );
};

export default ErrorMessage;