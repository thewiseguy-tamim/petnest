import React from 'react';
import { Link } from 'react-router-dom';
import { getPetImageUrl, ImageWithFallback, PLACEHOLDERS } from '../../utils/imageUtils';

const PetCard = ({ pet }) => {
  return (
    <Link to={`/pets/${pet.id}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
        
        {/* Square Image Container */}
        <div className="relative w-full aspect-square overflow-hidden">
          <ImageWithFallback
            src={getPetImageUrl(pet)}
            fallback={PLACEHOLDERS.IMAGE}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Text Content */}
        <div className="p-4 text-center">
          <h3 className="font-semibold text-gray-900 text-base mb-1">{pet.name}</h3>
          <p className="text-gray-500 text-sm">{pet.breed}</p>
          <p className="text-blue-500 font-medium text-sm mt-1">
            {pet.is_for_adoption ? 'Adoptable' : pet.price ? `$${pet.price}` : 'Available'}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default PetCard;
