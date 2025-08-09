import React from 'react';
import { Link } from 'react-router-dom';

const PlusPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    style={{ zIndex: 0 }}
    width="100%"
    height="100%"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="plus"
        x="0"
        y="0"
        width="40"
        height="40"
        patternUnits="userSpaceOnUse"
      >
        <text
          x="20"
          y="24"
          textAnchor="middle"
          fontSize="20"
          fill="#D1FAE5"
          fontFamily="sans-serif"
        >+</text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#plus)" />
  </svg>
);

const CTASection = () => {
  return (
    <section className="relative py-32 bg-white overflow-hidden">
      <PlusPattern />
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Ready to make a<br className="hidden md:block" /> difference?
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
          Browse our adoptable pets and begin your journey to finding the perfect match.
        </p>
        <Link
          to="/pets"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-md transition-colors"
        >
          Find Your Companion
        </Link>
      </div>
    </section>
  );
};

export default CTASection;