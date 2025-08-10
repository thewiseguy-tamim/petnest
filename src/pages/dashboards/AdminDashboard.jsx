// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
Users,
DollarSign,
FileText,
CheckSquare,
Activity,
UserCheck,
Clock
} from 'lucide-react';
import userService from '../../services/userService';
import petService from '../../services/petService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { getAvatarUrl, getPetImageUrl, ImageWithFallback, PLACEHOLDERS } from '../../utils/imageUtils';

const AdminDashboard = () => {
const [stats, setStats] = useState({
totalUsers: 0,
activeUsers: 0,
totalRevenue: 0,
totalPosts: 0,
totalPets: 0,
pendingVerifications: 0,
verifiedUsers: 0,
todayRevenue: 0,
});
const [recentUsers, setRecentUsers] = useState([]);
const [recentPosts, setRecentPosts] = useState([]);
const [recentVerifications, setRecentVerifications] = useState([]);
const [loading, setLoading] = useState(true);
const { addNotification } = useNotifications();

useEffect(() => {
fetchDashboardData();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const fetchDashboardData = async () => {
setLoading(true);
try {
const [usersData, verificationRequests, postsData, petsData, paymentHistory] = await Promise.all([
userService.getUsers().catch(() => []),
userService.getVerificationRequests().catch(() => []),
userService.getAdminPosts().catch(() => []),
petService.getPets().catch(() => []),
petService.getPaymentHistory().catch(() => []),
]);

  const users = Array.isArray(usersData) ? usersData : [];
  const activeUsers = users.filter((user) => user.is_active).length;
  const verifiedUsers = users.filter((user) => user.is_verified).length;

  const verifications = Array.isArray(verificationRequests) ? verificationRequests : [];
  const pendingVerifications = verifications.filter((req) => req.status === 'pending').length;

  const posts = Array.isArray(postsData) ? postsData : [];
  const pets = Array.isArray(petsData) ? petsData : [];

  const payments = Array.isArray(paymentHistory) ? paymentHistory : [];
  const totalRevenue = payments
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

  const today = new Date().toDateString();
  const todayRevenue = payments
    .filter(
      (payment) =>
        payment.status === 'completed' &&
        new Date(payment.created_at).toDateString() === today
    )
    .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

  setStats({
    totalUsers: users.length,
    activeUsers,
    totalRevenue,
    totalPosts: posts.length,
    totalPets: pets.length,
    pendingVerifications,
    verifiedUsers,
    todayRevenue,
  });

  setRecentUsers(users.slice(-5).reverse());
  setRecentPosts(posts.slice(-5).reverse());
  setRecentVerifications(verifications.filter((req) => req.status === 'pending').slice(0, 5));
} catch (error) {
  console.error('[AdminDashboard] Failed to fetch dashboard data:', error);
  addNotification({
    type: 'error',
    title: 'Error Loading Dashboard',
    message: 'Failed to load dashboard data. Please refresh the page.',
    autoHide: true,
    duration: 5000,
  });
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
<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
<h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
<p className="text-gray-600 mt-1">Welcome back! Here's an overview of your platform.</p>
</div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Users"
        value={stats.totalUsers}
        icon={Users}
        change={`${stats.activeUsers} active`}
        changeType="positive"
      />
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        icon={DollarSign}
        change={`${formatCurrency(stats.todayRevenue)} today`}
        changeType="positive"
      />
      <StatsCard
        title="Total Listings"
        value={stats.totalPets}
        icon={FileText}
        change={`${stats.totalPosts} posts`}
        changeType="positive"
      />
      <StatsCard
        title="Pending Verifications"
        value={stats.pendingVerifications}
        icon={CheckSquare}
        change={`${stats.verifiedUsers} verified users`}
        changeType={stats.pendingVerifications > 0 ? 'warning' : 'positive'}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Link to="/dashboard/admin/users" className="text-sm text-amber-500 hover:text-amber-600 font-medium">
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentUsers.length > 0 ? (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <ImageWithFallback
                    src={getAvatarUrl(user)}
                    fallback={PLACEHOLDERS.AVATAR}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  {user.is_verified && <UserCheck className="w-4 h-4 text-green-500" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent users</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
            <Link to="/dashboard/admin/posts" className="text-sm text-amber-500 hover:text-amber-600 font-medium">
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center space-between justify-between">
                  <div className="flex items-center space-x-3">
                    <ImageWithFallback
                      src={getPetImageUrl(post.pet)}
                      fallback={PLACEHOLDERS.THUMBNAIL}
                      alt={post.pet?.name || 'Pet'}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {post.pet?.name || 'Unnamed Pet'}
                      </p>
                      <p className="text-xs text-gray-500">by {post.user?.username || 'Unknown'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent posts</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Verifications</h2>
            <Link to="/dashboard/admin/verification" className="text-sm text-amber-500 hover:text-amber-600 font-medium">
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentVerifications.length > 0 ? (
            <div className="space-y-4">
              {recentVerifications.map((request) => (
                <div key={request.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {request.user?.username || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(request.submitted_at)}</p>
                    </div>
                  </div>
                  <Link to="/dashboard/admin/verification" className="text-sm text-amber-500 hover:text-amber-600">
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

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/dashboard/admin/users"
          className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Users className="w-5 h-5 mr-2 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Manage Users</span>
        </Link>
        <Link
          to="/dashboard/admin/posts"
          className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FileText className="w-5 h-5 mr-2 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Manage Posts</span>
        </Link>
        <Link
          to="/dashboard/admin/verification"
          className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <CheckSquare className="w-5 h-5 mr-2 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Review Verifications</span>
        </Link>
        <Link
          to="/dashboard/admin/analytics"
          className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Activity className="w-5 h-5 mr-2 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">View Analytics</span>
        </Link>
      </div>
    </div>
  </div>
</DashboardLayout>
);
};

export default AdminDashboard;