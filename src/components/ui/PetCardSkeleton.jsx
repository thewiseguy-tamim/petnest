import React from 'react';
import { motion } from 'framer-motion';

const PetCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md"
    >
      <div className="shimmer h-64 rounded-t-xl"></div>
            <div className="p-6">
        <div className="shimmer h-6 w-3/4 rounded mb-2"></div>
        <div className="shimmer h-4 w-1/2 rounded mb-3"></div>
        <div className="shimmer h-4 w-2/3 rounded mb-4"></div>
        <div className="flex gap-2">
          <div className="shimmer h-6 w-16 rounded-full"></div>
          <div className="shimmer h-6 w-16 rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default PetCardSkeleton;