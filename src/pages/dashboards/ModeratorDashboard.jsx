// src/pages/dashboards/ModeratorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import { FileText, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';

const ModeratorDashboard = () => {
  const [stats, setStats] = useState({
    pendingPosts: 0,
    pendingVerifications: 0,
    totalPosts: 0,
    totalUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch verification requests
      const verificationRequests = await userService.getVerificationRequests({ status: 'pending' });
      const allPosts = await userService.getAdminPosts();
      const allUsers = await userService.getUsers();

      setStats({
        pendingVerifications: verificationRequests.length,
        totalPosts: allPosts.length,
        totalUsers: allUsers.length,
        pendingPosts: 0, // No status field in posts to filter pending
      });

      // Set recent activity
      setRecentActivity([
        ...verificationRequests.slice(0, 3).map(req => ({
          type: 'verification',
          data: req,
        })),
        ...allPosts.slice(0, 2).map(post => ({
          type: 'post',
          data: post,
        })),
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      change: null,
      link: '/dashboard/moderator/posts',
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: CheckCircle,
      change: null,
      link: '/dashboard/moderator/verification',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      change: null,
    },
    {
      title: 'Reports',
      value: 0,
      icon: AlertCircle,
      change: null,
      link: '/dashboard/moderator/reports',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFCAB0]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Moderator Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Review and moderate pet listings and user verifications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statsCards.map((stat, index) => (
            stat.link ? (
              <Link key={index} to={stat.link} className="block">
                <StatsCard {...stat} />
              </Link>
            ) : (
              <StatsCard key={index} {...stat} />
            )
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/dashboard/moderator/posts"
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Review Posts</p>
                    <p className="text-xs text-gray-600">{stats.totalPosts} total posts</p>
                  </div>
                </div>
                <span className="text-sm text-blue-600">View →</span>
              </Link>

              <Link
                to="/dashboard/moderator/verification"
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-yellow-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Verification Requests</p>
                    <p className="text-xs text-gray-600">{stats.pendingVerifications} pending</p>
                  </div>
                </div>
                <span className="text-sm text-yellow-600">Review →</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {activity.type === 'verification' ? (
                          <CheckCircle size={16} className="text-gray-600" />
                        ) : (
                          <FileText size={16} className="text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'verification' 
                            ? `Verification request from ${activity.data.user.username}`
                            : `New post: ${activity.data.pet.name}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.data.submitted_at || activity.data.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={activity.type === 'verification' 
                        ? '/dashboard/moderator/verification'
                        : '/dashboard/moderator/posts'}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Review
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModeratorDashboard;