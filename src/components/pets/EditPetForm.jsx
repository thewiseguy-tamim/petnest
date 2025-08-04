// src/components/pets/EditPetForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { Upload, X } from 'lucide-react';
import petService from '../../services/petService';
import { useNotifications } from '../../context/NotificationContext';

const EditPetForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pet, setPet] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const isForAdoption = watch('is_for_adoption');

  useEffect(() => {
    console.log('[EditPetForm] Current route:', location.pathname);
    console.log('[EditPetForm] Pet ID from useParams:', id);

    if (!id || id === 'undefined') {
      console.error('[EditPetForm] Invalid pet ID:', id);
      addNotification({
        type: 'error',
        title: 'Invalid Pet ID',
        message: 'No valid pet ID provided. Redirecting to your posts...',
        autoHide: true,
        duration: 3000
      });
      setTimeout(() => {
        navigate('/dashboard/client/posts');
      }, 1000);
      return;
    }

    console.log('[EditPetForm] Fetching pet details for ID:', id);
    fetchPetDetails();
  }, [id, location.pathname, navigate, addNotification]);

  const fetchPetDetails = async () => {
    try {
      const data = await petService.getPetDetails(id);
      console.log('[EditPetForm.fetchPetDetails] Pet data:', data);
      setPet(data);
      
      // Set existing image as preview
      if (data.images_data && data.images_data.length > 0) {
        setImagePreview(data.images_data[0].image);
      }
      
      reset({
        name: data.name || '',
        pet_type: data.pet_type || '',
        breed: data.breed || '',
        age: data.age || 0,
        gender: data.gender || '',
        description: data.description || '',
        is_for_adoption: data.is_for_adoption || false,
        price: data.price || 0,
        availability: data.availability || false,
      });
    } catch (error) {
      console.error('[EditPetForm.fetchPetDetails] Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.status === 404 
          ? 'Pet not found. It may have been deleted or does not exist.'
          : 'Failed to load pet details.',
        autoHide: true,
        duration: 5000
      });
      if (error.response?.status === 404) {
        setTimeout(() => {
          navigate('/dashboard/client/posts');
        }, 1000);
      }
    } finally {
      setLoading(false);
      console.log('[EditPetForm.fetchPetDetails] Loading completed, loading:', false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('[EditPetForm.handleImageChange] Selected image:', file.name);
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(pet?.images_data?.[0]?.image || null);
    setNewImage(null);
  };

  const onSubmit = async (data) => {
    console.log('[EditPetForm.onSubmit] Form data:', data);
    setSubmitting(true);
    try {
      const petData = {
        name: data.name,
        pet_type: data.pet_type,
        breed: data.breed,
        age: parseFloat(data.age),
        gender: data.gender,
        description: data.description,
        is_for_adoption: data.is_for_adoption,
        price: data.is_for_adoption ? null : parseFloat(data.price),
        availability: data.availability,
      };

      let imageToUpload = newImage;
      
      // If no new image selected but backend requires one, fetch the existing image
      if (!imageToUpload && pet.images_data?.[0]?.image) {
        try {
          const response = await fetch(pet.images_data[0].image);
          const blob = await response.blob();
          imageToUpload = new File([blob], 'existing-image.jpg', { type: 'image/jpeg' });
          console.log('[EditPetForm.onSubmit] Using existing image as file');
        } catch (error) {
          console.error('[EditPetForm.onSubmit] Failed to fetch existing image:', error);
        }
      }

      console.log('[EditPetForm.onSubmit] Submitting petData:', petData, 'with image:', imageToUpload);
      
      await petService.updatePet(id, petData, imageToUpload);

      addNotification({
        type: 'success',
        title: 'Pet Updated',
        message: 'Pet listing has been updated successfully.',
        autoHide: true,
        duration: 5000
      });

      navigate(`/pets/${id}`);
    } catch (error) {
      console.error('[EditPetForm.onSubmit] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update pet listing. Please try again.',
        autoHide: true,
        duration: 5000
      });
    } finally {
      setSubmitting(false);
      console.log('[EditPetForm.onSubmit] Submission completed, submitting:', false);
    }
  };

  if (loading) {
    console.log('[EditPetForm] Rendering loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!id || id === 'undefined') {
    console.log('[EditPetForm] Rendering invalid ID state');
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600">Invalid Pet ID</h2>
        <p className="mt-2 text-gray-600">
          Redirecting to your posts...
        </p>
      </div>
    );
  }

  if (!pet) {
    console.log('[EditPetForm] No pet data, rendering not found');
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600">Pet Not Found</h2>
        <p className="mt-2 text-gray-600">
          The pet you are trying to edit does not exist or has been deleted.
        </p>
        <Button
          onClick={() => navigate('/dashboard/client/posts')}
          className="mt-4"
        >
          Back to My Posts
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Pet Name"
          {...register('name', { required: 'Pet name is required' })}
          error={errors.name?.message}
        />

        <Select
          label="Pet Type"
          {...register('pet_type', { required: 'Pet type is required' })}
          options={[
            { value: 'cat', label: 'Cat' },
            { value: 'dog', label: 'Dog' },
          ]}
          error={errors.pet_type?.message}
        />

        <Input
          label="Breed"
          {...register('breed', { required: 'Breed is required' })}
          error={errors.breed?.message}
        />

        <Input
          label="Age (years)"
          type="number"
          step="0.1"
          {...register('age', {
            required: 'Age is required',
            min: { value: 0, message: 'Age must be positive' },
          })}
          error={errors.age?.message}
        />

        <Select
          label="Gender"
          {...register('gender', { required: 'Gender is required' })}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
          error={errors.gender?.message}
        />

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('is_for_adoption')}
              className="rounded border-gray-300 text-[#FFCAB0] focus:ring-[#FFCAB0]"
            />
            <span className="text-sm font-medium text-gray-700">
              Available for adoption (free)
            </span>
          </label>
        </div>

        {!isForAdoption && (
          <Input
            label="Price ($)"
            type="number"
            step="0.01"
            {...register('price', {
              required: !isForAdoption ? 'Price is required for sale' : false,
              min: { value: 0, message: 'Price must be positive' },
            })}
            error={errors.price?.message}
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0] focus:border-[#FFCAB0]"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pet Photo
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto h-32 w-32 object-cover rounded-lg"
                />
                {newImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ) : (
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#FFCAB0] hover:text-[#FFB090] focus-within:outline-none">
                <span>{imagePreview ? 'Change photo' : 'Upload a photo'}</span>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="sr-only"
                  accept="image/*"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            {newImage && (
              <p className="text-xs text-green-600 mt-2">New image selected</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('availability')}
          className="rounded border-gray-300 text-[#FFCAB0] focus:ring-[#FFCAB0]"
        />
        <label className="ml-2 text-sm text-gray-700">
          Available for adoption/sale
        </label>
      </div>

      <div className="flex space-x-4">
        <Button 
          type="submit" 
          loading={submitting} 
          className="flex-1"
        >
          Update Listing
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            console.log('[EditPetForm] Cancel button clicked, navigating to:', `/pets/${id}`);
            navigate(`/pets/${id}`);
          }}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditPetForm;