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
    <div className="flex items-center space-x-2">
      <Calendar className="h-5 w-5 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-md"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateRangePicker;