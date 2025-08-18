// src/components/ui/Input.jsx
import React from 'react';
import clsx from 'clsx';

const Input = React.forwardRef(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400',
          'focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700',
          error ? 'border-red-300' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;