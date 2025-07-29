// src/pages/Home.jsx
import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import PetDiscoverySection from '../components/sections/PetDiscoverySection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import PetsNearYouSection from '../components/sections/PetsNearYouSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import StatsSection from '../components/sections/StatsSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import CTASection from '../components/sections/CTASection';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <PetDiscoverySection />
      <HowItWorksSection />
      <PetsNearYouSection />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};

export default Home;