import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import userService from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

const VerificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await userService.getVerificationRequests({ status: 'pending' });
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch verification requests:', error);
      addNotification('error', error.message || 'Failed to load verification requests.');
      if (error.message.includes('Session expired')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, status, notes = '') => {
    if (!userId) {
      addNotification('error', 'Invalid user ID. Unable to process verification request.');
      return;
    }
    try {
      await userService.updateVerificationStatus(userId, status, notes);
      addNotification('success', `Verification request ${status} successfully.`);
      fetchRequests();
    } catch (error) {
      console.error('Failed to update verification status:', error);
      addNotification('error', error.message || `Failed to ${status} verification request.`);
      if (error.message.includes('Session expired')) {
        navigate('/login');
      }
    }
  };

  return (
    <DashboardLayout title="Verification Requests">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pending Verification Requests</h2>
          {requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">User</th>
                    <th className="py-2 px-4 border-b text-left">NID Number</th>
                    <th className="py-2 px-4 border-b text-left">Phone</th>
                    <th className="py-2 px-4 border-b text-left">Address</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="py-2 px-4 border-b">
                        {request.user?.id ? (
                          <Link to={`/admin/users/${request.user.id}`} className="text-blue-600 hover:underline">
                            {request.user?.username || 'Unknown'} ({request.user?.email || 'N/A'})
                          </Link>
                        ) : (
                          <span className="text-gray-500">Unknown User</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">{request.nid_number || 'N/A'}</td>
                      <td className="py-2 px-4 border-b">{request.phone || 'N/A'}</td>
                      <td className="py-2 px-4 border-b">
                        {request.address && request.city && request.state && request.postcode
                          ? `${request.address}, ${request.city}, ${request.state} ${request.postcode}`
                          : 'N/A'}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleAction(request.user?.id, 'approved')}
                          className="mr-2 text-green-600 hover:text-green-800"
                          title="Approve"
                          disabled={!request.user?.id}
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleAction(request.user?.id, 'rejected', 'Rejected via dashboard')}
                          className="text-red-600 hover:text-red-800"
                          title="Reject"
                          disabled={!request.user?.id}
                        >
                          <XCircle size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No pending verification requests.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default VerificationRequests;