import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import SearchBar from '../../components/common/SearchBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import { Eye, Trash2 } from 'lucide-react';
import { ImageWithFallback, getPetImageUrl, PLACEHOLDERS } from '../../utils/imageUtils';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const PostManagement = () => {
  const [rawPosts, setRawPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ pet_type: '', search: '' });

  const { addNotification } = useNotifications();
  const memoizedAddNotification = useCallback(addNotification, []);
  const prevFilters = useRef(null); // ensure first fetch runs

  const handleSearch = useCallback((value) => setFilters((prev) => ({ ...prev, search: value })), []);

  const performFetchPosts = useCallback(
    async (force = false) => {
      if (!force && prevFilters.current && JSON.stringify(filters) === JSON.stringify(prevFilters.current)) {
        setLoading(false);
        return;
      }
      prevFilters.current = filters;
      setLoading(true);
      try {
        const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
        const data = await userService.getAdminPosts(cleanFilters);
        setRawPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('[PostManagement] Failed to fetch posts:', error);
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load posts.',
          autoHide: true,
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    },
    [filters, memoizedAddNotification]
  );

  const fetchPosts = useCallback(debounce(() => performFetchPosts(false), 400), [performFetchPosts]);

  useEffect(() => {
    // initial load
    performFetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // subsequent filter-driven loads
    fetchPosts();
  }, [filters, fetchPosts]);

  const posts = useMemo(() => {
    const q = filters.search?.toLowerCase().trim();
    if (!q) return rawPosts;
    return rawPosts.filter((post) => {
      const petName = post.pet?.name?.toLowerCase() || '';
      const breed = post.pet?.breed?.toLowerCase() || '';
      const owner = post.user?.username?.toLowerCase() || '';
      return petName.includes(q) || breed.includes(q) || owner.includes(q);
    });
  }, [rawPosts, filters.search]);

  const getPetTypeBadge = (type) => {
    const variants = { cat: 'primary', dog: 'warning', other: 'default' };
    return <Badge variant={variants[type] || 'default'}>{type || 'Unknown'}</Badge>;
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await userService.deletePost(postId);
        memoizedAddNotification({
          type: 'success',
          title: 'Success',
          message: 'The post has been deleted successfully.',
          autoHide: true,
          duration: 5000,
        });
        performFetchPosts(true);
        setShowModal(false);
      } catch (error) {
        console.error('[PostManagement] Failed to delete post:', error);
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete the post.',
          autoHide: true,
          duration: 5000,
        });
      }
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Post Management</h1>
              <p className="text-gray-600 mt-1">Review and manage pet listings</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <SearchBar placeholder="Search posts..." onSearch={handleSearch} className="w-full sm:w-64" />
              <select
                value={filters.pet_type}
                onChange={(e) => setFilters((prev) => ({ ...prev, pet_type: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-300"
              >
                <option value="">All Types</option>
                <option value="cat">Cats</option>
                <option value="dog">Dogs</option>
              </select>
              <Button variant="outline" size="small" onClick={() => performFetchPosts(true)}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {posts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ImageWithFallback
                            src={getPetImageUrl(post.pet)}
                            fallback={PLACEHOLDERS.THUMBNAIL}
                            alt={post.pet?.name || 'Pet'}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{post.pet?.name || 'Unnamed Pet'}</div>
                            <div className="text-sm text-gray-500">{post.pet?.breed || 'Unknown breed'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{post.user?.username || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{post.user?.email || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getPetTypeBadge(post.pet?.pet_type)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(post.created_at) || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={async () => {
                              try {
                                const details = await userService.getAdminPostDetails(post.id);
                                setSelectedPost(details);
                                setShowModal(true);
                              } catch (error) {
                                memoizedAddNotification({
                                  type: 'error',
                                  title: 'Error',
                                  message: 'Failed to load post details.',
                                  autoHide: true,
                                  duration: 5000,
                                });
                              }
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} className="text-red-600 hover:text-red-900" title="Delete">
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
              <p className="text-sm text-gray-500">No posts found</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPost(null);
        }}
        title="Post Details"
        size="large"
      >
        {selectedPost && (
          <div className="space-y-6">
            {selectedPost.pet?.images_data?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedPost.pet.images_data.map((img, index) => (
                  <ImageWithFallback
                    key={index}
                    src={img?.image || getPetImageUrl(selectedPost.pet)}
                    fallback={PLACEHOLDERS.THUMBNAIL}
                    alt={`${selectedPost.pet.name || 'Pet'} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

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

            {selectedPost.pet?.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedPost.pet.description}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setShowModal(false); setSelectedPost(null); }}>
                Close
              </Button>
              <Button variant="danger" onClick={() => handleDeletePost(selectedPost.id)}>
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