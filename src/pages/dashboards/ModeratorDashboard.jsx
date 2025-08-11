import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, CheckSquare, Shield, Clock, RefreshCw } from 'lucide-react';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import { getPetImageUrl, ImageWithFallback, PLACEHOLDERS, getAvatarUrl } from '../../utils/imageUtils';

const ModeratorDashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    pendingVerifications: 0,
    flaggedPosts: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { addNotification } = useNotifications();

  const sortByDateDesc = (a, b) => {
    const ad = new Date(a?.created_at || a?.updated_at || a?.submitted_at || a?.timestamp || 0);
    const bd = new Date(b?.created_at || b?.updated_at || b?.submitted_at || b?.timestamp || 0);
    return bd - ad;
  };

  const enrichVerificationUsers = async (list) => {
    // For up to 5 items, fetch missing user details (without touching userService.js implementation)
    return Promise.all(
      list.map(async (request) => {
        try {
          const userObj = typeof request.user === 'object' ? request.user || {} : {};
          const userId =
            userObj?.id ??
            (typeof request.user === 'number' ? request.user : null);

          // If we already have username/email/avatar, skip extra fetch
          const hasBasics =
            userObj?.username || userObj?.email || userObj?.profile_picture || userObj?.profile_picture_url;

          if (!hasBasics && userId) {
            const details = await userService.getUserDetails(userId);
            return { ...request, user: { ...userObj, ...(details || {}) } };
          }
          return { ...request, user: userObj };
        } catch {
          return request;
        }
      })
    );
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [postsData, verificationRequests] = await Promise.all([
        userService.getAdminPosts().catch(() => []),
        userService.getVerificationRequests({ status: 'pending' }).catch(() => []),
      ]);

      const posts = Array.isArray(postsData) ? postsData : [];
      const verifications = Array.isArray(verificationRequests) ? verificationRequests : [];

      const flaggedPosts = posts.filter(
        (p) =>
          p?.is_flagged === true ||
          p?.flagged === true ||
          String(p?.status || '').toLowerCase() === 'flagged'
      ).length;

      const pendingVerifs = verifications.filter(
        (req) => String(req?.status || req?.state || '').toLowerCase() === 'pending'
      );

      const latestPosts = [...posts].sort(sortByDateDesc).slice(0, 5);
      const latestVerifsBase = [...pendingVerifs].sort(sortByDateDesc).slice(0, 5);
      const latestVerifs = await enrichVerificationUsers(latestVerifsBase);

      setStats({
        totalPosts: posts.length,
        pendingVerifications: pendingVerifs.length,
        flaggedPosts,
      });

      setRecentPosts(latestPosts);
      setRecentVerifications(latestVerifs);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('[ModeratorDashboard] Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load moderator dashboard data.',
        autoHide: true,
        duration: 5000,
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center px-4 py-2 bg-[#FFCAB0] text-white rounded-md hover:bg-[#FFB090] transition-colors"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Moderator Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor and moderate platform content</p>
              {lastUpdated && (
                <p className="text-xs text-gray-400 mt-2">Last updated: {formatDate(lastUpdated)}</p>
              )}
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
                <Link to="/dashboard/moderator/posts" className="text-sm text-amber-500 hover:text-amber-600 font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post, idx) => {
                    const created = post?.created_at || post?.updated_at || post?.date;
                    const flagged =
                      post?.is_flagged === true ||
                      post?.flagged === true ||
                      String(post?.status || '').toLowerCase() === 'flagged';
                    return (
                      <div key={post?.id || `post-${idx}`} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ImageWithFallback
                            src={getPetImageUrl(post.pet)}
                            fallback={PLACEHOLDERS.THUMBNAIL}
                            alt={post.pet?.name || 'Pet'}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">{post.pet?.name || 'Unnamed Pet'}</p>
                              {flagged && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-100 text-red-700">
                                  Flagged
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">by {post.user?.username || 'Unknown'}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(created)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500">No recent posts</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pending Verifications</h2>
                <Link to="/dashboard/moderator/verification" className="text-sm text-amber-500 hover:text-amber-600 font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentVerifications.length > 0 ? (
                <div className="space-y-4">
                  {recentVerifications.map((request, idx) => {
                    const submitted = request?.submitted_at || request?.created_at || request?.timestamp;
                    const avatarSrc = getAvatarUrl(request.user);
                    const username = request?.user?.username || 'Unknown User';
                    return (
                      <div key={request?.id || `verif-${idx}`} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ImageWithFallback
                            src={avatarSrc}
                            fallback={PLACEHOLDERS.AVATAR}
                            alt={username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{username}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                              {formatDate(submitted)}
                            </p>
                          </div>
                        </div>
                        <Link to="/dashboard/moderator/verification" className="text-sm text-amber-500 hover:text-amber-600">
                          Review
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <CheckSquare className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500">No pending verifications</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModeratorDashboard;