// src/services/analyticsService.js
import apiClient from './api';

const analyticsService = {
  // Admin analytics
  getAdminStats: (dateRange) =>
    apiClient
      .get('/analytics/admin/stats', { params: { date_range: dateRange } })
      .then(res => res.data),

  getRevenueData: (dateRange) =>
    apiClient
      .get('/analytics/admin/revenue', { params: { date_range: dateRange } })
      .then(res => res.data),

  getUserGrowthData: (dateRange) =>
    apiClient
      .get('/analytics/admin/users', { params: { date_range: dateRange } })
      .then(res => res.data),

  getPostsAnalytics: (dateRange) =>
    apiClient
      .get('/analytics/admin/posts', { params: { date_range: dateRange } })
      .then(res => res.data),

  // Moderator analytics
  getModeratorStats: (dateRange) =>
    apiClient
      .get('/analytics/moderator/stats', { params: { date_range: dateRange } })
      .then(res => res.data),

  // Client analytics
  getClientStats: () =>
    apiClient
      .get('/analytics/client/stats')
      .then(res => res.data),
};

export default analyticsService;
