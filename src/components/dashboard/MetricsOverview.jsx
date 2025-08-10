// src/components/dashboard/MetricsOverview.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricsOverview = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const isUp = metric.trend > 0;
        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="px-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {metric.label}
                </span>
                {metric.trend !== undefined && (
                  <div
                    className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                      isUp
                        ? 'text-green-600 bg-green-50'
                        : 'text-red-600 bg-red-50'
                    }`}
                  >
                    {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="ml-1">{Math.abs(metric.trend)}%</span>
                  </div>
                )}
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {metric.value}
              </div>
              {metric.subtext && (
                <p className="mt-2 mb-4 text-xs text-gray-500">{metric.subtext}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsOverview;
