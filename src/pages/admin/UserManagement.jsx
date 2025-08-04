import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Clock, Shield, User } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import SearchBar from '../../components/common/SearchBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import { ImageWithFallback, getAvatarUrl } from '../../utils/imageUtils';

// Simple debounce function to limit rapid API calls
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    search: '',
  });
  const { addNotification } = useNotifications();
  const renderCount = useRef(0);
  const prevFilters = useRef(filters);

  // Track component renders
  renderCount.current += 1;
  console.debug(`Component rendered ${renderCount.current} times`);

  // Memoize addNotification to ensure stability
  const memoizedAddNotification = useCallback(addNotification, []);

  // Memoize onSearch callback to prevent unnecessary re-renders
  const handleSearch = useCallback(
    (value) => {
      console.debug('handleSearch called with value:', value);
      setFilters((prev) => {
        const newFilters = { ...prev, search: value };
        console.debug('New filters set:', JSON.stringify(newFilters));
        return newFilters;
      });
    },
    []
  );

  // Core fetchUsers logic without debounce for direct calls
  const performFetchUsers = useCallback(
    async (force = false) => {
      console.debug(`performFetchUsers called with filters: ${JSON.stringify(filters)}, force: ${force}`);
      if (!force && JSON.stringify(filters) === JSON.stringify(prevFilters.current)) {
        console.debug('Filters unchanged, skipping fetchUsers');
        setLoading(false);
        return;
      }
      prevFilters.current = filters;
      setLoading(true);
      try {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '')
        );
        console.debug('Cleaned filters for API call:', JSON.stringify(cleanFilters));
        const data = await userService.getUsers(cleanFilters);
        console.debug('Fetched users data:', data);
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load users.',
          autoHide: true,
          duration: 5000
        });
      } finally {
        setLoading(false);
        console.debug('performFetchUsers completed, loading set to false');
      }
    },
    [filters, memoizedAddNotification]
  );

  // Debounced fetchUsers for automatic calls (e.g., via useEffect)
  const fetchUsers = useCallback(
    debounce(() => performFetchUsers(false), 500),
    [performFetchUsers]
  );

  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    console.debug('Refresh button clicked, forcing fetchUsers');
    performFetchUsers(true);
  }, [performFetchUsers]);

  useEffect(() => {
    console.debug('useEffect triggered with fetchUsers dependency');
    fetchUsers();
    console.debug('Filters dependency:', JSON.stringify(filters));
    console.debug('memoizedAddNotification dependency:', memoizedAddNotification);
  }, [fetchUsers]);

  const handleUpdateRole = async (userId, newRole) => {
    console.debug(`handleUpdateRole called with userId: ${userId}, newRole: ${newRole}`);
    try {
      await userService.updateUserRole(userId, newRole);
      memoizedAddNotification({
        type: 'success',
        title: 'Success',
        message: `User role updated to ${newRole}`,
        autoHide: true,
        duration: 5000
      });
      console.debug('User role updated successfully, triggering fetchUsers');
      performFetchUsers(true);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update user role:', error);
      memoizedAddNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user role',
        autoHide: true,
        duration: 5000
      });
    }
  };

  const handleUpdateVerification = async (userId, status, notes) => {
    console.debug(`handleUpdateVerification called with userId: ${userId}, status: ${status}, notes: ${notes || 'none'}`);
    try {
      await userService.updateVerificationStatus(userId, status, notes);
      memoizedAddNotification({
        type: 'success',
        title: 'Success',
        message: `User verification ${status}`,
        autoHide: true,
        duration: 5000
      });
      console.debug('User verification updated successfully, triggering fetchUsers');
      performFetchUsers(true);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update verification status:', error);
      memoizedAddNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update verification status',
        autoHide: true,
        duration: 5000
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    console.debug(`handleDeleteUser called with userId: ${userId}`);
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userService.deleteUser(userId);
        memoizedAddNotification({
          type: 'success',
          title: 'Success',
          message: 'User deleted successfully',
          autoHide: true,
          duration: 5000
        });
        console.debug('User deleted successfully, triggering fetchUsers');
        performFetchUsers(true);
        setShowModal(false);
      } catch (error) {
        console.error('Failed to delete user:', error);
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete user',
          autoHide: true,
          duration: 5000
        });
      }
    }
  };

  const getStatusIcon = (user) => {
    console.debug(`getStatusIcon called for user: ${user.username}, is_verified: ${user.is_verified}, verification_status: ${user.verification_status}`);
    if (user.is_verified) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (user.verification_status === 'rejected') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (user.verification_status === 'pending') {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return null;
  };

  const getRoleBadge = (role) => {
    console.debug(`getRoleBadge called with role: ${role}`);
    const variants = {
      admin: 'danger',
      moderator: 'warning',
      client: 'default',
    };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
  };

  if (loading) {
    console.debug('Rendering loading state');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  console.debug('Rendering main component with users:', users.length);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <SearchBar
                placeholder="Search users..."
                onSearch={handleSearch}
                className="w-full sm:w-64"
              />
              <select
                value={filters.status}
                onChange={(e) => {
                  console.debug('Status filter changed to:', e.target.value);
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
              >
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.role}
                onChange={(e) => {
                  console.debug('Role filter changed to:', e.target.value);
                  setFilters((prev) => ({ ...prev, role: e.target.value }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="client">Client</option>
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

        {/* Users Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {console.debug('User:', user.username, 'Profile Picture:', user.profile_picture, 'Resolved URL:', getAvatarUrl(user))}
                          <ImageWithFallback
                            src={getAvatarUrl(user)}
                            alt={user.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(user)}
                        <span className="ml-2 text-sm text-gray-900">
                          {user.is_verified ? 'Verified' : user.verification_status || 'Not Verified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.date_joined)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          console.debug('Manage button clicked for user:', user.username);
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="text-[#FFCAB0] hover:text-[#FFB090]"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          console.debug('Modal closed');
          setShowModal(false);
          setSelectedUser(null);
        }}
        title="Manage User"
        size="medium"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              {console.debug('Modal User:', selectedUser.username, 'Profile Picture:', selectedUser.profile_picture, 'Resolved URL:', getAvatarUrl(selectedUser))}
              <ImageWithFallback
                src={getAvatarUrl(selectedUser)}
                alt={selectedUser.username}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedUser.username}</h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <p className="text-xs text-gray-400 mt-1">Joined {formatDate(selectedUser.date_joined)}</p>
              </div>
            </div>

            {/* Change Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role
              </label>
              <select
                value={selectedUser.role}
                onChange={(e) => {
                  console.debug('Role select changed to:', e.target.value);
                  handleUpdateRole(selectedUser.id, e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
              >
                <option value="client">Client</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Verification Actions */}
            {selectedUser.verification_status === 'pending' && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Verification Action</h3>
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => {
                      console.debug('Approve Verification button clicked for user:', selectedUser.username);
                      handleUpdateVerification(selectedUser.id, 'approved');
                    }}
                  >
                    Approve Verification
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => {
                      console.debug('Reject Verification button clicked for user:', selectedUser.username);
                      handleUpdateVerification(selectedUser.id, 'rejected');
                    }}
                  >
                    Reject Verification
                  </Button>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h3>
              <Button
                variant="danger"
                size="small"
                onClick={() => {
                  console.debug('Delete User button clicked for user:', selectedUser.username);
                  handleDeleteUser(selectedUser.id);
                }}
              >
                Delete User
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This action cannot be undone. All user data will be permanently deleted.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default UserManagement;