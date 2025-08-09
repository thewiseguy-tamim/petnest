// src/components/sections/PetsNearYouSection.jsx
import React from 'react';
import { MapPin, Filter } from 'lucide-react';

const PetsNearYouSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Find Pets Near You
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Discover adoptable pets in your local area. Use our location-based search to find pets within your preferred distance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold transition-colors inline-flex items-center justify-center space-x-2">
                  <MapPin size={20} />
                  <span>Use My Location</span>
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full font-semibold transition-colors inline-flex items-center justify-center space-x-2 border border-gray-300">
                  <Filter size={20} />
                  <span>Advanced Filters</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop"
                alt="Happy dog"
                className="rounded-xl shadow-lg"
              />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4">
                <p className="text-2xl font-bold text-emerald-600">250+</p>
                <p className="text-sm text-gray-600">Pets near you</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PetsNearYouSection;