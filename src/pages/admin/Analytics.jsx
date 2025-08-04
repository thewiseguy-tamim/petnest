// src/pages/admin/Analytics.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DateRangePicker from '../../components/dashboard/DateRangePicker';
import UserGrowthChart from '../../components/dashboard/UserGrowthChart';
import PostsChart from '../../components/dashboard/PostsChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import analyticsService from '../../services/analyticsService';
import { TrendingUp, Users, FileText, DollarSign } from 'lucide-react';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('month');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getAdminStats(dateRange);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your platform's performance and growth</p>
            </div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-green-600 font-medium">
                +{stats?.growth?.userGrowth || 0}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.overview?.totalUsers || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-green-600 font-medium">
                +{stats?.growth?.postGrowth || 0}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.overview?.totalPosts || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Posts</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-gray-400" />
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${stats?.overview?.totalRevenue || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-blue-600 font-medium">
                {stats?.overview?.verifiedUsers || 0} verified
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.overview?.activeUsers || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Active Users</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
            <UserGrowthChart dateRange={dateRange} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts Activity</h2>
            <PostsChart dateRange={dateRange} />
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">By Role</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Clients</span>
                  <span className="text-sm font-medium">{stats?.userStats?.byRole?.client || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Moderators</span>
                  <span className="text-sm font-medium">{stats?.userStats?.byRole?.moderator || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Admins</span>
                  <span className="text-sm font-medium">{stats?.userStats?.byRole?.admin || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">By Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="text-sm font-medium">{stats?.userStats?.byStatus?.active || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Inactive</span>
                  <span className="text-sm font-medium">{stats?.userStats?.byStatus?.inactive || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Verification</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verified</span>
                  <span className="text-sm font-medium">{stats?.userStats?.byStatus?.verified || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unverified</span>
                  <span className="text-sm font-medium">{stats?.userStats?.byStatus?.unverified || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;