import React from 'react';

// Define default props to ensure filters has a valid structure
const FilterPanel = ({ filters = { priceRange: [0, 10000], availability: 'all', breed: '', age: '' }, setFilters }) => {
  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    setFilters({
      ...filters,
      priceRange: [0, value],
    });
  };

  // Safely access priceRange with a fallback
  const priceRangeValue = filters.priceRange && filters.priceRange[1] ? filters.priceRange[1] : 10000;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <input
          type="range"
          min="0"
          max="10000"
          value={priceRangeValue}
          onChange={handlePriceChange}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>$0</span>
          <span>${priceRangeValue}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Availability
        </label>
        <select
          value={filters.availability || 'all'}
          onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-700"
        >
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Breed */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Breed
        </label>
        <input
          type="text"
          value={filters.breed || ''}
          onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
          placeholder="Enter breed"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-700"
        />
      </div>

      {/* Age */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Age
        </label>
        <select
          value={filters.age || ''}
          onChange={(e) => setFilters({ ...filters, age: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-700"
        >
          <option value="">Any Age</option>
          <option value="0-1">0-1 years</option>
          <option value="1-3">1-3 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5+">5+ years</option>
        </select>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => setFilters({
          priceRange: [0, 10000],
          availability: 'all',
          breed: '',
          age: '',
        })}
        className="w-full text-green-700 hover:text-[#FFB090] font-medium"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterPanel;