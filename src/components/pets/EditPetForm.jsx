// src/components/pets/EditPetForm.jsx
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
    fetchPetDetails();
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      const data = await petService.getPetDetails(id);
      setPet(data);
      reset(data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load pet details.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await petService.updatePet(id, data);
      
      addNotification({
        type: 'success',
        title: 'Pet Updated',
        message: 'Pet listing has been updated successfully.',
      });
      
      navigate(`/pets/${id}`);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update pet listing. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

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
            { value: 'other', label: 'Other' },
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
            min: { value: 0, message: 'Age must be positive' }
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
            {...register('price', { 
              required: !isForAdoption ? 'Price is required for sale' : false,
              min: { value: 0, message: 'Price must be positive' }
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
          onClick={() => navigate(`/pets/${id}`)}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditPetForm;