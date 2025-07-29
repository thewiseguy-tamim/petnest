// src/components/sections/HeroSection.jsx
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState('cat');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const tabs = [
    { id: 'cat', label: 'Find a cat' },
    { id: 'dog', label: 'Find a dog' },
    { id: 'other', label: 'Find other pets' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/pets?type=${activeTab}&location=${location}`);
  };

  return (
    <section className="bg-gradient-to-b from-white to-[#F8F8F8] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Pet Companion
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover loving pets waiting for their forever home. Adopt or find your new best friend today.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full shadow-sm p-1 inline-flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#FFCAB0] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FFCAB0]"
                />
              </div>
              <button
                type="submit"
                className="bg-[#FFCAB0] text-white px-8 py-3 rounded-lg hover:bg-[#FFB090] transition-colors flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;