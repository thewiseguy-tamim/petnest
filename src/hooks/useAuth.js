import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { useNotifications } from '../context/NotificationContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
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
        const status = await authService.getUserStatus();
        
        // Merge profile and status data
        const userData = {
          ...profile,
          ...status,
          verification_status: status?.verification_status || null,
          is_verified: status?.is_verified || false
        };
        
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const refreshUser = async () => {
    if (!isAuthenticated) return;
    
    try {
      const profile = await authService.getProfile();
      const status = await authService.getUserStatus();
      
      const userData = {
        ...profile,
        ...status,
        verification_status: status?.verification_status || null,
        is_verified: status?.is_verified || false
      };
      
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      await checkAuth();
      addNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back! You\'re now signed in.',
        autoHide: true,
        duration: 5000
      });
      return response;
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error.response?.data?.detail || 'Invalid credentials. Please try again.',
        autoHide: true,
        duration: 5000
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      addNotification({
        type: 'success',
        title: 'Account Created',
        message: 'Account created successfully! Please verify your email.',
        autoHide: true,
        duration: 5000
      });
      return response;
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.response?.data?.detail || 'Failed to create account. Please try again.',
        autoHide: true,
        duration: 5000
      });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    addNotification({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been logged out successfully.',
      autoHide: true,
      duration: 5000
    });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      
      // Update user state with new data
      setUser(prevUser => ({
        ...prevUser,
        ...response
      }));
      
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
        autoHide: true,
        duration: 5000
      });
      
      return response;
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.response?.data?.detail || 'Failed to update profile.',
        autoHide: true,
        duration: 5000
      });
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
    updateProfile,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};