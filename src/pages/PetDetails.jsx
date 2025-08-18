import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Heart, Share2, MessageCircle, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChatWindow from '../components/messaging/ChatWindow';
import petService from '../services/petService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { getImageWithFallback, getPetImageUrl, getAvatarUrl, ImageWithFallback, PLACEHOLDERS } from '../utils/imageUtils';

// Animation variants for Framer Motion (for Pet Grid)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [pet, setPet] = useState(null);
  const [otherPets, setOtherPets] = useState([]); // State for related pets
  const [loading, setLoading] = useState(true);
  const [otherPetsLoading, setOtherPetsLoading] = useState(true); // Separate loading for grid
  const [selectedImage, setSelectedImage] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch pet details
  const fetchPetDetails = useCallback(async () => {
    try {
      const data = await petService.getPetDetails(id);
      console.log('[PetDetails] Fetched pet:', data);
      setPet(data);
    } catch (error) {
      toast.error('Failed to fetch pet details');
      console.error('[PetDetails] Error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch other pets for the grid
  const fetchOtherPets = useCallback(async () => {
    try {
      const data = await petService.getAllPets(); // Assumes petService has a getAllPets method
      console.log('[PetDetails] Fetched other pets:', data);
      // Exclude the current pet from the grid
      setOtherPets(data.filter((p) => String(p.id) !== String(id)));
    } catch (error) {
      
      console.error('[PetDetails] Error fetching other pets:', error.response?.data || error.message);
    } finally {
      setOtherPetsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPetDetails();
    fetchOtherPets();
  }, [fetchPetDetails, fetchOtherPets]);

  const getPrimaryImageUrl = () => {
    return getPetImageUrl(pet, selectedImage);
  };

  const getThumbnailUrl = (img, index) => {
    if (pet?.images_data?.length > index) {
      return getPetImageUrl(pet, index);
    }
    const imageUrl = img?.image || (typeof img === 'string' ? img : null);
    return getImageWithFallback(imageUrl, PLACEHOLDERS.THUMBNAIL);
  };

  const handleContactOwner = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to contact the owner');
      navigate('/login');
      return;
    }

    if (String(pet.owner.id) === String(user.id)) {
      toast.error("You can't message yourself!");
      return;
    }

    if (!pet?.id || !pet?.owner?.id) {
      toast.error('Cannot contact owner: Invalid pet data');
      return;
    }

    setChatLoading(true);

    try {
      const conversationData = {
        other_user: {
          id: pet.owner.id,
          username: pet.owner.username || 'Unknown User',
          profile_picture: pet.owner.profile_picture || null,
        },
        pet: {
          id: pet.id,
          name: pet.name || 'Unnamed Pet',
        },
        pet_detail: pet,
        latest_message: null,
        unread_count: 0,
      };

      setConversation(conversationData);
      setShowChat(true);
    } catch (error) {
      console.error('[PetDetails] Error setting up conversation:', error);
      toast.error('Failed to open chat');
    } finally {
      setChatLoading(false);
    }
  };

  const getOwnerInitials = () => {
    return pet?.owner?.username?.charAt(0).toUpperCase() || 'U';
  };

  const getOwnerName = () => {
    return pet?.owner?.username || 'Unknown User';
  };

  const getOwnerJoinYear = () => {
    return pet?.owner?.date_joined
      ? new Date(pet.owner.date_joined).getFullYear()
      : 'Unknown';
  };

  const nextImage = () => {
    if (pet?.images_data?.length > 1) {
      setSelectedImage((prev) => (prev + 1) % pet.images_data.length);
    }
  };

  const prevImage = () => {
    if (pet?.images_data?.length > 1) {
      setSelectedImage((prev) => (prev - 1 + pet.images_data.length) % pet.images_data.length);
    }
  };

  // Navigate to another pet's details page
  const handlePetClick = (petId) => {
    navigate(`/pets/${petId}`);
  };

  // Get image for grid cards (consistent with getPetImageUrl)
  const getPetImageSrc = (pet) => {
    return getPetImageUrl(pet, 0); // Select primary image (index 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#fafaf5] py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet not found</h2>
          <p className="text-gray-600 mb-4">The pet you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/pets')}
            className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-[#FFB090] transition-colors"
          >
            Browse Pets
          </button>
        </div>
      </div>
    );
  }

  const hasMultipleImages = pet?.images_data?.length > 1;

  return (
    <div className="min-h-screen bg-[#fafaf5] py-8 pt-35">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Pet Details */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery - Left Side */}
            <div className="relative bg-white p-8">
              <div className="relative h-[600px] flex items-center justify-center">
                <ImageWithFallback
                  src={getPrimaryImageUrl()}
                  fallback={PLACEHOLDERS.IMAGE}
                  alt={pet.name || 'Pet'}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                />
                
                {/* Navigation arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronRight size={24} className="text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Image indicators */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {pet.images_data.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        selectedImage === index 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pet Details - Right Side */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{pet.name || 'Unnamed Pet'}</h1>
                  <p className="text-xl text-gray-500">{pet.breed || 'Unknown Breed'}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-3 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-all">
                    <Heart size={20} />
                  </button>
                  <button className="p-3 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-500 transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-8">
                {pet.is_for_adoption ? (
                  <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                    Available for Adoption
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-[#00a63e]">
                    ${pet.price || 'N/A'}
                  </div>
                )}
              </div>

              {/* Pet Stats Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Age</p>
                  <p className="text-lg font-bold text-gray-900">{pet.age ? `${pet.age} years` : 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Gender</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{pet.gender || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Type</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{pet.pet_type || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Posted</p>
                  <p className="text-lg font-bold text-gray-900">
                    {pet.created_at ? new Date(pet.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* About Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">About {pet.name || 'this pet'}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {pet.description || 'No description available'}
                </p>
              </div>

              {/* Owner Info */}
              <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 font-medium mb-3">Posted by</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">🐾</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{getOwnerName()}</p>
                    <p className="text-sm text-gray-500">Member since {getOwnerJoinYear()}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-500 mb-8">
                <MapPin size={20} className="mr-2" />
                <span>Location will be shared after contacting owner</span>
              </div>

              {/* Contact Button */}
              {pet.availability && pet.owner.id && (
                <button
                  onClick={handleContactOwner}
                  disabled={chatLoading || String(pet.owner.id) === String(user?.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {chatLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Opening Chat...
                    </>
                  ) : String(pet.owner.id) === String(user?.id) ? (
                    'This is your listing'
                  ) : (
                    <>
                      <Mail size={20} />
                      Contact Owner
                    </>
                  )}
                </button>
              )}

              {!pet.availability && (
                <div className="w-full bg-gray-200 text-gray-600 py-4 rounded-xl text-center font-semibold">
                  This pet is no longer available
                </div>
              )}
            </div>
          </div>
        </div>

        
      </div>

      {showChat && conversation && (
        <ChatWindow
          conversation={conversation}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default PetDetails;