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
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const offset = 80;
          const elementPosition = element.offsetTop - offset;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
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
    <div className="bg-[#FAFAF5]">
      <div id="home">
        <HeroSection />
      </div>
      <div id="pet-adoption">
        <PetAdoptionSection />
      </div>
      <div id="featured-pets">
        <FeaturedPetsSection featuredPets={featuredPets} loading={loading} />
      </div>
      <div id="trust">
        <TrustSection />
      </div>
      <div id="success-stories">
        <SuccessStoriesSection />
      </div>
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <div id="about">
        <AboutUs />
      </div>
      <div id="contact">
        <ContactUs />
      </div>
      <div id="partnerships">
        <PartnershipSlider />
      </div>
      <div id="cta">
        <CTASection />
      </div>
    </div>
  );
};

export default Home;