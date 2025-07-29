import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { useNotifications } from '../context/NotificationContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const profile = await authService.getProfile();
        const status = await authService.getUserStatus?.();
        // Ensure verification_status defaults to null if invalid
        const validStatus = status?.verification_status && ['pending', 'approved', 'rejected'].includes(status.verification_status) ? status.verification_status : null;
        setUser({ ...profile, ...status, verification_status: validStatus });
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      await checkAuth();
      addNotification({ type: 'success', title: 'Login Successful', message: 'Welcome back! You\'re now signed in.' });
      return response;
    } catch (error) {
      addNotification({ type: 'error', title: 'Login Failed', message: error.response?.data?.detail || 'Invalid credentials. Please try again.' });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      addNotification({ type: 'success', title: 'Account Created', message: 'Account created successfully! Please verify your email.' });
      return response;
    } catch (error) {
      addNotification({ type: 'error', title: 'Registration Failed', message: error.response?.data?.detail || 'Failed to create account. Please try again.' });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    addNotification({ type: 'info', title: 'Logged Out', message: 'You have been logged out successfully.' });
  };

  const updateProfile = async (profileData) => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => formData.append(key, profileData[key]));
      const response = await authService.updateProfile(formData);
      if (response?.profile_picture) {
        setUser((prevUser) => ({ ...prevUser, ...response }));
      } else {
        setUser((prevUser) => ({ ...prevUser, ...response }));
      }
      addNotification({ type: 'success', title: 'Profile Updated', message: 'Your profile has been updated.' });
      return response;
    } catch (error) {
      addNotification({ type: 'error', title: 'Update Failed', message: error.response?.data?.detail || 'Failed to update profile.' });
      throw error;
    }
  };

  const value = { user, isAuthenticated, loading, login, register, logout, updateProfile, checkAuth };
  return React.createElement(AuthContext.Provider, { value }, children);
};