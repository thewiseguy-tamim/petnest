// src/utils/imageUtils.js
import React from 'react';
import reactLogo from '../assets/react.svg';

// Constants for image placeholders
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/ducrwlapf';
// Use local react.svg as placeholder for all image types
const PLACEHOLDER_IMAGE = reactLogo;
const PLACEHOLDER_THUMBNAIL = reactLogo;
const PLACEHOLDER_AVATAR = reactLogo;

// Resolves image URLs to Cloudinary format
export const resolveImageUrl = (img) => {
  if (!img) {
    console.debug('resolveImageUrl: Input is null or undefined, returning null');
    return null;
  }

  console.debug('resolveImageUrl: Input URL:', img);

  // Return full URLs as-is
  if (img.startsWith('http://') || img.startsWith('https://')) {
    console.debug('resolveImageUrl: Full URL detected, returning:', img);
    return img;
  }

  // Remove existing /image/upload/ if present to avoid duplication
  const cleanPath = img.replace(/^\/*image\/upload\//, '');

  // Construct Cloudinary URL, ensuring only one /image/upload/
  const finalUrl = `${CLOUDINARY_BASE_URL}/image/upload/${cleanPath.replace(/^\/+/, '')}`;
  console.debug('resolveImageUrl: Constructed URL:', finalUrl);
  return finalUrl;
};

// Returns an image URL with a fallback
export const getImageWithFallback = (imageUrl, fallbackUrl = PLACEHOLDER_IMAGE) => {
  const resolved = resolveImageUrl(imageUrl);
  console.debug('getImageWithFallback: Input:', imageUrl, 'Resolved:', resolved, 'Fallback:', fallbackUrl);
  return resolved || fallbackUrl;
};

// Gets user avatar URL - Updated to handle both profile_picture and profile_picture_url
export const getAvatarUrl = (user) => {
  // Check for both profile_picture and profile_picture_url
  const profilePicture = user?.profile_picture || user?.profile_picture_url;
  const avatarUrl = profilePicture
    ? getImageWithFallback(profilePicture, PLACEHOLDER_AVATAR)
    : PLACEHOLDER_AVATAR;
  console.debug('getAvatarUrl: User:', user?.username, 'Profile Picture:', profilePicture, 'Avatar URL:', avatarUrl);
  return avatarUrl;
};

// Gets pet image URL, supporting multiple images or a single image
export const getPetImageUrl = (pet, index = 0) => {
  console.debug('getPetImageUrl: Pet:', pet?.name, 'Index:', index);
  // Check images_data array
  if (Array.isArray(pet?.images_data) && pet.images_data.length > index) {
    const imgData = pet.images_data[index];
    const imageUrl = imgData?.image || (typeof imgData === 'string' ? imgData : null);
    console.debug('getPetImageUrl: Using images_data, Image URL:', imageUrl);
    return getImageWithFallback(imageUrl, PLACEHOLDER_IMAGE);
  }

  // Fallback to single image field
  if (pet?.image) {
    console.debug('getPetImageUrl: Using single image field:', pet.image);
    return getImageWithFallback(pet.image, PLACEHOLDER_IMAGE);
  }

  console.debug('getPetImageUrl: No image found, returning:', PLACEHOLDER_IMAGE);
  return PLACEHOLDER_IMAGE;
};

// Image component with fallback on error
export const ImageWithFallback = ({ src, fallback, alt, className, ...props }) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    console.debug('ImageWithFallback: Setting src:', src, 'Fallback:', fallback);
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      console.debug('ImageWithFallback: Error loading src:', imgSrc, 'Switching to fallback:', fallback || PLACEHOLDER_IMAGE);
      setHasError(true);
      setImgSrc(fallback || PLACEHOLDER_IMAGE);
    }
  };

  return React.createElement('img', {
    src: imgSrc || PLACEHOLDER_IMAGE,
    alt: alt || 'Image',
    className,
    onError: handleError,
    ...props,
  });
};

// Export placeholder constants
export const PLACEHOLDERS = {
  IMAGE: PLACEHOLDER_IMAGE,
  THUMBNAIL: PLACEHOLDER_THUMBNAIL,
  AVATAR: PLACEHOLDER_AVATAR,
};