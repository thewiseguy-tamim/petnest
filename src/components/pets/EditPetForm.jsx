import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import petService from '../../services/petService';
import { useNotifications } from '../../context/NotificationContext';

const EditPetForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pet, setPet] = useState(null);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const isForAdoption = watch('is_for_adoption');

  useEffect(() => {
    console.log('[EditPetForm] Fetching pet details for ID:', id);
    fetchPetDetails();
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      const data = await petService.getPetDetails(id);
      console.log('[EditPetForm.fetchPetDetails] Pet data:', data);
      setPet(data);
      reset({
        name: data.name,
        pet_type: data.pet_type,
        breed: data.breed,
        age: data.age,
        gender: data.gender,
        description: data.description,
        is_for_adoption: data.is_for_adoption,
        price: data.price,
        availability: data.availability,
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
        message: 'Failed to load pet details.',
      });
    } finally {
      setLoading(false);
      console.log('[EditPetForm.fetchPetDetails] Loading completed, loading:', false);
    }
  };

  const onSubmit = async (data) => {
    console.log('[EditPetForm.onSubmit] Form data:', data);
    setSubmitting(true);
    try {
      // Prepare petData for petService.updatePet
      const petData = {
        name: data.name,
        pet_type: data.pet_type,
        breed: data.breed,
        age: parseFloat(data.age), // Ensure age is a number
        gender: data.gender,
        description: data.description,
        is_for_adoption: data.is_for_adoption,
        price: data.is_for_adoption ? null : parseFloat(data.price), // Set price to null for adoption
        availability: data.availability,
        // Note: Image updates are not supported in this form
      };

      console.log('[EditPetForm.onSubmit] Submitting petData:', petData);
      await petService.updatePet(id, petData);

      addNotification({
        type: 'success',
        title: 'Pet Updated',
        message: 'Pet listing has been updated successfully.',
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
      });
    } finally {
      setSubmitting(false);
      console.log('[EditPetForm.onSubmit] Submission completed, submitting:', false);
    }
  };

  if (loading) {
    console.log('[EditPetForm] Rendering loading state');
    return <LoadingSpinner />;
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
        <Button type="submit" loading={submitting} className="flex-1">
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