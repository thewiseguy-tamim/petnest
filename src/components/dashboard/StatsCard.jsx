// src/components/dashboard/StatsCard.jsx
import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, change, changeType }) => {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-gray-700" />
        </div>
        {change && (
          <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getChangeColor()}`}>
            {getChangeIcon()}
            <span className="ml-1">{change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;