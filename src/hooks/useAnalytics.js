// src/hooks/useAnalytics.js
import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';

export const useAnalytics = (type, dateRange) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        switch (type) {
          case 'revenue':
            response = await analyticsService.getRevenueData(dateRange);
            break;
          case 'users':
            response = await analyticsService.getUserGrowthData(dateRange);
            break;
          case 'posts':
            response = await analyticsService.getPostsAnalytics(dateRange);
            break;
          default:
            response = await analyticsService.getAdminStats(dateRange);
        }
        setData(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [type, dateRange]);

  return { data, loading, error };
};