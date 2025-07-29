// src/pages/dashboards/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import { Users, DollarSign, FileText, CheckSquare } from 'lucide-react';
import userService from '../../services/userService';
import petService from '../../services/petService';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersData = await userService.getUsers();
      const verificationRequests = await userService.getVerificationRequests({ status: 'pending' });
      const postsData = await userService.getAdminPosts();
      const paymentHistory = await petService.getPaymentHistory();

      // Calculate stats from real data
      const totalRevenue = paymentHistory
        .filter(payment => payment.status === 'VALID')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      setStats({
        totalUsers: usersData.length,
        totalRevenue: totalRevenue,
        totalPosts: postsData.length,
        pendingVerifications: verificationRequests.length,
      });

      // Set recent data
      setRecentUsers(usersData.slice(0, 5));
      setRecentPosts(postsData.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: null,
      changeType: null,
      link: '/dashboard/admin/users',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: null,
      changeType: null,
      link: '/dashboard/admin/revenue',
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts.toLocaleString(),
      icon: FileText,
      change: null,
      changeType: null,
      link: '/dashboard/admin/posts',
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications.toLocaleString(),
      icon: CheckSquare,
      change: null,
      changeType: null,
      link: '/dashboard/admin/verification',
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening with PetNest today.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statsCards.map((stat, index) => (
            <Link key={index} to={stat.link} className="block">
              <StatsCard {...stat} />
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link to={`/dashboard/admin/users/${user.id}`} className="text-xs text-blue-600 hover:text-blue-800">
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h2>
            <div className="space-y-4">
              <Link
                to="/dashboard/admin/verification"
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <CheckSquare className="text-yellow-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Verification Requests</p>
                    <p className="text-xs text-gray-600">{stats.pendingVerifications} pending</p>
                  </div>
                </div>
                <span className="text-sm text-yellow-600">Review →</span>
              </Link>
              
              <Link
                to="/dashboard/admin/posts"
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Recent Posts</p>
                    <p className="text-xs text-gray-600">{recentPosts.length} new posts</p>
                  </div>
                </div>
                <span className="text-sm text-blue-600">View →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;