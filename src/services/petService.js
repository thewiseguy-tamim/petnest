import apiClient from './api';

const petService = {
  // Get list of pets with filters
  getPets: async (params = {}) => {
    console.log('[petService.getPets] Fetching pets with params:', params);
    try {
      const response = await apiClient.get('/pets/list/', { params });
      console.log('[petService.getPets] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.getPets] Error:', {
        status: error.response?.status,
        data: error$response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Get single pet details
  getPetDetails: async (id) => {
    console.log(`[petService.getPetDetails] Fetching pet with ID: ${id}`);
    try {
      const response = await apiClient.get(`/pets/${id}/`);
      console.log('[petService.getPetDetails] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.getPetDetails] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Create new pet listing
  createPet: async (petData) => {
    console.log('[petService.createPet] Preparing pet data:', petData);
    // Validate required fields
    const requiredFields = ['name', 'pet_type', 'breed', 'age', 'gender', 'description', 'is_for_adoption', 'image'];
    for (const field of requiredFields) {
      if (!petData[field] && petData[field] !== false) {
        console.error(`[petService.createPet] Validation failed: Missing required field: ${field}`);
        throw new Error(`Missing required field: ${field}`);
      }
    }
    // Validate pet_type and gender
    if (!['cat', 'dog'].includes(petData.pet_type)) {
      console.error('[petService.createPet] Validation failed: pet_type must be "cat" or "dog"', petData.pet_type);
      throw new Error('pet_type must be "cat" or "dog"');
    }
    if (!['male', 'female'].includes(petData.gender)) {
      console.error('[petService.createPet] Validation failed: gender must be "male" or "female"', petData.gender);
      throw new Error('gender must be "male" or "female"');
    }
    // Validate age
    if (isNaN(petData.age) || petData.age < 0) {
      console.error('[petService.createPet] Validation failed: age must be a positive number', petData.age);
      throw new Error('age must be a positive number');
    }
    // Validate price based on is_for_adoption
    if (petData.is_for_adoption && petData.price !== null && petData.price !== undefined) {
      console.error('[petService.createPet] Validation failed: price must be null for adoption listings', petData.price);
      throw new Error('price must be null for adoption listings');
    }
    if (!petData.is_for_adoption && (!petData.price || petData.price <= 0)) {
      console.error('[petService.createPet] Validation failed: price is required and must be positive for sale listings', petData.price);
      throw new Error('price is required and must be positive for sale listings');
    }
    // Ensure image is a File object
    if (petData.image && !(petData.image instanceof File)) {
      console.error('[petService.createPet] Validation failed: image must be a valid File object', petData.image);
      throw new Error('image must be a valid File object');
    }

    const formData = new FormData();
    Object.keys(petData).forEach(key => {
      if (key === 'image' && petData[key]) {
        formData.append(key, petData[key]);
      } else if (petData[key] !== null && petData[key] !== undefined) {
        formData.append(key, petData[key]);
      }
    });

    // Log FormData entries
    console.log('[petService.createPet] FormData payload:');
    for (let [key, value] of formData.entries()) {
      console.log(`[petService.createPet] ${key}:`, value);
    }

    try {
      const response = await apiClient.post('/pets/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[petService.createPet] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.createPet] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Update pet listing
  updatePet: async (id, petData) => {
    console.log(`[petService.updatePet] Updating pet ID: ${id} with data:`, petData);
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

    console.log('[petService.updatePet] FormData payload:');
    for (let [key, value] of formData.entries()) {
      console.log(`[petService.updatePet] ${key}:`, value);
    }

    try {
      const response = await apiClient.patch(`/pets/${id}/update/`, formData, {
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
      throw error;
    }
  },

  // Delete pet listing (sets availability to false)
  deletePet: async (id) => {
    console.log(`[petService.deletePet] Deleting pet ID: ${id}`);
    try {
      const response = await apiClient.delete(`/pets/${id}/delete/`);
      console.log('[petService.deletePet] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.deletePet] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Upload pet images
  uploadPetImages: async (id, images) => {
    console.log(`[petService.uploadPetImages] Uploading images for pet ID: ${id}`, images);
    if (!images || images.length === 0) {
      console.error('[petService.uploadPetImages] Validation failed: At least one image is required');
      throw new Error('At least one image is required');
    }
    if (images.length > 5) {
      console.error('[petService.uploadPetImages] Validation failed: Maximum 5 images allowed');
      throw new Error('Maximum 5 images allowed');
    }
    const formData = new FormData();
    images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append('images', image);
        console.log(`[petService.uploadPetImages] Appending image ${index + 1}:`, image.name);
      }
    });

    try {
      const response = await apiClient.post(`/pets/${id}/upload-images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[petService.uploadPetImages] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.uploadPetImages] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    console.log('[petService.getPaymentHistory] Fetching payment history');
    try {
      const response = await apiClient.get('/pets/payment/history/');
      console.log('[petService.getPaymentHistory] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.getPaymentHistory] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Handle payment callback
  handlePaymentCallback: async (paymentData) => {
    console.log('[petService.handlePaymentCallback] Handling payment callback with data:', paymentData);
    try {
      const response = await apiClient.post('/pets/payment/callback/', paymentData);
      console.log('[petService.handlePaymentCallback] Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[petService.handlePaymentCallback] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};

export default petService;