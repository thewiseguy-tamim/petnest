// src/pages/ProfileSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Camera, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, User, Shield, MapPin, Phone, Mail, Home, PawPrint } from 'lucide-react';
import api from '../services/api';
import { getAvatarUrl, ImageWithFallback, PLACEHOLDERS } from '../utils/imageUtils';

const ProfileSettings = () => {
  const { user, updateProfile, refreshUser, isAuthenticated, checkAuth } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserStatus();
    }
  }, [isAuthenticated]);

  const fetchUserStatus = async () => {
    try {
      const response = await api.get('/users/status/');
      setUserStatus(response.data);

      if (response.data.verification_status === 'verified' && 
          (!user?.verification_status || user.verification_status !== 'verified')) {
        await checkAuth();
      }
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    }
  };

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
      setImagePreview(getAvatarUrl(user));
    }
  }, [user, reset]);

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
    const status = userStatus?.verification_status || user?.verification_status;

    switch (status) {
      case 'verified':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Verified',
          color: 'text-[#009966]',
          bgColor: 'bg-[#009966]/10',
          borderColor: 'border-[#009966]/20',
        };
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5" />,
          text: 'Verification Pending',
          color: 'text-[#F59E0B]',
          bgColor: 'bg-[#F59E0B]/10',
          borderColor: 'border-[#F59E0B]/20',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5" />,
          text: 'Verification Rejected',
          color: 'text-[#EF4444]',
          bgColor: 'bg-[#EF4444]/10',
          borderColor: 'border-[#EF4444]/20',
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          text: 'Not Verified',
          color: 'text-[#3F3D56]',
          bgColor: 'bg-[#3F3D56]/10',
          borderColor: 'border-[#3F3D56]/20',
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
      setImageFile(file);
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
      if (imageFile) {
        const formData = new FormData();
        formData.append('username', data.username);
        formData.append('phone', data.phone || '');
        formData.append('address', data.address || '');
        formData.append('city', data.city || '');
        formData.append('state', data.state || '');
        formData.append('postcode', data.postcode || '');
        formData.append('profile_picture', imageFile);

        const response = await api.put('/users/profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        await refreshUser();
        
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.',
          autoHide: true,
          duration: 5000
        });

        setImageFile(null);
      } else {
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
      await fetchUserStatus();
      await checkAuth();
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
      <div className="min-h-screen bg-[#fafaf5] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-[#009966]/10 p-8 text-center">
            <div className="w-16 h-16 bg-[#FFEFB5] rounded-full flex items-center justify-center mx-auto mb-4">
              <PawPrint className="w-8 h-8 text-[#009966]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0F0F0F] mb-2">Authentication Required</h1>
            <p className="text-[#3F3D56] mb-6">Please log in to view and edit your profile settings.</p>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-[#009966] hover:bg-[#007755] text-white"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf5] py-8 pt-33">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F0F0F] mb-2">Profile Settings</h1>
          <p className="text-[#3F3D56]">Manage your account information and verification status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-[#009966]/10 p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <ImageWithFallback
                    src={imagePreview || getAvatarUrl(user)}
                    fallback={PLACEHOLDERS.AVATAR}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#FFEFB5]"
                  />
                  <label className="absolute bottom-0 right-0 bg-[#009966] rounded-full p-3 cursor-pointer hover:bg-[#007755] transition-colors shadow-lg">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="sr-only"
                      accept="image/*"
                    />
                  </label>
                </div>
                <h3 className="text-xl font-semibold text-[#0F0F0F] mb-1">{user?.username}</h3>
                <p className="text-[#3F3D56] flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                {imageFile && (
                  <p className="text-sm text-[#009966] mt-2 flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    New image selected
                  </p>
                )}
              </div>

              {/* Verification Status Card */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[#0F0F0F] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#009966]" />
                    Verification Status
                  </h4>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="text-[#009966] hover:text-[#007755] transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className={`p-3 rounded-xl border ${verificationStatus.borderColor} ${verificationStatus.bgColor}`}>
                  <div className="flex items-center gap-2">
                    <span className={verificationStatus.color}>{verificationStatus.icon}</span>
                    <span className={`font-medium ${verificationStatus.color}`}>
                      {verificationStatus.text}
                    </span>
                  </div>
                </div>

                {canSubmitVerification && (
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setShowVerificationForm(true)}
                    className="w-full mt-3 border-[#009966] text-[#009966] hover:bg-[#009966] hover:text-white"
                  >
                    Start Verification
                  </Button>
                )}

                {currentStatus === 'pending' && (
                  <div className="mt-3 p-3 bg-[#F59E0B]/10 rounded-lg">
                    <p className="text-xs text-[#F59E0B]">
                      Your verification is being reviewed. This usually takes 1-2 business days.
                    </p>
                  </div>
                )}

                {currentStatus === 'rejected' && (
                  <div className="mt-3 p-3 bg-[#EF4444]/10 rounded-lg">
                    <p className="text-xs text-[#EF4444]">
                      Your verification was rejected. Please submit again with valid documents.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-[#009966]/10 p-6">
              <h3 className="text-xl font-semibold text-[#0F0F0F] mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#009966]" />
                Personal Information
              </h3>
                        {error && (
            <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F] mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#009966]" />
                  Username
                </label>
                <Input
                  {...register('username', { required: 'Username is required' })}
                  error={errors.username?.message}
                  className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F] mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#009966]" />
                  Phone
                </label>
                <Input
                  type="tel"
                  {...register('phone')}
                  error={errors.phone?.message}
                  className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F0F0F] mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-[#009966]" />
                Address
              </label>
              <Input
                {...register('address')}
                error={errors.address?.message}
                className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F] mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#009966]" />
                  City
                </label>
                <Input
                  {...register('city')}
                  error={errors.city?.message}
                  className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F] mb-2">State</label>
                <Input
                  {...register('state')}
                  error={errors.state?.message}
                  className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F] mb-2">Postcode</label>
                <Input
                  {...register('postcode')}
                  error={errors.postcode?.message}
                  className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                loading={loading}
                className="bg-[#009966] hover:bg-[#007755] text-white px-8"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>

    {/* Verification Form Modal */}
    {showVerificationForm && (
      <div className="fixed inset-0 bg-[#0F0F0F]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#009966]/10 to-[#FFEFB5]/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#009966] rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F0F0F]">Submit Verification</h2>
                <p className="text-sm text-[#3F3D56] mt-0.5">
                  Verify your identity to adopt pets and build trust
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {error && (
              <div className="m-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerificationSubmit(onVerificationSubmit)} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                  National ID Number
                </label>
                <Input
                  placeholder="Enter your NID number"
                  {...registerVerification('nid_number', {
                    required: 'NID number is required',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'NID number must contain only numbers',
                    },
                  })}
                  error={verificationErrors.nid_number?.message}
                  className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                    NID Front Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      {...registerVerification('nid_front', { required: 'NID front image is required' })}
                      accept="image/*"
                      className="w-full text-sm text-[#3F3D56] file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#FFEFB5] file:text-[#0F0F0F] hover:file:bg-[#FFE599] file:transition-colors cursor-pointer"
                    />
                  </div>
                  {verificationErrors.nid_front && (
                    <p className="mt-1 text-sm text-[#EF4444]">{verificationErrors.nid_front.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                    NID Back Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      {...registerVerification('nid_back', { required: 'NID back image is required' })}
                      accept="image/*"
                      className="w-full text-sm text-[#3F3D56] file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#FFEFB5] file:text-[#0F0F0F] hover:file:bg-[#FFE599] file:transition-colors cursor-pointer"
                    />
                  </div>
                  {verificationErrors.nid_back && (
                    <p className="mt-1 text-sm text-[#EF4444]">{verificationErrors.nid_back.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-4 bg-[#009966]/5 rounded-xl border border-[#009966]/10">
                <h3 className="text-sm font-semibold text-[#0F0F0F] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#009966]" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    {...registerVerification('phone', { required: 'Phone is required' })}
                    error={verificationErrors.phone?.message}
                    className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                  />
                  
                  <Input
                    label="Address"
                    placeholder="Enter your street address"
                    {...registerVerification('address', { required: 'Address is required' })}
                    error={verificationErrors.address?.message}
                    className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    placeholder="City"
                    {...registerVerification('city', { required: 'City is required' })}
                    error={verificationErrors.city?.message}
                    className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                  />
                  <Input
                    label="State"
                    placeholder="State"
                    {...registerVerification('state', { required: 'State is required' })}
                    error={verificationErrors.state?.message}
                    className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                  />
                  <Input
                    label="Postcode"
                    placeholder="Postcode"
                    {...registerVerification('postcode', { required: 'Postcode is required' })}
                    error={verificationErrors.postcode?.message}
                    className="border-[#009966]/20 focus:border-[#009966] focus:ring-[#009966]/20"
                  />
                </div>
              </div>

              <div className="bg-[#009966]/10 p-4 rounded-xl border border-[#009966]/20">
                <div className="flex gap-3">
                  <PawPrint className="w-5 h-5 text-[#009966] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#0F0F0F] font-medium mb-1">Important Notes:</p>
                    <ul className="text-sm text-[#3F3D56] space-y-1">
                      <li>• Make sure your NID images are clear and all information is visible</li>
                      <li>• Verification typically takes 1-2 business days</li>
                      <li>• Verified users can adopt pets and build trust in our community</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowVerificationForm(false)}
              className="border-[#3F3D56]/20 text-[#3F3D56] hover:bg-[#3F3D56]/5"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerificationSubmit(onVerificationSubmit)}
              loading={verificationLoading}
              className="bg-[#009966] hover:bg-[#007755] text-white"
            >
              Submit Verification
            </Button>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
);
};

export default ProfileSettings;