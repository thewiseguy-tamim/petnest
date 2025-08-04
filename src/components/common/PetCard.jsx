// src/components/common/PetCard.jsx
import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPetImageUrl, ImageWithFallback, PLACEHOLDERS } from '../../utils/imageUtils';

const PetCard = ({ pet }) => {
  return (
    <Link to={`/pets/${pet.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
        <div className={`relative ${pet.bgColor || 'bg-[#FFE5D4]'} p-4`}>
          <ImageWithFallback
            src={getPetImageUrl(pet)}
            fallback={PLACEHOLDERS.IMAGE}
            alt={pet.name}
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg">{pet.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{pet.breed}</p>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin size={16} className="mr-1" />
            <span>{pet.location || 'Location not specified'}</span>
          </div>
          {pet.is_for_adoption ? (
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              For Adoption
            </span>
          ) : (
            <span className="inline-block mt-2 text-lg font-bold text-[#FFCAB0]">
              ${pet.price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PetCard;