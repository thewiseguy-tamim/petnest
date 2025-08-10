import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { Upload, X, Trash2, RotateCcw } from 'lucide-react';
import petService from '../../services/petService';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import { ImageWithFallback, PLACEHOLDERS, getPetImageUrl } from '../../utils/imageUtils';

const MAX_UPLOAD_PER_REQUEST = 5;

const EditPetForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pet, setPet] = useState(null);

  // New images for upload (multiple)
  const [newImages, setNewImages] = useState([]);     // File[]
  const [newPreviews, setNewPreviews] = useState([]); // string[]

  const existingImages = useMemo(() => pet?.images_data || [], [pet]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const isForAdoption = watch('is_for_adoption');

  useEffect(() => {
    if (!id || id === 'undefined') {
      addNotification({
        type: 'error',
        title: 'Invalid Pet ID',
        message: 'No valid pet ID provided. Redirecting to your posts...',
        autoHide: true,
        duration: 3000,
      });
      setTimeout(() => navigate('/dashboard/client/posts'), 800);
      return;
    }
    fetchPetDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.pathname]);

  const fetchPetDetails = async () => {
    setLoading(true);
    try {
      const data = await petService.getPetDetails(id);
      setPet(data);
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
      addNotification({
        type: 'error',
        title: 'Error',
        message:
          error.response?.status === 404
            ? 'Pet not found. It may have been deleted or does not exist.'
            : 'Failed to load pet details.',
        autoHide: true,
        duration: 5000,
      });
      if (error.response?.status === 404) {
        setTimeout(() => navigate('/dashboard/client/posts'), 800);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const chunkArray = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  // New image selection
  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewImages((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeNewImageAt = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => {
      const toRevoke = prev[index];
      if (toRevoke) URL.revokeObjectURL(toRevoke);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetNewSelection = () => {
    newPreviews.forEach((u) => URL.revokeObjectURL(u));
    setNewImages([]);
    setNewPreviews([]);
  };

  // Upload additional images
  const onUploadNewImages = async () => {
    if (newImages.length === 0) {
      addNotification({
        type: 'info',
        title: 'No Images',
        message: 'Please select one or more images to upload.',
        autoHide: true,
        duration: 3000,
      });
      return;
    }
    try {
      const chunks = chunkArray(newImages, MAX_UPLOAD_PER_REQUEST);
      for (const part of chunks) {
        await petService.uploadPetImages(id, part);
      }
      addNotification({
        type: 'success',
        title: 'Images Uploaded',
        message: `${newImages.length} image(s) added to your listing.`,
        autoHide: true,
        duration: 4000,
      });
      resetNewSelection();
      await fetchPetDetails();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Failed to upload images.',
        autoHide: true,
        duration: 5000,
      });
    }
  };

  // Delete one photo (no browser alerts/confirm — deletes immediately and shows toast)
  const deleteImage = async (imageId) => {
    if (!imageId) return;

    // Optimistic UI: hide immediately
    const prev = pet;
    setPet((p) => ({
      ...p,
      images_data: (p?.images_data || []).filter((img) => img.id !== imageId),
    }));

    try {
      await api.delete(`/pets/images/${imageId}/delete/`);
      addNotification({
        type: 'success',
        title: 'Image Deleted',
        message: 'Photo removed from listing.',
        autoHide: true,
        duration: 3000,
      });
    } catch (error) {
      // Revert on failure
      setPet(prev);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: error.response?.data?.detail || 'Failed to delete image.',
        autoHide: true,
        duration: 5000,
      });
    }
  };

  // Save details only (PATCH JSON; image optional)
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        pet_type: data.pet_type,
        breed: data.breed,
        age: parseFloat(data.age),
        gender: data.gender,
        description: data.description,
        is_for_adoption: data.is_for_adoption,
        availability: data.availability,
        price: data.is_for_adoption ? null : (data.price ? parseFloat(data.price) : null),
      };

      await api.patch(`/pets/${id}/update/`, payload);
      addNotification({
        type: 'success',
        title: 'Pet Updated',
        message: 'Pet details have been updated.',
        autoHide: true,
        duration: 4000,
      });
      navigate(`/pets/${id}`);
    } catch (error) {
      let message = 'Failed to update pet listing. Please check your inputs.';
      const dataResp = error.response?.data;
      if (dataResp) {
        if (typeof dataResp === 'string') message = dataResp;
        else if (dataResp.detail) message = dataResp.detail;
        else {
          const fieldErrors = Object.entries(dataResp)
            .map(([f, errs]) => `${f}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
            .join('; ');
          if (fieldErrors) message = fieldErrors;
        }
      }
      addNotification({ type: 'error', title: 'Update Failed', message, autoHide: true, duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!id || id === 'undefined') {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600">Invalid Pet ID</h2>
        <p className="mt-2 text-gray-600">Redirecting to your posts...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600">Pet Not Found</h2>
        <p className="mt-2 text-gray-600">The pet you are trying to edit does not exist or has been deleted.</p>
        <Button onClick={() => navigate('/dashboard/client/posts')} className="mt-4">
          Back to My Posts
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Existing Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Existing Photos</h3>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => fetchPetDetails()}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {existingImages.length === 0 ? (
          <div className="text-sm text-gray-500">No images yet. Add some below.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((img, idx) => {
              const src = getPetImageUrl(pet, idx) || img?.image;
              return (
                <div key={img.id} className="relative group border rounded-md overflow-hidden">
                  <ImageWithFallback
                    src={src}
                    fallback={PLACEHOLDERS.THUMBNAIL}
                    alt={`Pet ${idx + 1}`}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => deleteImage(img.id)}
                      className="bg-white/90 rounded p-1 shadow-sm hover:bg-white"
                      title="Delete this image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Click the trash icon to delete a photo immediately.
        </p>
      </div>

      {/* Add New Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Add New Photos</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-2 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600 items-center justify-center">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#FFCAB0] hover:text-[#FFB090] focus-within:outline-none px-2 py-1">
                <span>Select images</span>
                <input type="file" multiple onChange={handleNewImagesChange} className="sr-only" accept="image/*" />
              </label>
              <p className="pl-2">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
            {newImages.length > 0 && (
              <div className="flex items-center gap-2 justify-center">
                <Button type="button" onClick={onUploadNewImages}>
                  Upload {newImages.length} image{newImages.length > 1 ? 's' : ''}
                </Button>
                <Button type="button" variant="outline" onClick={resetNewSelection}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* New image previews */}
        {newImages.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {newPreviews.map((src, idx) => (
                <div key={idx} className="relative border rounded-md overflow-hidden">
                  <img src={src} alt={`New ${idx}`} className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImageAt(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remove from selection"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We’ll upload in batches of {MAX_UPLOAD_PER_REQUEST} to meet the server limit.
            </p>
          </div>
        )}
      </div>

      {/* Pet fields */}
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
              min: { value: 0.01, message: 'Price must be positive' },
            })}
            error={errors.price?.message}
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
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
          Save Details
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