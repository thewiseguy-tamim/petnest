// src/components/dashboard/MetricsOverview.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricsOverview = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{metric.label}</span>
            {metric.trend && (
              <div className={`flex items-center text-sm ${
                metric.trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1">{Math.abs(metric.trend)}%</span>
              </div>
            )}
          </div>
          <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
          {metric.subtext && (
            <p className="text-xs text-gray-500 mt-1">{metric.subtext}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default MetricsOverview;