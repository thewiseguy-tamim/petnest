import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import { CheckCircle, XCircle, Clock, User, Phone, MapPin, CreditCard, Eye } from 'lucide-react';

// Simple error boundary component
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error, errorInfo) => {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
      setHasError(true);
    };
    // Simulate componentDidCatch for functional components
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) return fallback;
  return children;
};

// Simple debounce function to limit rapid API calls
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
  const renderCount = useRef(0);
  const prevFilter = useRef(filter);

  // Track component renders
  renderCount.current += 1;
  console.debug(`[VerificationRequests] Component rendered ${renderCount.current} times`);

  // Memoize addNotification to ensure stability
  const memoizedAddNotification = useCallback(addNotification, []);

  // Core fetchRequests logic without debounce for direct calls
  const performFetchRequests = useCallback(
    async (force = false) => {
      console.debug(`[VerificationRequests] performFetchRequests called with filter: ${filter}, force: ${force}`);
      if (!force && filter === prevFilter.current) {
        console.debug('[VerificationRequests] Filter unchanged, skipping fetchRequests');
        setLoading(false);
        return;
      }
      prevFilter.current = filter;
      setLoading(true);
      try {
        const params = filter === 'all' ? {} : { status: filter };
        console.debug('[VerificationRequests] Fetching with params:', JSON.stringify(params));
        const data = await userService.getVerificationRequests(params);
        console.debug('[VerificationRequests] Fetched requests:', data);
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
        console.debug('[VerificationRequests] performFetchRequests completed, loading set to false');
      }
    },
    [filter, memoizedAddNotification]
  );

  // Debounced fetchRequests for automatic calls (e.g., via useEffect)
  const fetchRequests = useCallback(
    debounce(() => performFetchRequests(false), 500),
    [performFetchRequests]
  );

  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    console.debug('[VerificationRequests] Refresh button clicked, forcing fetchRequests');
    performFetchRequests(true);
  }, [performFetchRequests]);

  useEffect(() => {
    console.debug('[VerificationRequests] useEffect triggered with fetchRequests dependency');
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = useCallback(
    async (userId, status) => {
      console.debug(`[VerificationRequests] handleAction called with userId: ${userId}, status: ${status}`);
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

  const getStatusBadge = useCallback((status) => {
    console.debug(`[VerificationRequests] getStatusBadge called with status: ${status}`);
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status || 'Unknown'}</Badge>;
  }, []);

  const getStatusIcon = useCallback((status) => {
    console.debug(`[VerificationRequests] getStatusIcon called with status: ${status}`);
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  }, []);

  // Fallback UI for error boundary
  const errorFallback = (
    <div className="text-center py-12">
      <p className="text-lg font-medium text-red-600">An error occurred while loading verification requests.</p>
      <p className="mt-2 text-sm text-gray-500">
        Please try refreshing the page or contact support if the issue persists.
      </p>
      <Button
        variant="primary"
        className="mt-4"
        onClick={handleRefresh}
      >
        Try Again
      </Button>
    </div>
  );

  if (loading) {
    console.debug('[VerificationRequests] Rendering loading state');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  console.debug('[VerificationRequests] Rendering main component with requests:', requests.length);
  return (
    <DashboardLayout>
      <ErrorBoundary fallback={errorFallback}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Verification Requests</h1>
                <p className="text-gray-600 mt-1">Review and manage user verification requests</p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={filter}
                  onChange={(e) => {
                    console.debug('[VerificationRequests] Filter changed to:', e.target.value);
                    setFilter(e.target.value);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
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

          {/* Requests List */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            {requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NID Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
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
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.user?.username || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.user?.email || 'N/A'}
                              </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.created_at) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                console.debug('[VerificationRequests] View Details button clicked for request:', request.id);
                                setSelectedRequest(request);
                                setShowModal(true);
                              }}
                              className="text-[#FFCAB0] hover:text-[#FFB090]"
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
        </div>

        {/* Details Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            console.debug('[VerificationRequests] Modal closed');
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

              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Notes (Optional)
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => {
                      console.debug('[VerificationRequests] Action notes updated:', e.target.value);
                      setActionNotes(e.target.value);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCAB0]"
                    placeholder="Add any notes about this verification decision..."
                  />
                </div>
              )}

              {selectedRequest.status === 'pending' && selectedRequest.user?.id && (
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.debug('[VerificationRequests] Cancel button clicked in modal');
                      setShowModal(false);
                      setSelectedRequest(null);
                      setActionNotes('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleAction(selectedRequest.user.id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleAction(selectedRequest.user.id, 'approved')}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default VerificationRequests;