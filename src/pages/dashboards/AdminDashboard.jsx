import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import { Users, DollarSign, FileText, CheckSquare } from 'lucide-react';
import userService from '../../services/userService';
import petService from '../../services/petService';
import { useNotifications } from '../../context/NotificationContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalPosts: 0,
    pendingVerifications: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, verificationRequests, postsData, paymentHistory] = await Promise.all([
        userService.getUsers(),
        userService.getVerificationRequests({ status: 'pending' }),
        userService.getAdminPosts(),
        petService.getPaymentHistory(),
      ]);

      const totalRevenue = paymentHistory && Array.isArray(paymentHistory)
        ? paymentHistory
            .filter(payment => payment.status === 'VALID')
            .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
        : 0;

      setStats({
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        totalRevenue,
        totalPosts: Array.isArray(postsData) ? postsData.length : 0,
        pendingVerifications: Array.isArray(verificationRequests) ? verificationRequests.length : 0,
      });

      setRecentUsers(Array.isArray(usersData) ? usersData.slice(0, 5) : []);
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
    <DashboardLayout title="Admin Dashboard">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} />
            <StatsCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} />
            <StatsCard title="Total Posts" value={stats.totalPosts} icon={FileText} />
            <StatsCard title="Pending Verifications" value={stats.pendingVerifications} icon={CheckSquare} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
              {recentUsers.length > 0 ? (
                <ul>
                  {recentUsers.map(user => (
                    <li key={user.id} className="mb-2">
                      <Link to={`/admin/users/${user.id}`} className="text-blue-600 hover:underline">
                        {user.username} ({user.email})
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent users available.</p>
              )}
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
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;