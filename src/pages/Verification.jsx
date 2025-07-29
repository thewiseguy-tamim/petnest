// src/pages/Verification.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, CheckCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import authService from '../services/authService';
import { useNotifications } from '../context/NotificationContext';

const Verification = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleImageChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setFrontPreview(reader.result);
        } else {
          setBackPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nid_number', data.nid_number);
      formData.append('nid_front', data.nid_front[0]);
      formData.append('nid_back', data.nid_back[0]);
      formData.append('phone', data.phone);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('state', data.state);
      formData.append('postcode', data.postcode);

      await authService.submitVerification(formData);
      
      addNotification({
        type: 'success',
        title: 'Verification Submitted',
        message: 'Your verification request has been submitted successfully.',
      });
      
      navigate('/dashboard/client');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error.response?.data?.detail || 'Failed to submit verification.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto h-12 w-12 text-[#FFCAB0]" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Verify Your Account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Complete verification to access all features and build trust with other users
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="National ID Number"
              {...register('nid_number', { required: 'NID number is required' })}
              error={errors.nid_number?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NID Front */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NID Front Side
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {frontPreview ? (
                    <img src={frontPreview} alt="Front" className="w-full h-32 object-cover rounded" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-1 text-xs text-gray-500">Upload front side</p>
                    </div>
                  )}
                  <input
                    type="file"
                    {...register('nid_front', { required: 'Front side is required' })}
                    onChange={(e) => handleImageChange(e, 'front')}
                    className="mt-2 w-full text-sm"
                    accept="image/*"
                  />
                  {errors.nid_front && (
                    <p className="mt-1 text-sm text-red-600">{errors.nid_front.message}</p>
                  )}
                </div>
              </div>

              {/* NID Back */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NID Back Side
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {backPreview ? (
                    <img src={backPreview} alt="Back" className="w-full h-32 object-cover rounded" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-1 text-xs text-gray-500">Upload back side</p>
                    </div>
                  )}
                  <input
                    type="file"
                    {...register('nid_back', { required: 'Back side is required' })}
                    onChange={(e) => handleImageChange(e, 'back')}
                    className="mt-2 w-full text-sm"
                    accept="image/*"
                  />
                  {errors.nid_back && (
                    <p className="mt-1 text-sm text-red-600">{errors.nid_back.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Phone Number"
                type="tel"
                {...register('phone', { required: 'Phone number is required' })}
                error={errors.phone?.message}
              />
              
              <Input
                label="City"
                {...register('city', { required: 'City is required' })}
                error={errors.city?.message}
              />
              
              <Input
                label="State"
                {...register('state', { required: 'State is required' })}
                error={errors.state?.message}
              />
              
              <Input
                label="Postcode"
                {...register('postcode', { required: 'Postcode is required' })}
                error={errors.postcode?.message}
              />
            </div>

            <Input
              label="Full Address"
              {...register('address', { required: 'Address is required' })}
              error={errors.address?.message}
            />

            <Button type="submit" loading={loading} className="w-full">
              Submit Verification
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Verification;