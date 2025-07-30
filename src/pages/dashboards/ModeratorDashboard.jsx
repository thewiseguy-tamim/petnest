import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import { FileText, CheckSquare } from 'lucide-react';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';

const ModeratorDashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    pendingVerifications: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
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

      setStats({
        totalPosts: Array.isArray(postsData) ? postsData.length : 0,
        pendingVerifications: Array.isArray(verificationRequests) ? verificationRequests.length : 0,
      });

      setRecentPosts(Array.isArray(postsData) ? postsData.slice(0, 5) : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      addNotification('error', error.message || 'Failed to load dashboard data. Please log in again.');
      if (error.message.includes('Session expired')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [addNotification, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <DashboardLayout title="Moderator Dashboard">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatsCard title="Total Posts" value={stats.totalPosts} icon={FileText} />
            <StatsCard title="Pending Verifications" value={stats.pendingVerifications} icon={CheckSquare} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
            {recentPosts.length > 0 ? (
              <ul>
                {recentPosts.map(post => (
                  <li key={post.id} className="mb-2">
                    <Link to={`/admin/posts/${post.id}`} className="text-blue-600 hover:underline">
                      Post by {post.user?.username || 'Unknown'}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No recent posts available.</p>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ModeratorDashboard;