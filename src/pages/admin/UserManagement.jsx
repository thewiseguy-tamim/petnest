import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { CheckCircle, XCircle, Clock } from 'lucide-react';

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
  const memoizedAddNotification = useCallback(addNotification, []);
  const prevFilters = useRef(null); // ensure first fetch runs

  const handleSearch = useCallback((value) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const performFetchUsers = useCallback(
    async (force = false) => {
      if (!force && prevFilters.current && JSON.stringify(filters) === JSON.stringify(prevFilters.current)) {
        setLoading(false);
        return;
      }
      prevFilters.current = filters;
      setLoading(true);
      try {
        const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
        const data = await userService.getUsers(cleanFilters);
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load users.',
          autoHide: true,
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    },
    [filters, memoizedAddNotification]
  );

  const fetchUsers = useCallback(debounce(() => performFetchUsers(false), 400), [performFetchUsers]);

  useEffect(() => {
    // initial load
    performFetchUsers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // subsequent filter-driven loads
    fetchUsers();
  }, [filters, fetchUsers]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      memoizedAddNotification({
        type: 'success',
        title: 'Success',
        message: `User role updated to ${newRole}`,
        autoHide: true,
        duration: 5000,
      });
      performFetchUsers(true);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update user role:', error);
      memoizedAddNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user role',
        autoHide: true,
        duration: 5000,
      });
    }
  };

  const handleUpdateVerification = async (userId, status, notes) => {
    try {
      await userService.updateVerificationStatus(userId, status, notes);
      memoizedAddNotification({
        type: 'success',
        title: 'Success',
        message: `User verification ${status}`,
        autoHide: true,
        duration: 5000,
      });
      performFetchUsers(true);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update verification status:', error);
      memoizedAddNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update verification status',
        autoHide: true,
        duration: 5000,
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userService.deleteUser(userId);
        memoizedAddNotification({
          type: 'success',
          title: 'Success',
          message: 'User deleted successfully',
          autoHide: true,
          duration: 5000,
        });
        performFetchUsers(true);
        setShowModal(false);
      } catch (error) {
        console.error('Failed to delete user:', error);
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete user',
          autoHide: true,
          duration: 5000,
        });
      }
    }
  };

  const getStatusIcon = (user) => {
    if (user.is_verified) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (user.verification_status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    if (user.verification_status === 'pending') return <Clock className="w-4 h-4 text-yellow-500" />;
    return null;
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      moderator: 'warning',
      client: 'default',
    };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
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
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <SearchBar placeholder="Search users..." onSearch={handleSearch} className="w-full sm:w-64" />
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
              >
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.role}
                onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="client">Client</option>
              </select>
              <Button variant="outline" size="small" onClick={() => performFetchUsers(true)}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
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
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(user)}
                        <span className="ml-2 text-sm text-gray-900">
                          {user.is_verified ? 'Verified' : user.verification_status || 'Not Verified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.date_joined)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
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

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        title="Manage User"
        size="medium"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
              <select
                value={selectedUser.role}
                onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
              >
                <option value="client">Client</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {selectedUser.verification_status === 'pending' && (
              <div className="flex space-x-3">
                <Button variant="primary" size="small" onClick={() => handleUpdateVerification(selectedUser.id, 'approved')}>
                  Approve Verification
                </Button>
                <Button variant="outline" size="small" onClick={() => handleUpdateVerification(selectedUser.id, 'rejected')}>
                  Reject Verification
                </Button>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h3>
              <Button variant="danger" size="small" onClick={() => handleDeleteUser(selectedUser.id)}>
                Delete User
              </Button>
              <p className="text-xs text-gray-500 mt-2">This action cannot be undone. All user data will be permanently deleted.</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default UserManagement;