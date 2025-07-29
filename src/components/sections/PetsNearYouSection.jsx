// src/components/sections/PetsNearYouSection.jsx
import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PetCard from '../common/PetCard';

const PetsNearYouSection = () => {
  const nearbyPets = [
    {
      id: 1,
      name: 'Luna',
      breed: 'Persian Cat',
      distance: '2.5 km',
      image: '/api/placeholder/300/300',
      bgColor: 'bg-[#FFE5D4]',
    },
    {
      id: 2,
      name: 'Max',
      breed: 'Golden Retriever',
      distance: '3.8 km',
      image: '/api/placeholder/300/300',
      bgColor: 'bg-[#F8E8E8]',
    },
    {
      id: 3,
      name: 'Bella',
      breed: 'Siamese Cat',
      distance: '1.2 km',
      image: '/api/placeholder/300/300',
      bgColor: 'bg-[#E8F5E8]',
    },
    {
      id: 4,
      name: 'Charlie',
      breed: 'Labrador',
      distance: '4.5 km',
      image: '/api/placeholder/300/300',
      bgColor: 'bg-[#F5D5D5]',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Pets near you</h2>
          <Link
            to="/pets"
            className="text-[#FFCAB0] hover:text-[#FFB090] font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nearbyPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PetsNearYouSection;