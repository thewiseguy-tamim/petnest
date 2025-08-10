// src/components/dashboard/StatsCard.jsx
import React from 'react';

const StatsCard = ({ title, value, icon: Icon, change, changeType }) => {
  const chipMap = {
    positive: 'text-green-700 bg-green-50',
    negative: 'text-red-700 bg-red-50',
    warning: 'text-amber-700 bg-amber-50',
    default: 'text-gray-700 bg-gray-50',
  };

  const chipClass = chipMap[changeType] || chipMap.default;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gray-100 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-gray-700" />
        </div>
        {change && (
          <div
            className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${chipClass}`}
          >
            <span>{change}</span>
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
