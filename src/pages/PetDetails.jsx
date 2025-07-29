// src/pages/PetDetails.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Heart, Share2, MessageCircle } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChatWindow from '../components/messaging/ChatWindow';
import petService from '../services/petService';
import messageService from '../services/messageService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [conversation, setConversation] = useState(null);

  const fetchPetDetails = useCallback(async () => {
    try {
      const data = await petService.getPetDetails(id);
      setPet(data);
    } catch (error) {
      toast.error('Failed to fetch pet details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPetDetails();
  }, [fetchPetDetails]);

  const handleContactOwner = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact the owner');
      navigate('/login');
      return;
    }

    // Check if user is trying to contact themselves
    if (pet?.owner?.id === user?.id) {
      toast.error("You can't message yourself!");
      return;
    }

    try {
      // Check if conversation already exists
      const conversations = await messageService.getConversations();
      const existingConversation = conversations.find(
        conv => conv.other_user.id === pet.owner.id && conv.pet.id === pet.id
      );

      if (existingConversation) {
        setConversation({
          other_user: pet.owner,
          pet: pet,
          pet_detail: pet,
          latest_message: existingConversation.latest_message,
          unread_count: existingConversation.unread_count
        });
      } else {
        // Create a new conversation context
        setConversation({
          other_user: pet.owner,
          pet: pet,
          pet_detail: pet,
          latest_message: null,
          unread_count: 0
        });
      }
      
      setShowChat(true);
    } catch (error) {
      console.error('Error setting up conversation:', error);
      toast.error('Failed to open chat');
    }
  };

  // Helper function to get owner initials safely
  const getOwnerInitials = () => {
    if (!pet?.owner?.username) return 'U';
    return pet.owner.username.charAt(0).toUpperCase();
  };

  // Helper function to get owner display name safely
  const getOwnerName = () => {
    return pet?.owner?.username || 'Unknown User';
  };

  // Helper function to get owner join year safely
  const getOwnerJoinYear = () => {
    if (!pet?.owner?.date_joined) return 'Unknown';
    return new Date(pet.owner.date_joined).getFullYear();
  };

  if (loading) return <LoadingSpinner />;
  if (!pet) return <div>Pet not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="p-6">
              <div className="mb-4">
                <img
                  src={pet.images_data?.[selectedImage]?.image || pet.image || '/api/placeholder/600/400'}
                  alt={pet.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              {pet.images_data?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {pet.images_data.map((img, index) => (
                    <img
                      key={index}
                      src={img.image}
                      alt={`${pet.name} ${index + 1}`}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer ${
                        selectedImage === index ? 'ring-2 ring-[#FFCAB0]' : ''
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pet Information */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{pet.name}</h1>
                  <p className="text-xl text-gray-600">{pet.breed}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                    <Heart size={20} />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Price/Adoption Status */}
              <div className="mb-6">
                {pet.is_for_adoption ? (
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                    <span className="font-semibold">Available for Adoption</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-[#FFCAB0]">
                    ${pet.price}
                  </div>
                )}
              </div>

              {/* Pet Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{pet.age} years</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold capitalize">{pet.gender}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold capitalize">{pet.pet_type}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Posted</p>
                  <p className="font-semibold">
                    {new Date(pet.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">About {pet.name}</h3>
                <p className="text-gray-600">{pet.description}</p>
              </div>

              {/* Owner Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Posted by</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
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

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-6">
                <MapPin size={20} className="mr-2" />
                <span>Location will be shared after contacting owner</span>
              </div>

              {/* Contact Button */}
              {pet.availability && (
                <button
                  onClick={handleContactOwner}
                  className="w-full bg-[#FFCAB0] text-white py-3 rounded-lg hover:bg-[#FFB090] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  Contact Owner
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

      {/* Chat Window */}
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