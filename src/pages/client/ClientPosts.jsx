// src/pages/client/ClientPosts.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, Edit2, Trash2, Eye, Clock, Plus } from 'lucide-react';
import userService from '../../services/userService';
import petService from '../../services/petService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';

const ClientPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await userService.getUserPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load your posts.',
        autoHide: true,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId, petId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await petService.deletePet(petId);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Pet listing deleted successfully.',
          autoHide: true,
          duration: 5000
        });
        fetchPosts();
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete listing.',
          autoHide: true,
          duration: 5000
        });
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'available') return post.pet?.availability === true;
    if (filter === 'unavailable') return post.pet?.availability === false;
    return true;
  });

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
              <h1 className="text-2xl font-bold text-gray-900">My Pet Listings</h1>
              <p className="text-gray-600 mt-1">Manage all your pet listings in one place</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
              >
                <option value="all">All Listings</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <Link
                to="/pets/create"
                className="inline-flex items-center px-4 py-2 bg-[#FFCAB0] text-white rounded-md hover:bg-[#FFB090] transition-colors"
              >
                <Plus size={16} className="mr-2" />
                New Listing
              </Link>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? "You haven't created any listings yet" 
                : `No ${filter} listings found`}
            </p>
            {filter === 'all' && (
              <Link
                to="/pets/create"
                className="inline-flex items-center px-4 py-2 bg-[#FFCAB0] text-white rounded-md hover:bg-[#FFB090] transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Create Your First Listing
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={post.pet?.images_data?.[0]?.image || '/api/placeholder/400/300'}
                    alt={post.pet?.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{post.pet?.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {post.pet?.breed} • {post.pet?.age} years old
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      post.pet?.availability 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {post.pet?.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDate(post.created_at)}
                    </span>
                    <span className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      {post.views || 0} views
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Link
                      to={`/pets/${post.pet?.id}`}
                      className="text-sm text-[#FFCAB0] hover:text-[#FFB090] font-medium flex items-center"
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Link>
                    <Link
                      to={`/pets/${post.pet?.id}/edit`}
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center"
                    >
                      <Edit2 size={16} className="mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.pet?.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientPosts;