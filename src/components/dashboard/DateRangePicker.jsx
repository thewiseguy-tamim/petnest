// src/components/dashboard/DateRangePicker.jsx
import React from 'react';
import { Calendar } from 'lucide-react';

const DateRangePicker = ({ value, onChange }) => {
  const options = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center text-gray-600">
        <Calendar className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">Range</span>
      </div>
      <div className="flex rounded-lg bg-gray-100 p-1">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                active
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateRangePicker;
