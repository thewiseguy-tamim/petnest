import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Camera, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profile_picture || '/api/placeholder/100/100');
  const [userStatus, setUserStatus] = useState({
    is_verified: user?.is_verified || false,
    verification_status: null,
    profile_picture: user?.profile_picture || '/api/placeholder/100/100',
    has_verification_request: false,
  });
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const { addNotification } = useNotifications();
  const previousStatusRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      username: user?.username || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      postcode: user?.postcode || '',
    },
  });

  const {
    register: registerVerification,
    handleSubmit: handleVerificationSubmit,
    formState: { errors: verificationErrors },
    setValue: setVerificationValue,
  } = useForm();

  const fetchUserStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const response = await api.get('/users/status/');
      const newStatus = response.data;
      console.log('User status response:', JSON.stringify(newStatus, null, 2));

      // Check if backend has been updated to use null for verification_status
      const isBackendUpdated = newStatus.verification_status === null || newStatus.verification_status === undefined;

      // Determine if a verification request exists
      const hasVerificationRequest = isBackendUpdated
        ? newStatus.verification_status && ['pending', 'approved', 'rejected'].includes(newStatus.verification_status)
        : newStatus.verification_status &&
          ['pending', 'approved', 'rejected'].includes(newStatus.verification_status) &&
          user?.nid_number;

      const verificationStatus = hasVerificationRequest ? newStatus.verification_status : null;

      const updatedStatus = {
        is_verified: !!newStatus.is_verified,
        verification_status: verificationStatus,
        profile_picture: newStatus.profile_picture || '/api/placeholder/100/100',
        has_verification_request: hasVerificationRequest,
      };

      setUserStatus(updatedStatus);
      setError(null);

      if (
        previousStatusRef.current &&
        previousStatusRef.current.verification_status !== verificationStatus &&
        verificationStatus === 'approved'
      ) {
        addNotification({
          type: 'success',
          title: 'Verification Approved',
          message: 'Your account has been successfully verified!',
        });
      }
      previousStatusRef.current = { ...updatedStatus };
    } catch (error) {
      console.error('Failed to fetch user status:', error);
      setError('Failed to load verification status. Please try again.');
      addNotification({ type: 'error', title: 'Error', message: 'Failed to load verification status.' });
    } finally {
      setStatusLoading(false);
    }
  }, [addNotification, user?.nid_number]);

  useEffect(() => {
    fetchUserStatus();
    const intervalId = setInterval(fetchUserStatus, 30000);
    return () => clearInterval(intervalId);
  }, [fetchUserStatus]);

  useEffect(() => {
    if (user?.profile_picture && user.profile_picture !== imagePreview) {
      setImagePreview(user.profile_picture);
    }
  }, [user?.profile_picture, imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setValue('profile_picture', file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key]) {
          formData.append(key, data[key]);
        }
      });

      const response = await api.post('/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedProfile = response.data;
      setImagePreview(updatedProfile.profile_picture || '/api/placeholder/100/100');
      setUserStatus((prev) => ({ ...prev, profile_picture: updatedProfile.profile_picture || '/api/placeholder/100/100' }));
      await updateProfile(updatedProfile);
      addNotification({ type: 'success', title: 'Profile Updated', message: 'Your profile has been updated.' });
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update profile. Please check the image and try again.';
      setError(errorMessage);
      addNotification({ type: 'error', title: 'Error', message: errorMessage });
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowVerificationForm(false);
      addNotification({
        type: 'success',
        title: 'Verification Submitted',
        message: 'Your verification request has been submitted! We will review it soon.',
      });
      await fetchUserStatus();
    } catch (error) {
      console.error('Verification submission error:', error);
      const errorMessage = error.response?.data?.nid_number?.[0] || error.response?.data?.detail || 'Failed to submit verification.';
      setError(errorMessage);
      addNotification({ type: 'error', title: 'Error', message: errorMessage });
    } finally {
      setVerificationLoading(false);
    }
  };

  const getVerificationStatusDisplay = () => {
    const { is_verified, verification_status, has_verification_request } = userStatus;

    if (is_verified || verification_status === 'approved') {
      return {
        icon: <CheckCircle className="w-5 h-5 text-[#10B981]" />,
        text: 'Verified',
        color: 'text-[#10B981]',
        bgColor: 'bg-[#10B981]/10',
      };
    }

    if (has_verification_request && verification_status === 'pending') {
      return {
        icon: <Clock className="w-5 h-5 text-[#F59E0B]" />,
        text: 'Verification Pending',
        color: 'text-[#F59E0B]',
        bgColor: 'bg-[#F59E0B]/10',
      };
    }

    if (has_verification_request && verification_status === 'rejected') {
      return {
        icon: <XCircle className="w-5 h-5 text-[#EF4444]" />,
        text: 'Verification Rejected',
        color: 'text-[#EF4444]',
        bgColor: 'bg-[#EF4444]/10',
      };
    }

    return {
      icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
      text: 'Not Verified',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
    };
  };

  const verificationStatus = getVerificationStatusDisplay();
  const canSubmitVerification = !statusLoading &&
    !userStatus.is_verified &&
    (!userStatus.has_verification_request || userStatus.verification_status === 'rejected');

  useEffect(() => {
    if (showVerificationForm && user) {
      setVerificationValue('phone', user.phone || '');
      setVerificationValue('address', user.address || '');
      setVerificationValue('city', user.city || '');
      setVerificationValue('state', user.state || '');
      setVerificationValue('postcode', user.postcode || '');
    }
  }, [showVerificationForm, user, setVerificationValue]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          </div>

          {error && <div className="p-4 bg-[#EF4444]/10 text-[#EF4444] text-sm rounded-lg mt-4 mx-6">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => { e.target.src = '/api/placeholder/100/100'; }}
                />
                <label className="absolute bottom-0 right-0 bg-[#FFCAB0] rounded-full p-2 cursor-pointer hover:bg-[#FFB090]">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    {...register('profile_picture')}
                    onChange={handleImageChange}
                    className="sr-only"
                    accept="image/*"
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user?.username}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Username" {...register('username', { required: 'Username is required' })} error={errors.username?.message} />
              <Input label="Phone" type="tel" {...register('phone')} error={errors.phone?.message} />
              <Input label="Address" {...register('address')} error={errors.address?.message} />
              <Input label="City" {...register('city')} error={errors.city?.message} />
              <Input label="State" {...register('state')} error={errors.state?.message} />
              <Input label="Postcode" {...register('postcode')} error={errors.postcode?.message} />
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={loading}>Save Changes</Button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h2>
          {statusLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#3B82F6]"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${verificationStatus.bgColor}`}>
                {verificationStatus.icon}
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className={`text-sm font-medium ${verificationStatus.color}`}>{verificationStatus.text}</p>
                </div>
              </div>
              {canSubmitVerification && (
                <Button variant="outline" size="small" onClick={() => setShowVerificationForm(true)}>
                  Start Verification
                </Button>
              )}
            </div>
          )}

          {userStatus.has_verification_request && userStatus.verification_status === 'pending' && (
            <div className="mt-4 p-4 bg-[#F59E0B]/10 rounded-lg">
              <p className="text-sm text-[#F59E0B]">Your verification is being reviewed. This usually takes 1-2 business days.</p>
            </div>
          )}

          {userStatus.has_verification_request && userStatus.verification_status === 'rejected' && (
            <div className="mt-4 p-4 bg-[#EF4444]/10 rounded-lg">
              <p className="text-sm text-[#EF4444]">Your verification was rejected. Please submit again with valid documents.</p>
            </div>
          )}
        </div>

        {showVerificationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Submit Verification</h2>
                <p className="text-sm text-gray-600 mt-1">Please provide your National ID and contact information for verification.</p>
              </div>

              {error && <div className="p-4 bg-[#EF4444]/10 text-[#EF4444] text-sm rounded-lg mx-6">{error}</div>}

              <form onSubmit={handleVerificationSubmit(onVerificationSubmit)} className="p-6 space-y-4">
                <Input
                  label="National ID Number"
                  placeholder="Enter your NID number"
                  {...registerVerification('nid_number', { required: 'NID number is required', pattern: { value: /^[0-9]+$/, message: 'NID number must contain only numbers' } })}
                  error={verificationErrors.nid_number?.message}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NID Front Image</label>
                    <input
                      type="file"
                      {...registerVerification('nid_front', { required: 'NID front image is required' })}
                      accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FFCAB0] file:text-white hover:file:bg-[#FFB090]"
                    />
                    {verificationErrors.nid_front && <p className="mt-1 text-sm text-[#EF4444]">{verificationErrors.nid_front.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NID Back Image</label>
                    <input
                      type="file"
                      {...registerVerification('nid_back', { required: 'NID back image is required' })}
                      accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FFCAB0] file:text-white hover:file:bg-[#FFB090]"
                    />
                    {verificationErrors.nid_back && <p className="mt-1 text-sm text-[#EF4444]">{verificationErrors.nid_back.message}</p>}
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

                <div className="bg-[#3B82F6]/10 p-4 rounded-lg">
                  <p className="text-sm text-[#3B82F6]"><strong>Note:</strong> Make sure your NID images are clear and all information is visible. Verification typically takes 1-2 business days.</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowVerificationForm(false)}>Cancel</Button>
                  <Button type="submit" loading={verificationLoading}>Submit Verification</Button>
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