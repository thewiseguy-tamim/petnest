// src/services/petService.js
import api from './api'; // Changed from axiosInstance

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
};

export default petService;