// src/pages/admin/VerificationRequests.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, FileText } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';

const VerificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [filter, setFilter] = useState('pending');
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await userService.getVerificationRequests({ status: filter });
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (userId, status) => {
    try {
      await userService.updateVerificationStatus(userId, status, actionNotes);
      addNotification({
        type: 'success',
        title: 'Verification Updated',
        message: `User verification ${status}.`,
      });
      setShowModal(false);
      setSelectedRequest(null);
      setActionNotes('');
      fetchRequests();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update verification status.',
      });
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Verification Requests</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(request.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">{request.user.username}</h3>
                      <Badge variant={request.status === 'pending' ? 'warning' : request.status === 'approved' ? 'success' : 'danger'}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{request.user.email}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      <div>
                        <span className="text-xs text-gray-500">NID Number:</span>
                        <p className="text-sm font-medium">{request.nid_number}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Phone:</span>
                        <p className="text-sm font-medium">{request.phone}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Address:</span>
                        <p className="text-sm">{request.address}, {request.city}, {request.state} {request.postcode}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Submitted:</span>
                        <p className="text-sm">{formatDate(request.submitted_at)}</p>
                      </div>
                    </div>
                    {request.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {request.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Eye size={16} />
                    <span>View Documents</span>
                  </button>
                  
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleVerificationAction(request.user.id, 'approved')}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerificationAction(request.user.id, 'rejected')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No {filter} verification requests found.</p>
          </div>
        )}
      </div>

      {/* Document View Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedRequest(null);
          setActionNotes('');
        }}
        title="Verification Documents"
        size="large"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">NID Front</h4>
                <img
                  src={selectedRequest.nid_front}
                  alt="NID Front"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">NID Back</h4>
                <img
                  src={selectedRequest.nid_back}
                  alt="NID Back"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Notes (Optional)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Add any notes about this verification decision..."
                />
                <div className="flex justify-end space-x-3 mt-4">
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
                  <Button
                    variant="danger"
                    onClick={() => handleVerificationAction(selectedRequest.user.id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleVerificationAction(selectedRequest.user.id, 'approved')}
                  >
                    Approve
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

export default VerificationRequests;