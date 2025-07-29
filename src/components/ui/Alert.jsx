// src/components/ui/Alert.jsx
import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

const Alert = ({ type = 'info', title, message, onClose, className = '' }) => {
  const types = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-400',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'rounded-md border p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={clsx('h-5 w-5', config.iconColor)} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={clsx('text-sm font-medium', config.textColor)}>
              {title}
            </h3>
          )}
          {message && (
            <div className={clsx('text-sm', config.textColor, title && 'mt-1')}>
              {message}
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={clsx(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.textColor,
                `hover:${config.bgColor}`
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;