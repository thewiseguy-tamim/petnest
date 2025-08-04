// src/pages/ProfileSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Camera, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const ProfileSettings = () => {
  const { user, updateProfile, refreshUser, isAuthenticated, checkAuth } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Add state for the actual file
  const [error, setError] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      username: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postcode: '',
    },
  });

  const {
    register: registerVerification,
    handleSubmit: handleVerificationSubmit,
    formState: { errors: verificationErrors },
    setValue: setVerificationValue,
  } = useForm();

  // Fetch user status on mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserStatus();
    }
  }, [isAuthenticated]);

  const fetchUserStatus = async () => {
    try {
      const response = await api.get('/users/status/');
      setUserStatus(response.data);

      // If status is verified but local state doesn't reflect it, force update
      if (response.data.verification_status === 'verified' && 
          (!user?.verification_status || user.verification_status !== 'verified')) {
        await checkAuth();
      }
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    }
  };

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      reset({
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postcode: user.postcode || '',
      });
      setImagePreview(user.profile_picture);
    }
  }, [user, reset]);

  // Update verification form values
  useEffect(() => {
    if (showVerificationForm && user) {
      setVerificationValue('phone', user.phone || '');
      setVerificationValue('address', user.address || '');
      setVerificationValue('city', user.city || '');
      setVerificationValue('state', user.state || '');
      setVerificationValue('postcode', user.postcode || '');
    }
  }, [showVerificationForm, user, setVerificationValue]);

  const getVerificationStatusDisplay = () => {
    // Use userStatus if available, otherwise fall back to user data
    const status = userStatus?.verification_status || user?.verification_status;

    switch (status) {
      case 'verified':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Verified',
          color: 'text-green-700',
          bgColor: 'bg-green-50',
        };
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          text: 'Verification Pending',
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: 'Verification Rejected',
          color: 'text-red-700',
          bgColor: 'bg-red-50',
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
          text: 'Not Verified',
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const verificationStatus = getVerificationStatusDisplay();
  const isVerified = userStatus?.is_verified || user?.is_verified;
  const currentStatus = userStatus?.verification_status || user?.verification_status;
  const canSubmitVerification = !isVerified && currentStatus !== 'pending';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store the actual file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Check if we need to use FormData (when there's an image)
      if (imageFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('username', data.username);
        formData.append('phone', data.phone || '');
        formData.append('address', data.address || '');
        formData.append('city', data.city || '');
        formData.append('state', data.state || '');
        formData.append('postcode', data.postcode || '');
        formData.append('profile_picture', imageFile);

        // Send FormData with proper headers
        const response = await api.put('/users/profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Update user state with new data
        await refreshUser();
        
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.',
          autoHide: true,
          duration: 5000
        });

        // Clear the image file after successful upload
        setImageFile(null);
      } else {
        // Use regular JSON for non-file updates
        const updateData = {
          username: data.username,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          postcode: data.postcode || ''
        };

        await updateProfile(updateData);
        await refreshUser();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerificationSubmit = async (data) => {
    setVerificationLoading(true);
    setError(null);
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

      await api.post('/users/verification/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowVerificationForm(false);
      addNotification({
        type: 'success',
        title: 'Verification Submitted',
        message: 'Verification request submitted successfully! We will review your information soon.',
        autoHide: true,
        duration: 5000,
      });

      // Refresh both user data and status
      await fetchUserStatus();
      await refreshUser();
    } catch (error) {
      console.error('Verification submission error:', error);
      const errorMessage =
        error.response?.data?.nid_number?.[0] ||
        error.response?.data?.detail ||
        'Failed to submit verification. Please try again.';
      setError(errorMessage);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Fetch status first
      await fetchUserStatus();

      // Then refresh auth context
      await checkAuth();

      // Finally refresh user
      await refreshUser();

      addNotification({
        type: 'info',
        title: 'Status Refreshed',
        message: 'Verification status has been updated.',
        autoHide: true,
        duration: 3000,
      });
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please log in to view and edit your profile settings.</p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-800 text-sm rounded-lg mt-4 mx-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={imagePreview || '/api/placeholder/100/100'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-[#FFCAB0] rounded-full p-2 cursor-pointer hover:bg-[#FFB090]">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="sr-only"
                    accept="image/*"
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user?.username}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {imageFile && (
                  <p className="text-xs text-green-600 mt-1">New image selected</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Username"
                {...register('username', { required: 'Username is required' })}
                error={errors.username?.message}
              />
              <Input
                label="Phone"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
              />
              <Input
                label="Address"
                {...register('address')}
                error={errors.address?.message}
              />
              <Input
                label="City"
                {...register('city')}
                error={errors.city?.message}
              />
              <Input
                label="State"
                {...register('state')}
                error={errors.state?.message}
              />
              <Input
                label="Postcode"
                {...register('postcode')}
                error={errors.postcode?.message}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Verification Status Section - remains the same */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${verificationStatus.bgColor}`}>
              {verificationStatus.icon}
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p className={`text-sm font-medium ${verificationStatus.color}`}>
                  {verificationStatus.text}
                </p>
              </div>
            </div>
            {canSubmitVerification && (
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowVerificationForm(true)}
              >
                Start Verification
              </Button>
            )}
          </div>

          {currentStatus === 'pending' && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                Your verification is being reviewed. This usually takes 1-2 business days.
              </p>
            </div>
          )}

          {currentStatus === 'rejected' && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                Your verification was rejected. Please submit again with valid documents.
              </p>
            </div>
          )}
        </div>

        {/* Verification Form Modal - remains the same */}
        {showVerificationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Submit Verification</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Please provide your National ID and contact information for verification.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-800 text-sm rounded-lg mx-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerificationSubmit(onVerificationSubmit)} className="p-6 space-y-4">
                <Input
                  label="National ID Number"
                  placeholder="Enter your NID number"
                  {...registerVerification('nid_number', {
                    required: 'NID number is required',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'NID number must contain only numbers',
                    },
                  })}
                  error={verificationErrors.nid_number?.message}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NID Front Image
                    </label>
                    <input
                      type="file"
                      {...registerVerification('nid_front', { required: 'NID front image is required' })}
                      accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FFCAB0] file:text-white hover:file:bg-[#FFB090]"
                    />
                    {verificationErrors.nid_front && (
                      <p className="mt-1 text-sm text-red-600">{verificationErrors.nid_front.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NID Back Image
                    </label>
                    <input
                      type="file"
                      {...registerVerification('nid_back', { required: 'NID back image is required' })}
                      accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FFCAB0] file:text-white hover:file:bg-[#FFB090]"
                    />
                    {verificationErrors.nid_back && (
                      <p className="mt-1 text-sm text-red-600">{verificationErrors.nid_back.message}</p>
                    )}
                  </div>
                </div>

                <Input
                  label="Phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  {...registerVerification('phone', { required: 'Phone is required' })}
                  error={verificationErrors.phone?.message}
                />

                <Input
                  label="Address"
                  placeholder="Enter your street address"
                  {...registerVerification('address', { required: 'Address is required' })}
                  error={verificationErrors.address?.message}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    placeholder="City"
                    {...registerVerification('city', { required: 'City is required' })}
                    error={verificationErrors.city?.message}
                  />
                  <Input
                    label="State"
                    placeholder="State"
                    {...registerVerification('state', { required: 'State is required' })}
                    error={verificationErrors.state?.message}
                  />
                  <Input
                    label="Postcode"
                    placeholder="Postcode"
                    {...registerVerification('postcode', { required: 'Postcode is required' })}
                    error={verificationErrors.postcode?.message}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Make sure your NID images are clear and all information is visible.
                    Verification typically takes 1-2 business days.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowVerificationForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={verificationLoading}>
                    Submit Verification
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;