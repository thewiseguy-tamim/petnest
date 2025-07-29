// src/components/ui/Sidebar.jsx
import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ isOpen, onClose, title, children, position = 'right' }) => {
  const positions = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed top-0 h-full w-80 bg-white shadow-xl z-50 transition-transform duration-300',
          positions[position],
          isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {children}
        </div>
      </div>
    </>
  );
};

export default Sidebar;