// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import SearchBar from '../../components/common/SearchBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';

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

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers(filters);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      addNotification({
        type: 'success',
        title: 'Role Updated',
        message: `User role updated to ${newRole}`,
      });
      fetchUsers();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update user role',
      });
    }
  };

  const handleUpdateVerification = async (userId, status, notes) => {
    try {
      await userService.updateVerificationStatus(userId, status, notes);
      addNotification({
        type: 'success',
        title: 'Verification Updated',
        message: `User verification ${status}`,
      });
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update verification status',
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <div className="flex items-center space-x-4">
            <SearchBar
              placeholder="Search users..."
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="client">Client</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
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
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.profile_picture || '/api/placeholder/40/40'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="default">{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(user.verification_status)}
                      <span className="ml-2 text-sm text-gray-900">
                        {user.verification_status || 'Not Verified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
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

      {/* User Management Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Manage User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Change Role</h3>
              <select
                value={selectedUser.role}
                onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="client">Client</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {selectedUser.verification_status === 'pending' && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Verification Action</h3>
                <div className="space-x-2">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleUpdateVerification(selectedUser.id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleUpdateVerification(selectedUser.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default UserManagement;