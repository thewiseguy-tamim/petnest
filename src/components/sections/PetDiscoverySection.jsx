// src/components/sections/PetDiscoverySection.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PetDiscoverySection = () => {
  const petImages = [
    { src: '/api/placeholder/300/300', alt: 'Dog', type: 'dog' },
    { src: '/api/placeholder/300/300', alt: 'Rabbit', type: 'rabbit' },
    { src: '/api/placeholder/300/300', alt: 'Hamster', type: 'hamster' },
    { src: '/api/placeholder/300/300', alt: 'Cat', type: 'cat' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Find Out Which Furry Friend Fits You Best!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Every pet has a unique personality, just like you! Whether you're looking for an energetic 
              companion for outdoor adventures or a calm friend for cozy evenings, we'll help you find 
              the perfect match. Our diverse selection includes cats, dogs, rabbits, hamsters, and more - 
              each waiting to bring joy to your life.
            </p>
            <Link
              to="/pets"
              className="inline-flex items-center gap-2 bg-[#FFCAB0] text-white px-6 py-3 rounded-full hover:bg-[#FFB090] transition-colors"
            >
              Explore More
              <ArrowRight size={20} />
            </Link>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            {petImages.map((image, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute bottom-4 left-4 text-white font-semibold">
                  {image.alt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PetDiscoverySection;