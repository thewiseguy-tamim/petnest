// src/utils/constants.js
export const API_BASE_URL = 'https://petnest-backend.vercel.app';

export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  CLIENT: 'client',
};

export const PET_TYPES = {
  CAT: 'cat',
  DOG: 'dog',
  OTHER: 'other',
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const POST_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SOLD: 'sold',
  ADOPTED: 'adopted',
};

// src/utils/constants.js (continued)
export const DATE_RANGES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

export const PRICE_RANGES = {
  MIN: 0,
  MAX: 10000,
};

export const AGE_RANGES = [
  { value: '0-1', label: '0-1 years' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5+', label: '5+ years' },
];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const NOTIFICATION_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back! You\'re now signed in.',
  LOGIN_FAILED: 'Invalid credentials. Please try again.',
  REGISTER_SUCCESS: 'Account created successfully! Please verify your email.',
  REGISTER_FAILED: 'Failed to create account. Please try again.',
  VERIFICATION_SUCCESS: 'Email verification successful! Welcome to PetNest.',
  VERIFICATION_PENDING: 'Please verify your email to access all features.',
  PASSWORD_RESET_SENT: 'Password reset email sent to your inbox.',
  PROFILE_UPDATED: 'Profile information updated successfully.',
  POST_PUBLISHED: 'Your pet listing has been published.',
  MESSAGE_RECEIVED: 'You have a new message from',
  ADOPTION_REQUEST: 'Someone is interested in adopting',
  UPLOAD_FAILED: 'Failed to upload image. Please try again.',
};