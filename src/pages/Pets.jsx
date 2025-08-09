import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/common/LoadingSpinner';
import petService from '../services/petService';
import { toast } from 'react-hot-toast';
import { getPetImageUrl, ImageWithFallback, PLACEHOLDERS } from '../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

const Pets = () => {
  // Core state management - preserving your existing functionality
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Enhanced filter state to support the new UI structure
  const [filters, setFilters] = useState({
    pet_type: 'cat',
    breed: '',
    age: '',
    size: '',
  });
  
  // Sorting functionality
  const [sortBy, setSortBy] = useState('');
  
  // Maintaining your existing adoption/sale filtering logic
  const [postType, setPostType] = useState('adoption');

  // Mobile filter toggle state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const navigate = useNavigate();

  // Your existing useEffect hook - functionality preserved
  useEffect(() => {
    fetchPets();
  }, [filters, postType, sortBy]);

  // Your existing fetchPets function with enhanced filtering capabilities
  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = {
        pet_type: filters.pet_type,
        breed: filters.breed,
        age: filters.age,
        size: filters.size,
      };
      
      const data = await petService.getPets(params);
      
      let filteredPets = data.filter(pet => {
        if (postType === 'adoption') {
          return pet.is_for_adoption === true;
        } else {
          return pet.is_for_adoption === false;
        }
      });
      
      if (sortBy) {
        filteredPets = sortPets(filteredPets, sortBy);
      }
      
      setPets(filteredPets);
    } catch (error) {
      toast.error('Failed to fetch pets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sorting utility function
  const sortPets = (pets, criteria) => {
    const sortedPets = [...pets];
    
    switch (criteria) {
      case 'newest':
        return sortedPets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return sortedPets.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'price-low':
        return sortedPets.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return sortedPets.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name':
        return sortedPets.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sortedPets;
    }
  };

  // Handler for pet type changes
  const handlePetTypeChange = (newType) => {
    setFilters({
      ...filters,
      pet_type: newType,
      breed: '', // Reset breed when changing pet type
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      pet_type: '',
      breed: '',
      age: '',
      size: '',
    });
    setSortBy('');
  };

  const handlePetClick = (petId) => {
    navigate(`/pets/${petId}`);
  };

  const getPetImageSrc = (pet) => getPetImageUrl(pet, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Filter sidebar component
  const FilterSidebar = ({ className = "" }) => (
    <div className={`bg-[#FAFAF5] rounded-lg shadow-sm border border-gray-200 p-3 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center">
          <Filter size={14} className="mr-1" />
          Filters
        </h2>
        <button
          onClick={clearFilters}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear
        </button>
      </div>

      {/* Adoption/Sale Toggle */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Type
        </label>
        <div className="flex space-x-1">
          <button
            onClick={() => setPostType('adoption')}
            className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
              postType === 'adoption'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Adopt
          </button>
          <button
            onClick={() => setPostType('sell')}
            className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
              postType === 'sell'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Buy
          </button>
        </div>
      </div>

      {/* Pet Type Filter */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Pet
        </label>
        <div className="relative">
          <select 
            value={filters.pet_type}
            onChange={(e) => handlePetTypeChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-300 rounded px-2 py-1.5 pr-5 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="other">Other</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
        </div>
      </div>
      
      {/* Breed Filter */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Breed
        </label>
        <div className="relative">
          <select 
            value={filters.breed}
            onChange={(e) => setFilters({...filters, breed: e.target.value})}
            className="w-full appearance-none bg-white border border-gray-300 rounded px-2 py-1.5 pr-5 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All</option>
            {filters.pet_type === 'dog' && (
              <>
                <option value="golden-retriever">Golden</option>
                <option value="labrador">Labrador</option>
                <option value="german-shepherd">Shepherd</option>
                <option value="poodle">Poodle</option>
                <option value="beagle">Beagle</option>
                <option value="bulldog">Bulldog</option>
              </>
            )}
            {filters.pet_type === 'cat' && (
              <>
                <option value="persian">Persian</option>
                <option value="siamese">Siamese</option>
                <option value="maine-coon">Maine Coon</option>
                <option value="british-shorthair">British</option>
              </>
            )}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
        </div>
      </div>
      
      {/* Age Filter */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Age
        </label>
        <div className="relative">
          <select 
            value={filters.age}
            onChange={(e) => setFilters({...filters, age: e.target.value})}
            className="w-full appearance-none bg-white border border-gray-300 rounded px-2 py-1.5 pr-5 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="young">Young</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
        </div>
      </div>
      
      {/* Size Filter */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Size
        </label>
        <div className="relative">
          <select 
            value={filters.size}
            onChange={(e) => setFilters({...filters, size: e.target.value})}
            className="w-full appearance-none bg-white border border-gray-300 rounded px-2 py-1.5 pr-5 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="extra-large">XL</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
        </div>
      </div>

      {/* Sort By Filter */}
      <div className="mb-0">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Sort
        </label>
        <div className="relative">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-300 rounded px-2 py-1.5 pr-5 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Default</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-low">$ Low</option>
            <option value="price-high">$ High</option>
            <option value="name">A-Z</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* Header */}
      <div className="bg-[#FAFAF5] ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Find Your Perfect Companion
            </h1>
            
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Filter size={16} className="mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-8 mt-11">
              <FilterSidebar />
            </div>
          </div>

          {/* Mobile Filter Popup Modal */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-white bg-opacity-50 flex items-center justify-center p-4" onClick={() => setShowMobileFilters(false)}>
              <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <Filter size={20} className="mr-2" />
                      Filters
                    </h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* Enhanced Mobile Filter Content */}
                  <div className="space-y-6">
                    {/* Adoption/Sale Toggle */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Listing Type
                      </label>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setPostType('adoption')}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            postType === 'adoption'
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Adoption
                        </button>
                        <button
                          onClick={() => setPostType('sell')}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            postType === 'sell'
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          For Sale
                        </button>
                      </div>
                    </div>

                    {/* Pet Type Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Pet Type
                      </label>
                      <div className="relative">
                        <select 
                          value={filters.pet_type}
                          onChange={(e) => handlePetTypeChange(e.target.value)}
                          className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                          <option value="dog">Dogs</option>
                          <option value="cat">Cats</option>
                          <option value="other">Other Pets</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    
                    {/* Breed Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Breed
                      </label>
                      <div className="relative">
                        <select 
                          value={filters.breed}
                          onChange={(e) => setFilters({...filters, breed: e.target.value})}
                          className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                          <option value="">All Breeds</option>
                          {filters.pet_type === 'dog' && (
                            <>
                              <option value="golden-retriever">Golden Retriever</option>
                              <option value="labrador">Labrador</option>
                              <option value="german-shepherd">German Shepherd</option>
                              <option value="poodle">Poodle</option>
                              <option value="beagle">Beagle</option>
                              <option value="bulldog">Bulldog</option>
                            </>
                          )}
                          {filters.pet_type === 'cat' && (
                            <>
                              <option value="persian">Persian</option>
                              <option value="siamese">Siamese</option>
                              <option value="maine-coon">Maine Coon</option>
                              <option value="british-shorthair">British Shorthair</option>
                            </>
                          )}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    
                    {/* Age Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Age Range
                      </label>
                      <div className="relative">
                        <select 
                          value={filters.age}
                          onChange={(e) => setFilters({...filters, age: e.target.value})}
                          className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                          <option value="">All Ages</option>
                          <option value="young">Young (0-2 years)</option>
                          <option value="adult">Adult (2-7 years)</option>
                          <option value="senior">Senior (7+ years)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    
                    {/* Size Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Size
                      </label>
                      <div className="relative">
                        <select 
                          value={filters.size}
                          onChange={(e) => setFilters({...filters, size: e.target.value})}
                          className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                          <option value="">All Sizes</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="extra-large">Extra Large</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    {/* Sort By Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Sort By
                      </label>
                      <div className="relative">
                        <select 
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                          <option value="">Default</option>
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="name">Name A-Z</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={clearFilters}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {loading ? 'Loading...' : `${pets.length} pets found`}
                </p>
              </div>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : pets.length === 0 ? (
              /* Empty state */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pets found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your filters or check back later for new listings.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            ) : (
              /* Pet Grid - Matches FeaturedPetsSection card layout */
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                {pets.map((pet) => (
                  <motion.div
                    key={pet.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => handlePetClick(pet.id)}
                    className="bg-[#FAFAF5] rounded-2xl hover:shadow-xl transition cursor-pointer overflow-hidden border border-[#FAFAF5] flex flex-col h-[420px]"
                  >
                    {/* Image Section */}
                    <div className="relative h-[60%] w-full rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={getPetImageSrc(pet)}
                        fallback={PLACEHOLDERS.IMAGE}
                        alt={pet.name || 'Pet'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                      {pet.is_for_adoption ? (
                        <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                          Adoption
                        </span>
                      ) : pet.price ? (
                        <span className="absolute bottom-3 left-3 bg-white text-gray-800 text-sm font-semibold px-3 py-1 rounded-full shadow">
                          ${pet.price}
                        </span>
                      ) : null}

                      <button
                        className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
                        aria-label="Favorite"
                      >
                        <motion.div whileTap={{ scale: 0.8 }}>
                          <Heart size={18} className="text-gray-600 hover:text-red-500" />
                        </motion.div>
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="h-[40%] p-4 text-center flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {pet.breed}, {pet.age} year{pet.age !== 1 ? 's' : ''} old
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{pet.gender}</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{pet.pet_type}</span>
                          {pet.personality_tags?.map((tag, i) => (
                            <span key={i} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 mt-3 rounded-full text-xs font-semibold transition"
                      >
                        Learn More
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pets;