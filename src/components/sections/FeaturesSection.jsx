// src/components/sections/FeaturesSection.jsx
import React from 'react';
import { Shield, Heart, Clock, Users, CheckCircle, Home } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Verified Listings',
      description: 'All pet listings are verified to ensure authenticity and safety for both pets and adopters.',
    },
    {
      icon: Heart,
      title: 'Health Records',
      description: 'Access complete health records and vaccination history for every pet listed on our platform.',
    },
    {
      icon: Clock,
      title: 'Quick Process',
      description: 'Our streamlined adoption process helps you bring your new pet home faster and easier.',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join a community of pet lovers who share tips, advice, and support for new pet parents.',
    },
    {
      icon: CheckCircle,
      title: 'Background Checks',
      description: 'We conduct thorough background checks on all users to ensure pet safety and welfare.',
    },
    {
      icon: Home,
      title: 'Home Visits',
      description: 'Optional home visit services to ensure your space is perfect for your new companion.',
    },
  ];

  return (
    <section className="py-16 bg-[#F8F8F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose PetNest?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide a safe, reliable, and compassionate platform for pet adoption and rehoming
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#FFE5D4] rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#FF8B5A]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;