// src/components/sections/CTASection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-[#FFCAB0] to-[#FFB090]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Find Your New Best Friend?
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Start your journey today and give a loving pet their forever home
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/pets"
            className="bg-white text-[#FFCAB0] px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
          >
            Browse Pets
          </Link>
          <Link
            to="/about"
            className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[#FFCAB0] transition-all"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;