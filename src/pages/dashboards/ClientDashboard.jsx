import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Heart, 
  MessageCircle, 
  FileText, 
  User, 
  Plus, 
  Edit2, 
  Clock,
  TrendingUp,
  Eye
} from 'lucide-react';
import userService from '../../services/userService';
import messageService from '../../services/messageService';
import { formatDate } from '../../utils/helpers';
import { getPetImageUrl, ImageWithFallback, PLACEHOLDERS } from '../../utils/imageUtils';
import { useNotifications } from '../../context/NotificationContext';

const ClientDashboard = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    activePosts: 0,
    messages: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show payment result toast and clean the query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');
    if (!paymentStatus) return;

    const lower = String(paymentStatus).toLowerCase();
    let type = 'info';
    let title = 'Payment Status';
    let message = 'Payment status updated.';

    if (lower === 'success') {
      type = 'success';
      title = 'Payment Successful';
      message = 'Your listing has been published successfully.';
    } else if (lower === 'failed') {
      type = 'error';
      title = 'Payment Failed or Canceled';
      message = 'Payment was not completed. Your listing was not activated.';
    } else if (lower === 'invalid') {
      type = 'error';
      title = 'Invalid Payment';
      message = 'Payment validation failed. If funds were deducted, please contact support.';
    } else if (lower === 'not_found') {
      type = 'error';
      title = 'Payment Not Found';
      message = 'We could not find this payment. Please try again.';
    } else if (lower === 'error') {
      type = 'error';
      title = 'Payment Error';
      message = 'An unexpected error occurred while processing your payment. Please try again.';
    }

    addNotification({
      type,
      title,
      message,
      autoHide: true,
      duration: 6000,
    });

    // Remove only the payment query param (preserve others)
    params.delete('payment');
    const newSearch = params.toString();
    navigate(
      { pathname: location.pathname, search: newSearch ? `?${newSearch}` : '' },
      { replace: true }
    );
  }, [location.search, addNotification, navigate, location.pathname]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const posts = await userService.getUserPosts();
      console.log('[ClientDashboard] User posts:', posts);
      setUserPosts(posts);

      const convos = await messageService.getConversations();
      setConversations(convos);

      const activePosts = posts.filter(post => post.pet?.availability === true).length;
      const unreadMessages = convos.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

      setStats({
        totalPosts: posts.length,
        activePosts: activePosts,
        messages: unreadMessages,
        totalViews: totalViews,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getPetId = (post) => {
    if (post.pet?.id) return post.pet.id;
    if (post.pet_id) return post.pet_id;
    if (typeof post.pet === 'number') return post.pet;
    return null;
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center px-4 py-2 bg-[#FFCAB0] text-white rounded-md hover:bg-[#FFB090] transition-colors"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#FFE5D4] to-[#FFCAB0] rounded-lg p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-lg opacity-90">Manage your pet listings and connect with potential adopters.</p>
          <div className="mt-6">
            <Link
              to="/pets/create"
              className="inline-flex items-center px-6 py-3 bg-white text-[#FFCAB0] rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-md"
            >
              <Plus className="mr-2" size={20} />
              Create New Listing
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-sm text-gray-600">Active Listings</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activePosts}</p>
            <p className="text-xs text-gray-500 mt-2">of {stats.totalPosts} total</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              {stats.messages > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">New</span>
              )}
            </div>
            <p className="text-sm text-gray-600">Unread Messages</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.messages}</p>
            <p className="text-xs text-gray-500 mt-2">from interested adopters</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalViews}</p>
            <p className="text-xs text-gray-500 mt-2">across all listings</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <User className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Profile Status</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">Active</p>
            <Link to="/profile/settings" className="text-xs text-[#FFCAB0] hover:text-[#FFB090] mt-2 inline-block">
              View Profile →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Pet Listings</h2>
                <Link
                  to="/pets/create"
                  className="text-sm text-[#FFCAB0] hover:text-[#FFB090] font-medium flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add New
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {userPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">You haven't posted any pets yet</p>
                  <Link
                    to="/pets/create"
                    className="inline-flex items-center px-4 py-2 bg-[#FFCAB0] text-white rounded-md hover:bg-[#FFB090] transition-colors"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Your First Listing
                  </Link>
                </div>
              ) : (
                <>
                  {userPosts.slice(0, 4).map((post) => {
                    const petId = getPetId(post);
                    return (
                      <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <ImageWithFallback
                              src={getPetImageUrl(post.pet)}
                              fallback={PLACEHOLDERS.THUMBNAIL}
                              alt={post.pet?.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{post.pet?.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {post.pet?.breed} • {post.pet?.age} years old
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock size={14} className="mr-1" />
                                  {formatDate(post.created_at)}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Eye size={14} className="mr-1" />
                                  {post.views || 0} views
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                              post.pet?.availability 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {post.pet?.availability ? 'Available' : 'Unavailable'}
                            </span>
                            {petId ? (
                              <Link
                                to={`/pets/${petId}/edit`}
                                className="text-sm text-[#FFCAB0] hover:text-[#FFB090] flex items-center"
                              >
                                <Edit2 size={14} className="mr-1" />
                                Edit
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-400 flex items-center">
                                <Edit2 size={14} className="mr-1" />
                                Edit unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {userPosts.length > 4 && (
                    <div className="p-4 text-center border-t">
                      <Link
                        to="/dashboard/client/posts"
                        className="text-sm text-[#FFCAB0] hover:text-[#FFB090] font-medium"
                      >
                        View All {userPosts.length} Listings →
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <Link
                  to="/messages"
                  className="text-sm text-[#FFCAB0] hover:text-[#FFB090] font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Messages from interested adopters will appear here
                  </p>
                </div>
              ) : (
                conversations.slice(0, 5).map((conversation, index) => {
                  const conversationKey = `conv-${conversation.other_user?.id || 'unknown'}-${conversation.pet?.id || conversation.pet_detail?.id || 'nopet'}-${index}`;
                  
                  return (
                    <Link
                      key={conversationKey}
                      to={`/messages/${conversation.other_user?.id}/${conversation.pet?.id || conversation.pet_detail?.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={20} className="text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.other_user?.username || 'Unknown User'}
                            </h4>
                            {conversation.unread_count > 0 && (
                              <span className="bg-[#FFCAB0] text-white text-xs rounded-full px-2 py-0.5 ml-2">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            Re: {conversation.pet_detail?.name || conversation.pet?.name || 'Unknown Pet'}
                          </p>
                          {conversation.latest_message && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {conversation.latest_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/pets/create"
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Create New Listing</span>
            </Link>
            <Link
              to="/messages"
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">View Messages</span>
            </Link>
            <Link
              to="/profile/settings"
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;