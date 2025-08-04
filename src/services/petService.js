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

  updatePet: async (id, petData) => {
    try {
      const response = await api.put(`/pets/${id}/update/`, petData);
      console.log('[petService.updatePet] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.updatePet] Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.error || 
        'Failed to update pet listing'
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