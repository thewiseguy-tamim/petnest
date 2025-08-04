import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Heart, Share2, MessageCircle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChatWindow from '../components/messaging/ChatWindow';
import petService from '../services/petService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

// ✅ Placeholders
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400?text=No+Image+Available';
const PLACEHOLDER_THUMBNAIL = 'https://placehold.co/80x80?text=No+Image';
const PLACEHOLDER_AVATAR = 'https://placehold.co/40x40?text=User';

// ✅ Cloudinary base URL
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/ducrwlapf';

// ✅ Proper URL resolver with slash fix
const resolveImageUrl = (img) => {
  if (!img) return null;
  return img.startsWith('http') ? img : `${CLOUDINARY_BASE_URL}/${img.replace(/^\/+/, '')}`;
};

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

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

  useEffect(() => {
    fetchPetDetails();
  }, [fetchPetDetails]);

  const getPrimaryImageUrl = () => {
    if (pet?.images_data?.length > 0) {
      const imgData = pet.images_data[selectedImage];
      const imageUrl = imgData?.image || (typeof imgData === 'string' ? imgData : null);
      const resolved = resolveImageUrl(imageUrl) || PLACEHOLDER_IMAGE;
      console.log('[PetDetails] Resolved main image:', resolved);
      return resolved;
    }

    if (pet?.image) {
      const resolved = resolveImageUrl(pet.image) || PLACEHOLDER_IMAGE;
      console.log('[PetDetails] Resolved fallback image:', resolved);
      return resolved;
    }

    return PLACEHOLDER_IMAGE;
  };

  const getThumbnailUrl = (img) => {
    const imageUrl = img?.image || (typeof img === 'string' ? img : null);
    return resolveImageUrl(imageUrl) || PLACEHOLDER_THUMBNAIL;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet not found</h2>
          <p className="text-gray-600 mb-4">The pet you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/pets')}
            className="bg-[#FFCAB0] text-white px-6 py-2 rounded-lg hover:bg-[#FFB090] transition-colors"
          >
            Browse Pets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="p-6">
              <div className="mb-4 relative">
                <img
                  src={getPrimaryImageUrl()}
                  alt={pet.name || 'Pet'}
                  className="w-full h-96 object-cover rounded-lg bg-gray-100"
                  onError={(e) => {
                    console.warn('[PetDetails] Image failed to load:', e.target.src);
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>

              {pet.images_data?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {pet.images_data.map((img, index) => (
                    <img
                      key={index}
                      src={getThumbnailUrl(img)}
                      alt={`${pet.name || 'Pet'} ${index + 1}`}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer flex-shrink-0 bg-gray-100 ${
                        selectedImage === index ? 'ring-2 ring-[#FFCAB0]' : ''
                      }`}
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_THUMBNAIL;
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pet Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{pet.name || 'Unnamed Pet'}</h1>
                  <p className="text-xl text-gray-600">{pet.breed || 'Unknown Breed'}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <Heart size={20} />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                {pet.is_for_adoption ? (
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                    <span className="font-semibold">Available for Adoption</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-[#FFCAB0]">
                    ${pet.price || 'N/A'}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{pet.age ? `${pet.age} years` : 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold capitalize">{pet.gender || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold capitalize">{pet.pet_type || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Posted</p>
                  <p className="font-semibold">
                    {pet.created_at ? new Date(pet.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">About {pet.name || 'this pet'}</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{pet.description || 'No description available'}</p>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Posted by</h3>
                <div className="flex items-center space-x-3">
                  {pet.owner?.profile_picture ? (
                    <img 
                      src={resolveImageUrl(pet.owner.profile_picture)} 
                      alt={getOwnerName()}
                      className="w-10 h-10 rounded-full object-cover bg-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"
                    style={{ display: pet.owner?.profile_picture ? 'none' : 'flex' }}
                  >
                    <span className="text-gray-600 font-medium">
                      {getOwnerInitials()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getOwnerName()}</p>
                    <p className="text-sm text-gray-600">Member since {getOwnerJoinYear()}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-6">
                <MapPin size={20} className="mr-2" />
                <span>Location will be shared after contacting owner</span>
              </div>

              {pet.availability && pet.owner.id && (
                <button
                  onClick={handleContactOwner}
                  disabled={chatLoading || String(pet.owner.id) === String(user?.id)}
                  className="w-full bg-[#FFCAB0] text-white py-3 rounded-lg hover:bg-[#FFB090] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <MessageCircle size={20} />
                      Contact Owner
                    </>
                  )}
                </button>
              )}

              {!pet.availability && (
                <div className="w-full bg-gray-200 text-gray-600 py-3 rounded-lg text-center">
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
