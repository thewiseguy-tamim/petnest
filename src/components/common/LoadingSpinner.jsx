// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFCAB0]"></div>
    </div>
  );
};

export default LoadingSpinner;