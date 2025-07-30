import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Upload } from 'lucide-react';
import petService from '../../services/petService';
import { useNotifications } from '../../context/NotificationContext';

const CreatePetForm = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      is_for_adoption: false,
      availability: true,
    },
  });

  const isForAdoption = watch('is_for_adoption');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('[CreatePetForm.handleImageChange] Selected image:', file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('[CreatePetForm.handleImageChange] No image selected');
      setImagePreview(null);
    }
  };

  const onSubmit = async (data) => {
    console.log('[CreatePetForm.onSubmit] Form data:', data);
    setLoading(true);
    try {
      // Prepare petData for petService.createPet
      const petData = {
        name: data.name,
        pet_type: data.pet_type,
        breed: data.breed,
        age: parseFloat(data.age), // Ensure age is a number
        gender: data.gender,
        description: data.description,
        is_for_adoption: data.is_for_adoption,
        price: data.is_for_adoption ? null : parseFloat(data.price), // Set price to null for adoption
        image: data.image[0], // File object from input
        availability: data.availability,
      };

      console.log('[CreatePetForm.onSubmit] Submitting petData:', petData);
      const response = await petService.createPet(petData);

      addNotification({
        type: 'success',
        title: 'Pet Listed Successfully',
        message: 'Your pet listing has been published.',
      });

      navigate(`/pets/${response.id}`);
    } catch (error) {
      console.error('[CreatePetForm.onSubmit] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      addNotification({
        type: 'error',
        title: 'Listing Failed',
        message: error.message || 'Failed to create pet listing. Please try again.',
      });
    } finally {
      setLoading(false);
      console.log('[CreatePetForm.onSubmit] Submission completed, loading:', false);
    }
  };

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
          placeholder="Describe your pet's personality, habits, and any special needs..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pet Photo
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="mx-auto h-32 w-32 object-cover rounded-lg"
              />
            ) : (
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#FFCAB0] hover:text-[#FFB090] focus-within:outline-none">
                <span>Upload a file</span>
                <input
                  type="file"
                  {...register('image', { required: 'Pet photo is required' })}
                  onChange={handleImageChange}
                  className="sr-only"
                  accept="image/*"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('availability')}
          defaultChecked={true}
          className="rounded border-gray-300 text-[#FFCAB0] focus:ring-[#FFCAB0]"
        />
        <label className="ml-2 text-sm text-gray-700">
          Mark as available immediately
        </label>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Create Listing
      </Button>
    </form>
  );
};

export default CreatePetForm;