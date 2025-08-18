// src/pages/client/ClientPosts.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, Edit2, Trash2, Eye, Clock, Plus, Filter, MoreVertical, Heart, Share2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import petService from '../../services/petService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';

// Use the same utils you already use in PetDetails
import { ImageWithFallback, getPetImageUrl, PLACEHOLDERS } from '../../utils/imageUtils';

const ClientPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await userService.getUserPosts();
      console.log('[ClientPosts] Fetched posts:', data); // Debug log
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load your posts.',
        autoHide: true,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get pet ID from post
  const getPetId = (post) => {
    if (post.pet?.id) return post.pet.id;
    if (post.pet_id) return post.pet_id;
    if (typeof post.pet === 'number') return post.pet;
    return null;
  };

  const handleDelete = async (postId, post) => {
    const petId = getPetId(post);
    if (!petId) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Cannot delete post: Pet ID not found.',
        autoHide: true,
        duration: 5000
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await petService.deletePet(petId);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Pet listing deleted successfully.',
          autoHide: true,
          duration: 5000
        });
        fetchPosts();
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete listing.',
          autoHide: true,
          duration: 5000
        });
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'available') return post.pet?.availability === true;
    if (filter === 'unavailable') return post.pet?.availability === false;
    return true;
  });

  const getStatusColor = (availability) => {
    return availability 
      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
  };

  const handlePetClick = (petId) => {
    if (petId) {
      navigate(`/pets/${petId}`);
    }
  };

  const stats = {
    total: posts.length,
    available: posts.filter(p => p.pet?.availability).length,
    unavailable: posts.filter(p => !p.pet?.availability).length,
    totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0)
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner />
           
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header with Gradient Background */}
        <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-white">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  My Pet Listings
                </h1>
                <p className="text-green-100 text-lg">
                  Manage and track your pet adoption listings
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-green-100">Total Pets</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stats.available}</div>
                  <div className="text-sm text-green-100">Available</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stats.unavailable}</div>
                  <div className="text-sm text-green-100">Adopted</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stats.totalViews}</div>
                  <div className="text-sm text-green-100">Total Views</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                >
                  <option value="all">All Listings ({stats.total})</option>
                  <option value="available">Available ({stats.available})</option>
                  <option value="unavailable">Adopted ({stats.unavailable})</option>
                </select>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-green-700 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-green-700 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
            
            <Link
              to="/pets/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={18} className="mr-2" />
              Add New Pet
            </Link>
          </div>
        </div>

        {/* Posts Display */}
        {filteredPosts.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {filter === 'all' 
                  ? "No pet listings yet" 
                  : `No ${filter} listings found`}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {filter === 'all' 
                  ? "Start by creating your first pet listing and help pets find their forever homes!"
                  : `Try adjusting your filters to see more listings.`}
              </p>
              {filter === 'all' && (
                <Link
                  to="/pets/create"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  <Plus size={20} className="mr-3" />
                  Create Your First Listing
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-30" 
              : "space-y-6"
          }>
            {filteredPosts.map((post) => {
              const petId = getPetId(post);
              
              if (viewMode === 'list') {
                return (
                  <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-green-200">
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <ImageWithFallback
                          src={getPetImageUrl(post.pet, 0)}
                          fallback={PLACEHOLDERS.IMAGE}
                          alt={post.pet?.name || 'Pet'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{post.pet?.name}</h3>
                              <span className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm ${getStatusColor(post.pet?.availability)}`}>
                                {post.pet?.availability ? 'Available' : 'Adopted'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">
                              {post.pet?.breed} • {post.pet?.age} years old
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                {formatDate(post.created_at)}
                              </span>
                              <span className="flex items-center">
                                <Eye size={14} className="mr-1" />
                                {post.views || 0} views
                              </span>
                            </div>
                          </div>
                          
                          {petId && (
                            <div className="flex items-center gap-2 ml-4">
                              <Link
                                to={`/pets/${petId}`}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </Link>
                              <Link
                                to={`/pets/${petId}/edit`}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Edit Listing"
                              >
                                <Edit2 size={18} />
                              </Link>
                              <button
                                onClick={() => handleDelete(post.id, post)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Listing"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Grid view with matching card size and layout
              return (
                <div
                  key={post.id}
                  className="group bg-[#FAFAF5] rounded-2xl hover:shadow-xl transition cursor-pointer overflow-hidden border border-[#FAFAF5] flex flex-col h-[420px] w-full md:w-[260px] md:h-[520px]"
                  onClick={() => handlePetClick(petId)}
                >
                  {/* Image Section - 60% height */}
                  <div className="relative h-[60%] w-full rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={getPetImageUrl(post.pet, 0)}
                      fallback={PLACEHOLDERS.IMAGE}
                      alt={post.pet?.name || 'Pet'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold shadow-lg ${getStatusColor(post.pet?.availability)}`}>
                        {post.pet?.availability ? '✨ Available' : '🏠 Adopted'}
                      </span>
                    </div>

                    {/* Action Menu - appears on hover */}
                    {petId && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-2">
                          <Link
                            to={`/pets/${petId}`}
                            className="p-2 bg-white/90 backdrop-blur-sm text-green-600 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                            title="View Details"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/pets/${petId}/edit`}
                            className="p-2 bg-white/90 backdrop-blur-sm text-gray-600 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                            title="Edit Listing"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(post.id, post);
                            }}
                            className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                            title="Delete Listing"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section - 40% height */}
                  <div className="h-[40%] p-4 text-center flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{post.pet?.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {post.pet?.breed}, {post.pet?.age} year{post.pet?.age !== 1 ? 's' : ''} old
                      </p>
                      
                      {/* Metrics */}
                      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatDate(post.created_at)}
                        </span>
                        <span className="flex items-center">
                          <Eye size={12} className="mr-1" />
                          {post.views || 0} views
                        </span>
                      </div>
                    </div>
                    
                    {petId ? (
                      <div className="mt-3">
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-xs font-semibold transition transform hover:scale-105">
                          Manage Listing
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4 text-gray-400">
                        <span className="text-xs">Pet data unavailable</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enhanced Call to Action for New Listings */}
        {posts.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Ready to help more pets find homes?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create another listing and continue making a difference in pets' lives.
              </p>
              <Link
                to="/pets/create"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus size={20} className="mr-3" />
                Create New Listing
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientPosts;