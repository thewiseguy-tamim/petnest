// src/utils/helpers.js
import { formatDistanceToNow, format, isValid } from 'date-fns';

export const formatDate = (date) => {
  if (!date) {
    console.warn('[helpers.formatDate] Received null or undefined date');
    return 'N/A';
  }
  try {
    const parsedDate = new Date(date);
    if (!isValid(parsedDate)) {
      console.warn('[helpers.formatDate] Invalid date:', date);
      return 'N/A';
    }
    return format(parsedDate, 'MMM dd, yyyy');
  } catch (error) {
    console.error('[helpers.formatDate] Error formatting date:', date, error);
    return 'N/A';
  }
};

export const formatDateTime = (date) => {
  if (!date) {
    console.warn('[helpers.formatDateTime] Received null or undefined date');
    return 'N/A';
  }
  try {
    const parsedDate = new Date(date);
    if (!isValid(parsedDate)) {
      console.warn('[helpers.formatDateTime] Invalid date:', date);
      return 'N/A';
    }
    return format(parsedDate, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    console.error('[helpers.formatDateTime] Error formatting date:', date, error);
    return 'N/A';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) {
    console.warn('[helpers.formatRelativeTime] Received null or undefined date');
    return 'N/A';
  }
  try {
    const parsedDate = new Date(date);
    if (!isValid(parsedDate)) {
      console.warn('[helpers.formatRelativeTime] Invalid date:', date);
      return 'N/A';
    }
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    console.error('[helpers.formatRelativeTime] Error formatting date:', date, error);
    return 'N/A';
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const isImageFile = (file) => {
  const acceptedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const fileExtension = getFileExtension(file.name).toLowerCase();
  return acceptedImageTypes.includes(fileExtension);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};