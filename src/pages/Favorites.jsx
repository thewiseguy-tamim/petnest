// src/pages/Favorites.jsx
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import PetCard from '../components/common/PetCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Favorites = () => {
  const [favorites, setFavorites] = useLocalStorage('petnest_favorites', []);
  const [loading, setLoading] = useState(false);

  const removeFavorite = (petId) => {
    setFavorites(favorites.filter(fav => fav.id !== petId));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Heart className="w-6 h-6 text-red-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">You haven't saved any pets yet</p>
            <Link
              to="/pets"
              className="inline-flex items-center px-4 py-2 bg-[#FFCAB0] text-white rounded-md hover:bg-[#FFB090]"
            >
              Browse Pets
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((pet) => (
              <div key={pet.id} className="relative">
                <PetCard pet={pet} />
                <button
                  onClick={() => removeFavorite(pet.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;