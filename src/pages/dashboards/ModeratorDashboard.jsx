// src/pages/dashboards/ModeratorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, CheckSquare, Shield, Clock, Users } from 'lucide-react';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import { getPetImageUrl, ImageWithFallback, PLACEHOLDERS } from '../../utils/imageUtils';

const ModeratorDashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    pendingVerifications: 0,
    flaggedPosts: 0,
    reportedUsers: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsData, verificationRequests] = await Promise.all([
        userService.getAdminPosts(),
        userService.getVerificationRequests({ status: 'pending' }),
      ]);

      const posts = Array.isArray(postsData) ? postsData : [];
      const verifications = Array.isArray(verificationRequests) ? verificationRequests : [];

      setStats({
        totalPosts: posts.length,
        pendingVerifications: verifications.length,
        flaggedPosts: posts.filter(post => post.is_flagged).length,
        reportedUsers: 0,
      });

      setRecentPosts(posts.slice(0, 5));
      setRecentVerifications(verifications.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data.',
        autoHide: true,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Moderator Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and moderate platform content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Posts" 
            value={stats.totalPosts} 
            icon={FileText}
            change={`${stats.flaggedPosts} flagged`}
            changeType={stats.flaggedPosts > 0 ? 'warning' : 'positive'}
          />
          <StatsCard 
            title="Pending Verifications" 
            value={stats.pendingVerifications} 
            icon={CheckSquare}
            changeType={stats.pendingVerifications > 0 ? 'warning' : 'positive'}
          />
          <StatsCard 
            title="Flagged Posts" 
            value={stats.flaggedPosts} 
            icon={Shield}
            changeType={stats.flaggedPosts > 0 ? 'warning' : 'positive'}
          />
          <StatsCard 
            title="Reported Users" 
            value={stats.reportedUsers} 
            icon={Users}
            changeType={stats.reportedUsers > 0 ? 'warning' : 'positive'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
                <Link 
                  to="/dashboard/moderator/posts" 
                  className="text-sm text-[#FFCAB0] hover:text-[#FFB090] font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map(post => (
                    <div key={post.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ImageWithFallback
                          src={getPetImageUrl(post.pet)}
                          fallback={PLACEHOLDERS.THUMBNAIL}
                          alt={post.pet?.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {post.pet?.name || 'Unnamed Pet'}
                          </p>
                          <p className="text-xs text-gray-500">
                            by {post.user?.username || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent posts</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pending Verifications</h2>
                <Link 
                  to="/dashboard/moderator/verification" 
                  className="text-sm text-[#FFCAB0] hover:text-[#FFB090] font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentVerifications.length > 0 ? (
                <div className="space-y-4">
                  {recentVerifications.map(request => (
                    <div key={request.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.user?.username || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/dashboard/moderator/verification"
                        className="text-sm text-[#FFCAB0] hover:text-[#FFB090]"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No pending verifications</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/dashboard/moderator/posts"
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Moderate Posts</span>
            </Link>
            <Link
              to="/dashboard/moderator/verification"
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <CheckSquare className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Review Verifications</span>
            </Link>
            <Link
              to="/dashboard/moderator/reports"
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Shield className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Handle Reports</span>
                        </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModeratorDashboard;