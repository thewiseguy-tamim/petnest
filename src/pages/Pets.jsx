// src/pages/Pets.jsx
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import PetCard from '../components/common/PetCard';
import FilterPanel from '../components/common/FilterPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import petService from '../services/petService';
import { toast } from 'react-hot-toast';

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cat');
  const [postType, setPostType] = useState('adoption');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    pet_type: 'cat',
    breed: '',
  });

  const tabs = [
    { id: 'cat', label: 'Find a cat' },
    { id: 'dog', label: 'Find a dog' },
    { id: 'other', label: 'Find other pets' },
  ];

  useEffect(() => {
    fetchPets();
  }, [activeTab, postType, filters]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = {
        pet_type: activeTab,
        ...filters,
      };
      const data = await petService.getPets(params);
      
      // Filter by adoption/sale based on postType
      const filteredPets = data.filter(pet => {
        if (postType === 'adoption') {
          return pet.is_for_adoption === true;
        } else {
          return pet.is_for_adoption === false;
        }
      });
      
      setPets(filteredPets);
    } catch (error) {
      toast.error('Failed to fetch pets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPets();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Pet Type Tabs */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 rounded-full p-1 inline-flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setFilters({ ...filters, pet_type: tab.id });
                  }}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Enter your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-[#FFCAB0]"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#FFCAB0] text-white p-2 rounded-full hover:bg-[#FFB090] transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Post Type Tabs */}
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={() => setPostType('adoption')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                postType === 'adoption'
                  ? 'bg-[#FFCAB0] text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              Adoption Posts
            </button>
            <button
              onClick={() => setPostType('sell')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                postType === 'sell'
                  ? 'bg-[#FFCAB0] text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              Sell Posts
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filter Panel */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64`}>
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>

          {/* Pet Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {postType === 'adoption' ? 'Pets for Adoption' : 'Pets for Sale'}
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Filter size={20} />
                Filters
              </button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : pets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No pets found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pets;