// src/services/petService.js
import apiClient from './api';

const petService = {
  // Get list of pets with filters
  getPets: async (params = {}) => {
    const response = await apiClient.get('/pets/list/', { params });
    return response.data;
  },

  // Get single pet details
  getPetDetails: async (id) => {
    const response = await apiClient.get(`/pets/${id}/`);
    return response.data;
  },

  // Create new pet listing
  createPet: async (petData) => {
    const formData = new FormData();
    Object.keys(petData).forEach(key => {
      if (key === 'image' && petData[key]) {
        formData.append(key, petData[key]);
      } else {
        formData.append(key, petData[key]);
      }
    });

    const response = await apiClient.post('/pets/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update pet listing
  updatePet: async (id, petData) => {
    const formData = new FormData();
    Object.keys(petData).forEach(key => {
      if (petData[key] !== null && petData[key] !== undefined) {
        if (key === 'image' && petData[key] instanceof File) {
          formData.append(key, petData[key]);
        } else {
          formData.append(key, petData[key]);
        }
      }
    });

    const response = await apiClient.patch(`/pets/${id}/update/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete pet listing (sets availability to false)
  deletePet: async (id) => {
    const response = await apiClient.delete(`/pets/${id}/delete/`);
    return response.data;
  },

  // Upload pet images
  uploadPetImages: async (id, images) => {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await apiClient.post(`/pets/${id}/upload-images/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async () => {
    const response = await apiClient.get('/pets/payment/history/');
    return response.data;
  },

  // Handle payment callback
  handlePaymentCallback: async (paymentData) => {
    const response = await apiClient.post('/pets/payment/callback/', paymentData);
    return response.data;
  },
};

export default petService;