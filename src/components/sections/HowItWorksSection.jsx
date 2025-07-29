// src/components/sections/HowItWorksSection.jsx
import React from 'react';
import { Search, Heart, FileText, Home } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: 'Find Your Match',
      description: 'Browse through our selection of adorable pets waiting for homes',
      bgColor: 'bg-[#FFE5D4]',
    },
    {
      icon: Heart,
      title: 'Contact and Meet',
      description: 'Connect with the owner and arrange a meeting with your potential pet',
      bgColor: 'bg-[#F8E8E8]',
    },
    {
      icon: FileText,
      title: 'Complete Paperwork',
      description: 'Fill out the necessary adoption forms and documentation',
      bgColor: 'bg-[#E8F5E8]',
    },
    {
      icon: Home,
      title: 'Take Them Home',
      description: 'Welcome your new family member to their forever home',
      bgColor: 'bg-[#F5D5D5]',
    },
  ];

  return (
    <section className="py-16 bg-[#F8F8F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <img
              src="/api/placeholder/600/500"
              alt="Happy pet owner"
              className="rounded-2xl shadow-xl w-full"
            />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#FFCAB0] rounded-full opacity-20" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#E8F5E8] rounded-full opacity-30" />
          </div>

          {/* Steps */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              How to Adopt a Pet
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className={`${step.bgColor} p-6 rounded-2xl hover:shadow-lg transition-shadow`}
                  >
                    <Icon className="w-8 h-8 text-gray-700 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;