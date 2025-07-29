// src/components/dashboard/StatsCard.jsx
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, change, changeType }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          {changeType === 'positive' ? (
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span
            className={`text-sm font-medium ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change}
          </span>
          <span className="text-sm text-gray-500 ml-2">from last period</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;