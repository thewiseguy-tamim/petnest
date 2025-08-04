// src/services/petService.js
import api from './api';

const petService = {
  getPets: async (params = {}) => {
    try {
      const response = await api.get('/pets/list/', { params });
      console.log('[petService.getPets] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.getPets] Error:', error.response?.data || error.message);
      throw error;
    }
  },

  getPetDetails: async (id) => {
    try {
      const response = await api.get(`/pets/${id}/`);
      const petData = response.data;
      console.log('[petService.getPetDetails] Fetched pet:', petData);

      let ownerData = { username: petData.owner || 'Unknown User' };
      if (petData.owner) {
        try {
          const usersResponse = await api.get('/users/users/', {
            params: { username: petData.owner },
          });
          console.log('[petService.getPetDetails] Users response:', usersResponse.data);
          const user = Array.isArray(usersResponse.data) 
            ? usersResponse.data.find(u => u.username === petData.owner)
            : null;
          if (user) {
            ownerData = {
              id: user.id,
              username: user.username,
              date_joined: user.date_joined,
              profile_picture: user.profile_picture || null,
            };
            console.log('[petService.getPetDetails] Owner found:', ownerData);
          } else {
            console.warn(`[petService.getPetDetails] No user found for username: ${petData.owner}`);
          }
        } catch (error) {
          console.error('[petService.getPetDetails] Error fetching owner:', error.response?.data || error.message);
        }
      } else {
        console.warn('[petService.getPetDetails] No owner username in pet data');
      }

      const updatedPetData = {
        ...petData,
        owner: ownerData,
      };
      console.log('[petService.getPetDetails] Final pet data:', updatedPetData);
      return updatedPetData;
    } catch (error) {
      console.error('[petService.getPetDetails] Error fetching pet:', error.response?.data || error.message);
      throw error;
    }
  },

  getPaymentHistory: async () => {
    try {
      const response = await api.get('/pets/payment/history/');
      console.log('[petService.getPaymentHistory] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.getPaymentHistory] Error:', error.response?.data || error.message);
      return [];
    }
  },

  createPet: async (petData) => {
    try {
      const formData = new FormData();
      
      Object.keys(petData).forEach(key => {
        if (key === 'image' && petData[key]) {
          formData.append('images', petData[key]);
        } else if (petData[key] !== null && petData[key] !== undefined) {
          formData.append(key, petData[key]);
        }
      });

      const response = await api.post('/pets/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[petService.createPet] Success:', response.data);
      
      if (response.data.id) {
        try {
          await api.post('/users/posts/create/', { pet: response.data.id });
          console.log('[petService.createPet] Post created for pet');
        } catch (postError) {
          console.error('[petService.createPet] Failed to create post:', postError);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('[petService.createPet] Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.error || 
        'Failed to create pet listing'
      );
    }
  },

  updatePet: async (id, petData, imageFile = null) => {
    try {
      console.log('[petService.updatePet] Updating pet:', id, 'with data:', petData, 'image:', imageFile);
      
      // Use FormData to send both data and image
      const formData = new FormData();
      
      // Append all pet data fields
      formData.append('name', petData.name);
      formData.append('pet_type', petData.pet_type);
      formData.append('breed', petData.breed);
      formData.append('age', parseFloat(petData.age));
      formData.append('gender', petData.gender);
      formData.append('description', petData.description);
      formData.append('is_for_adoption', Boolean(petData.is_for_adoption));
      formData.append('price', petData.is_for_adoption ? '' : (petData.price ? parseFloat(petData.price) : ''));
      formData.append('availability', Boolean(petData.availability));
      
      // Append image if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      console.log('[petService.updatePet] Sending FormData with image:', !!imageFile);
      
      const response = await api.put(`/pets/${id}/update/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[petService.updatePet] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.updatePet] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      // Extract detailed error message
      let errorMessage = 'Failed to update pet listing';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          // If the error is an object with field errors
          const fieldErrors = Object.entries(error.response.data)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(', ')}`;
              }
              return `${field}: ${errors}`;
            })
            .join('; ');
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  uploadPetImages: async (petId, images) => {
    try {
      const formData = new FormData();
      
      // Handle multiple images
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      console.log('[petService.uploadPetImages] Uploading images for pet:', petId);
      
      const response = await api.post(`/pets/${petId}/upload-images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[petService.uploadPetImages] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.uploadPetImages] Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.error || 
        'Failed to upload images'
      );
    }
  },

  deletePet: async (id) => {
    try {
      const response = await api.delete(`/pets/${id}/delete/`);
      console.log('[petService.deletePet] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.deletePet] Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.error || 
        'Failed to delete pet listing'
      );
    }
  },
};

export default petService;