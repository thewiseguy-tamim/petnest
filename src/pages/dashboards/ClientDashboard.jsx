import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Heart, MessageCircle, FileText, User } from 'lucide-react';
import userService from '../../services/userService';
import messageService from '../../services/messageService';

const ClientDashboard = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    activePosts: 0,
    messages: 0,
    favorites: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[ClientDashboard] Component mounted, fetching dashboard data');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('[ClientDashboard.fetchDashboardData] Starting data fetch');
    setLoading(true);
    setError(null);
    try {
      // Fetch user posts
      console.log('[ClientDashboard.fetchDashboardData] Fetching user posts');
      const posts = await userService.getUserPosts();
      console.log('[ClientDashboard.fetchDashboardData] User posts fetched:', posts);
      setUserPosts(posts);

      // Fetch conversations
      console.log('[ClientDashboard.fetchDashboardData] Fetching conversations');
      const convos = await messageService.getConversations();
      console.log('[ClientDashboard.fetchDashboardData] Conversations fetched:', convos);
      setConversations(convos);

      // Calculate stats
      const activePosts = posts.filter(post => post.pet?.availability === true).length;
      const unreadMessages = convos.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      console.log('[ClientDashboard.fetchDashboardData] Stats calculated:', { activePosts, unreadMessages });

      setStats({
        totalPosts: posts.length,
        activePosts: activePosts,
        messages: unreadMessages,
        favorites: 0, // No favorites endpoint in API
      });
    } catch (error) {
      console.error('[ClientDashboard.fetchDashboardData] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      console.log('[ClientDashboard.fetchDashboardData] Data fetch completed, loading:', false);
      setLoading(false);
    }
  };

  const quickStats = [
    { label: 'Active Posts', value: stats.activePosts, icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Unread Messages', value: stats.messages, icon: MessageCircle, color: 'bg-green-100 text-green-600' },
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'bg-purple-100 text-purple-600' },
    { label: 'Profile', value: 'View', icon: User, color: 'bg-gray-100 text-gray-600' },
  ];

  if (loading) {
    console.log('[ClientDashboard] Rendering loading state');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFCAB0]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    console.log('[ClientDashboard] Rendering error state:', error);
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => {
              console.log('[ClientDashboard] Retry button clicked');
              fetchDashboardData();
            }}
            className="mt-4 inline-flex items-center px-4 py-2 bg-[#FFCAB0] text-white rounded-md hover:bg-[#FFB090]"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  console.log('[ClientDashboard] Rendering dashboard with posts:', userPosts, 'conversations:', conversations);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#FFE5D4] to-[#FFCAB0] rounded-lg p-6 text-white">
          <h1 className="text-2xl font-semibold mb-2">Welcome back!</h1>
          <p className="opacity-90">Manage your pet listings and connect with potential adopters.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            console.log('[ClientDashboard] Rendering stat:', stat.label, stat.value);
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* My Posts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">My Pet Listings</h2>
            <Link
              to="/pets/create"
              className="text-sm text-[#FFCAB0] hover:text-[#FFB090] font-medium"
            >
              Add New Pet
            </Link>
          </div>
          <div className="divide-y">
            {userPosts.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-4">You haven't posted any pets yet</p>
                <Link
                  to="/pets/create"
                  className="inline-flex items-center px-4 py-2 bg-[#FFCAB0] text-white rounded-md hover:bg-[#FFB090]"
                >
                  Create Your First Post
                </Link>
              </div>
            ) : (
              userPosts.slice(0, 5).map((post) => {
                console.log('[ClientDashboard] Rendering post:', post);
                return (
                  <div key={post.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={post.pet.images_data?.[0]?.image || '/api/placeholder/60/60'}
                          alt={post.pet.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{post.pet.name}</h3>
                          <p className="text-sm text-gray-600">{post.pet.breed}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Posted {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          post.pet.availability 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {post.pet.availability ? 'Available' : 'Unavailable'}
                        </span>
                        <Link
                          to={`/pets/${post.pet.id}/edit`}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {userPosts.length > 5 && (
            <div className="p-4 border-t text-center">
              <Link
                to="/dashboard/client/posts"
                className="text-sm text-[#FFCAB0] hover:text-[#FFB090] font-medium"
              >
                View All Posts
              </Link>
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
            <Link
              to="/messages"
              className="text-sm text-[#FFCAB0] hover:text-[#FFB090] font-medium"
            >
              View All
            </Link>
          </div>
          <div className="divide-y">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle className="mx-auto mb-3 text-gray-300" size={48} />
                <p>No messages yet</p>
              </div>
            ) : (
              conversations.slice(0, 3).map((conversation) => {
                console.log('[ClientDashboard] Rendering conversation:', conversation);
                return (
                  <div key={`${conversation.other_user?.id}-${conversation.pet?.id}`} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{conversation.other_user?.username || 'Unknown User'}</h4>
                          <p className="text-sm text-gray-600">About: {conversation.pet_detail?.name || 'Unknown Pet'}</p>
                          {conversation.latest_message && (
                            <p className="text-xs text-gray-500 mt-1">
                              {conversation.latest_message.content.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="bg-[#FFCAB0] text-white text-xs rounded-full px-2 py-1">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;