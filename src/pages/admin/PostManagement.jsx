import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, Eye, Trash2, FileText } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import SearchBar from '../../components/common/SearchBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';

// Simple debounce function to limit rapid API calls
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    pet_type: '',
    search: '',
  });
  const { addNotification } = useNotifications();
  const renderCount = useRef(0);
  const prevFilters = useRef(filters);

  // Track component renders
  renderCount.current += 1;
  console.debug(`[PostManagement] Component rendered ${renderCount.current} times`);

  // Memoize addNotification to ensure stability
  const memoizedAddNotification = useCallback(addNotification, []);

  // Memoize onSearch callback to prevent unnecessary re-renders
  const handleSearch = useCallback(
    (value) => {
      console.debug('[PostManagement] handleSearch called with value:', value);
      setFilters((prev) => {
        const newFilters = { ...prev, search: value };
        console.debug('[PostManagement] New filters set:', JSON.stringify(newFilters));
        return newFilters;
      });
    },
    []
  );

  // Core fetchPosts logic without debounce for direct calls
  const performFetchPosts = useCallback(
    async (force = false) => {
      console.debug(`[PostManagement] performFetchPosts called with filters: ${JSON.stringify(filters)}, force: ${force}`);
      if (!force && JSON.stringify(filters) === JSON.stringify(prevFilters.current)) {
        console.debug('[PostManagement] Filters unchanged, skipping fetchPosts');
        setLoading(false);
        return;
      }
      prevFilters.current = filters;
      setLoading(true);
      try {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '')
        );
        console.debug('[PostManagement] Cleaned filters for API call:', JSON.stringify(cleanFilters));
        const data = await userService.getAdminPosts(cleanFilters);
        console.debug('[PostManagement] Fetched posts data:', data);
        setPosts(data);
      } catch (error) {
        console.error('[PostManagement] Failed to fetch posts:', error);
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load posts.',
          autoHide: true,
          duration: 5000
        });
      } finally {
        setLoading(false);
        console.debug('[PostManagement] performFetchPosts completed, loading set to false');
      }
    },
    [filters, memoizedAddNotification]
  );

  // Debounced fetchPosts for automatic calls (e.g., via useEffect)
  const fetchPosts = useCallback(
    debounce(() => performFetchPosts(false), 500),
    [performFetchPosts]
  );

  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    console.debug('[PostManagement] Refresh button clicked, forcing fetchPosts');
    performFetchPosts(true);
  }, [performFetchPosts]);

  useEffect(() => {
    console.debug('[PostManagement] useEffect triggered with fetchPosts dependency');
    fetchPosts();
    console.debug('[PostManagement] Filters dependency:', JSON.stringify(filters));
    console.debug('[PostManagement] memoizedAddNotification dependency:', memoizedAddNotification);
  }, [fetchPosts]);

  const handleDeletePost = async (postId) => {
    console.debug(`[PostManagement] handleDeletePost called with postId: ${postId}`);
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await userService.deletePost(postId);
        memoizedAddNotification({
          type: 'success',
          title: 'Success',
          message: 'The post has been deleted successfully.',
          autoHide: true,
          duration: 5000
        });
        console.debug('[PostManagement] Post deleted successfully, triggering fetchPosts');
        performFetchPosts(true);
        setShowModal(false);
      } catch (error) {
        console.error('[PostManagement] Failed to delete post:', error);
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete the post.',
          autoHide: true,
          duration: 5000
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    console.debug(`[PostManagement] getStatusBadge called with status: ${status}`);
    const variants = {
      active: 'success',
      pending: 'warning',
      rejected: 'danger',
      sold: 'default',
      adopted: 'primary',
    };
    return <Badge variant={variants[status] || 'default'}>{status || 'active'}</Badge>;
  };

  const getPetTypeBadge = (type) => {
    console.debug(`[PostManagement] getPetTypeBadge called with type: ${type}`);
    const variants = {
      cat: 'primary',
      dog: 'warning',
      other: 'default',
    };
    return <Badge variant={variants[type] || 'default'}>{type || 'Unknown'}</Badge>;
  };

  if (loading) {
    console.debug('[PostManagement] Rendering loading state');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  console.debug('[PostManagement] Rendering main component with posts:', posts.length);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Post Management</h1>
              <p className="text-gray-600 mt-1">Review and manage pet listings</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <SearchBar
                placeholder="Search posts..."
                onSearch={handleSearch}
                className="w-full sm:w-64"
              />
              <select
                value={filters.pet_type}
                onChange={(e) => {
                  console.debug('[PostManagement] Pet type filter changed to:', e.target.value);
                  setFilters((prev) => ({ ...prev, pet_type: e.target.value }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
              >
                <option value="">All Types</option>
                <option value="cat">Cats</option>
                <option value="dog">Dogs</option>
                <option value="other">Other</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => {
                  console.debug('[PostManagement] Status filter changed to:', e.target.value);
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="adopted">Adopted</option>
              </select>
              <Button
                variant="outline"
                size="small"
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {posts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={post.pet?.images_data?.[0]?.image || '/api/placeholder/40/40'}
                            alt={post.pet?.name || 'Pet'}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {post.pet?.name || 'Unnamed Pet'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {post.pet?.breed || 'Unknown breed'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{post.user?.username || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{post.user?.email || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPetTypeBadge(post.pet?.pet_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.created_at) || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={async () => {
                              console.debug('[PostManagement] View Details button clicked for post:', post.id);
                              try {
                                const postDetails = await userService.getAdminPostDetails(post.id);
                                console.debug('[PostManagement] Fetched post details:', postDetails);
                                setSelectedPost(postDetails);
                                setShowModal(true);
                              } catch (error) {
                                console.error('[PostManagement] Failed to fetch post details:', error);
                                memoizedAddNotification({
                                  type: 'error',
                                  title: 'Error',
                                  message: 'Failed to load post details.',
                                  autoHide: true,
                                  duration: 5000
                                });
                              }
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              console.debug('[PostManagement] Delete button clicked for post:', post.id);
                              handleDeletePost(post.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No posts found</p>
            </div>
          )}
        </div>
      </div>

      {/* Post Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          console.debug('[PostManagement] Modal closed');
          setShowModal(false);
          setSelectedPost(null);
        }}
        title="Post Details"
        size="large"
      >
        {selectedPost && (
          <div className="space-y-6">
            {/* Pet Images */}
            {selectedPost.pet?.images_data?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedPost.pet.images_data.map((image, index) => (
                  <img
                    key={index}
                    src={image.image || '/api/placeholder/150/150'}
                    alt={`${selectedPost.pet.name || 'Pet'} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Pet Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Pet Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-medium">Name:</span> {selectedPost.pet?.name || 'Unnamed'}</p>
                  <p className="text-sm"><span className="font-medium">Type:</span> {selectedPost.pet?.pet_type || 'Unknown'}</p>
                  <p className="text-sm"><span className="font-medium">Breed:</span> {selectedPost.pet?.breed || 'Unknown'}</p>
                  <p className="text-sm"><span className="font-medium">Age:</span> {selectedPost.pet?.age ? `${selectedPost.pet.age} years` : 'Unknown'}</p>
                  <p className="text-sm"><span className="font-medium">Gender:</span> {selectedPost.pet?.gender || 'Unknown'}</p>
                  <p className="text-sm"><span className="font-medium">Price:</span> {selectedPost.pet?.price ? `$${selectedPost.pet.price}` : 'Not listed'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Owner Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-medium">Username:</span> {selectedPost.user?.username || 'Unknown'}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedPost.user?.email || 'Unknown'}</p>
                  <p className="text-sm"><span className="font-medium">Verified:</span> {selectedPost.user?.is_verified ? 'Yes' : 'No'}</p>
                  <p className="text-sm"><span className="font-medium">Role:</span> {selectedPost.user?.role || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedPost.pet?.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedPost.pet.description}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  console.debug('[PostManagement] Close button clicked in modal');
                  setShowModal(false);
                  setSelectedPost(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  console.debug('[PostManagement] Delete Post button clicked in modal for post:', selectedPost.id);
                  handleDeletePost(selectedPost.id);
                }}
              >
                Delete Post
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default PostManagement;