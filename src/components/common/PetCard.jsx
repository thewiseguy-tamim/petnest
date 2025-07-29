// src/components/common/PetCard.jsx
import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const PetCard = ({ pet }) => {
  return (
    <Link to={`/pets/${pet.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
        <div className={`relative ${pet.bgColor || 'bg-[#FFE5D4]'} p-4`}>
          <img
            src={pet.image}
            alt={pet.name}
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg">{pet.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{pet.breed}</p>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin size={16} className="mr-1" />
            <span>{pet.distance}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PetCard;