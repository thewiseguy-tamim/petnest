import React, { useState, useEffect } from 'react';
import petService from '../services/petService';
import HeroSection from '../components/sections/HeroSection';
import FeaturedPetsSection from '../components/sections/FeaturedPetsSection';
import TrustSection from '../components/sections/TrustSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import SuccessStoriesSection from '../components/sections/SuccessStoriesSection';
import QuickActionsSection from '../components/sections/QuickActionsSection';
import CTASection from '../components/sections/CTASection';
import PetAdoptionSection from '../components/sections/PetAdoptionSection';
import AboutUs from '../components/sections/AboutUs';
import ContactUs from '../components/sections/ContactUs';
import PartnershipSlider from '../components/sections/PartnershipSection';


const Home = () => {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPets();
  }, []);

  const fetchFeaturedPets = async () => {
    try {
      setLoading(true);
      const response = await petService.getPets({ limit: 4 });
      setFeaturedPets(response.results || []);
    } catch (error) {
      console.error('Error fetching featured pets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <HeroSection />
      <PetAdoptionSection />
      <FeaturedPetsSection featuredPets={featuredPets} loading={loading} />
      <TrustSection />
      <SuccessStoriesSection />
      <HowItWorksSection />
      <AboutUs/>
      <ContactUs/>
      <PartnershipSlider/>
      <CTASection />
    </div>
  );
};

export default Home;