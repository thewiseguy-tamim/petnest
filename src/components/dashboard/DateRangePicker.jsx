// src/components/dashboard/DateRangePicker.jsx
import React from 'react';
import { Calendar } from 'lucide-react';

const DateRangePicker = ({ value, onChange }) => {
  // The underlying logic in RevenueReports uses rolling windows:
  // day: last 24h, week: last 7 days, month: last 30 days, year: last 12 months.
  // Update labels to reflect that behavior.
  const options = [
    { value: 'day', label: 'Last 24h' },
    { value: 'week', label: 'Last 7 days' },
    { value: 'month', label: 'Last 30 days' },
    { value: 'year', label: 'Last 12 months' },
  ];

  const current = options.some((o) => o.value === value) ? value : 'month';

  const handleChange = (next) => {
    if (next !== current) onChange(next);
  };

  const handleKeyDown = (e, idx) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const nextIdx = (idx + dir + options.length) % options.length;
    handleChange(options[nextIdx].value);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center text-gray-600">
        <Calendar className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">Range</span>
      </div>

      <div
        className="flex rounded-lg bg-gray-100 p-1"
        role="radiogroup"
        aria-label="Date Range"
      >
        {options.map((opt, idx) => {
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange(opt.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 ${
                active
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              role="radio"
              aria-checked={active}
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