import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Phone, MapPin, CreditCard } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const VerificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [filter, setFilter] = useState('all');
  const { addNotification } = useNotifications();
  const memoizedAddNotification = useCallback(addNotification, []);
  const prevFilter = useRef(null); // ensure first fetch runs

  const performFetchRequests = useCallback(
    async (force = false) => {
      if (!force && prevFilter.current && filter === prevFilter.current) {
        setLoading(false);
        return;
      }
      prevFilter.current = filter;
      setLoading(true);
      try {
        const params = filter === 'all' ? {} : { status: filter };
        const data = await userService.getVerificationRequests(params);
        setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('[VerificationRequests] Failed to fetch verification requests:', error);
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load verification requests.',
          autoHide: true,
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    },
    [filter, memoizedAddNotification]
  );

  const fetchRequests = useCallback(debounce(() => performFetchRequests(false), 400), [performFetchRequests]);

  useEffect(() => {
    // initial load
    performFetchRequests(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // subsequent filter-driven loads
    fetchRequests();
  }, [filter, fetchRequests]);

  const handleAction = useCallback(
    async (userId, status) => {
      if (!userId) {
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: 'Invalid user ID. Unable to process verification request.',
          autoHide: true,
          duration: 5000,
        });
        return;
      }

      try {
        await userService.updateVerificationStatus(userId, status, actionNotes);
        memoizedAddNotification({
          type: 'success',
          title: 'Success',
          message: `Verification request ${status} successfully.`,
          autoHide: true,
          duration: 5000,
        });
        setShowModal(false);
        setSelectedRequest(null);
        setActionNotes('');
        performFetchRequests(true);
      } catch (error) {
        console.error('[VerificationRequests] Failed to update verification status:', error);
        memoizedAddNotification({
          type: 'error',
          title: 'Error',
          message: `Failed to ${status} verification request.`,
          autoHide: true,
          duration: 5000,
        });
      }
    },
    [actionNotes, memoizedAddNotification, performFetchRequests]
  );

  const getStatusBadge = (status) => {
    const variants = { pending: 'warning', approved: 'success', rejected: 'danger' };
    return <Badge variant={variants[status] || 'default'}>{status || 'Unknown'}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Verification Requests</h1>
              <p className="text-gray-600 mt-1">Review and manage user verification requests</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-700"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Button variant="outline" size="small" onClick={() => performFetchRequests(true)}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NID Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NID Pictures</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={request.user?.profile_picture || '/api/placeholder/40/40'}
                            alt={request.user?.username || 'User'}
                            onError={(e) => (e.currentTarget.src = '/api/placeholder/40/40')}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.user?.username || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{request.user?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                          {request.nid_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {request.nid_front ? (
                            <img
                              className="h-12 w-16 object-cover rounded"
                              src={request.nid_front}
                              alt="NID Front"
                              onError={(e) => (e.currentTarget.src = '/api/placeholder/64/48')}
                            />
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                          {request.nid_back ? (
                            <img
                              className="h-12 w-16 object-cover rounded"
                              src={request.nid_back}
                              alt="NID Back"
                              onError={(e) => (e.currentTarget.src = '/api/placeholder/64/48')}
                            />
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {request.phone || 'N/A'}
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {request.city || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(request.status)}
                          <span className="ml-2">{getStatusBadge(request.status)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(request.submitted_at) || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowModal(true);
                            }}
                            className="text-green-700 hover:text-[#FFB090]"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {request.status === 'pending' && request.user?.id && (
                            <>
                              <button
                                onClick={() => handleAction(request.user.id, 'approved')}
                                className="text-green-600 hover:text-green-800"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleAction(request.user.id, 'rejected')}
                                className="text-red-600 hover:text-red-800"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No verification requests found</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedRequest(null);
            setActionNotes('');
          }}
          title="Verification Request Details"
          size="large"
        >
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">User Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><span className="font-medium">Username:</span> {selectedRequest.user?.username || 'Unknown'}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedRequest.user?.email || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Joined:</span> {formatDate(selectedRequest.user?.date_joined) || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Verification Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><span className="font-medium">NID Number:</span> {selectedRequest.nid_number || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {selectedRequest.phone || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Address:</span> {selectedRequest.address || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">City:</span> {selectedRequest.city || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">State:</span> {selectedRequest.state || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Postcode:</span> {selectedRequest.postcode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">NID Pictures</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Front</p>
                    {selectedRequest.nid_front ? (
                      <img
                        className="max-w-full h-auto rounded"
                        src={selectedRequest.nid_front}
                        alt="NID Front"
                        onError={(e) => (e.currentTarget.src = '/api/placeholder/300/200')}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">No front image provided</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Back</p>
                    {selectedRequest.nid_back ? (
                      <img
                        className="max-w-full h-auto rounded"
                        src={selectedRequest.nid_back}
                        alt="NID Back"
                        onError={(e) => (e.currentTarget.src = '/api/placeholder/300/200')}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">No back image provided</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Notes (Optional)</label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-700"
                    placeholder="Add any notes about this verification decision..."
                  />
                </div>
              )}

              {selectedRequest.status === 'pending' && selectedRequest.user?.id && (
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRequest(null);
                      setActionNotes('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={() => handleAction(selectedRequest.user.id, 'rejected')}>
                    Reject
                  </Button>
                  <Button variant="primary" onClick={() => handleAction(selectedRequest.user.id, 'approved')}>
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default VerificationRequests;