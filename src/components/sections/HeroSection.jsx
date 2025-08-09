import React from 'react';
import { Search, Plus, Heart, Users, Star } from 'lucide-react';
import heroImage from '../../assets/hero.png';

const HeroSection = () => {
  return (
    <div>
      {/* Main Hero Section */}
      <section className="relative h-[650px] md:h-[750px] overflow-hidden">
        {/* Background with improved gradient */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Beautiful orange cat looking for a home"
            className="w-full h-full object-cover object-center"
          />

        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 right-20 opacity-10">
          <div className="w-32 h-32 bg-white rounded-full blur-xl"></div>
        </div>
        <div className="absolute bottom-32 right-32 opacity-10">
          <div className="w-24 h-24 bg-emerald-400 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-4xl">
            {/* Trust badge */}
            <div className="flex items-center space-x-2 mb-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
              <div className="flex items-center bg-gray-100/90 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="text-yellow-500 fill-current" size={16} />
                <span className="text-gray-700 text-sm font-medium ml-1">Trusted by 50,000+ families</span>
              </div>
            </div>

            <h1             className="text-4xl md:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
              Find Your Perfect Pet
              <span className="block text-emerald-400">Companion Today</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl leading-relaxed opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
              Connect with thousands of pets looking for their forever homes. 
              Every adoption saves a life and creates lasting bonds of unconditional love.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 inline-flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group hover:scale-105 hover:-translate-y-1">
                <Search size={20} className="group-hover:rotate-12 transition-transform" />
                <span>Browse Pets</span>
              </button>
              <button className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 inline-flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group hover:scale-105 hover:-translate-y-1 border border-gray-200">
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                <span>List a Pet</span>
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 text-gray-600 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.8s_forwards]">
              <div className="flex items-center space-x-2">
                <Heart className="text-red-400 fill-current" size={16} />
                <span className="text-sm font-medium">15,000+ Successful Adoptions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="text-blue-400" size={16} />
                <span className="text-sm font-medium">200+ Shelters & Rescues</span>
              </div>
            </div>
          </div>
        </div>

        {/* Smooth transition curve at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16">
          <svg className="w-full h-full" viewBox="0 0 1440 64" preserveAspectRatio="none">
            <path
              d="M0,32 C240,0 480,64 720,32 C960,0 1200,64 1440,32 L1440,64 L0,64 Z"
              fill="rgb(250, 250, 245)"
            />
          </svg>
        </div>
      </section>



      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;