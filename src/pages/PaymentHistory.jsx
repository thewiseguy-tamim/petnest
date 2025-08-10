// src/pages/PaymentHistory.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import petService from '../services/petService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Link } from 'react-router-dom';

const chipStyles = (status) => {
  // Map API statuses: 'pending', 'completed', 'failed'
  const base = {
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
  };
  switch (String(status).toLowerCase()) {
    case 'completed':
      return { ...base, background: '#E6F5EF', color: '#009966' }; // primary tint
    case 'pending':
      return { ...base, background: '#FFEFB5', color: '#3F3D56' }; // secondary + accent
    case 'failed':
    default:
      return { ...base, background: '#EAEAF2', color: '#3F3D56' }; // accent tint
  }
};

const iconForStatus = (status) => {
  switch (String(status).toLowerCase()) {
    case 'completed':
      return <CheckCircle className="w-3 h-3 mr-1" />;
    case 'pending':
      return <Clock className="w-3 h-3 mr-1" />;
    case 'failed':
    default:
      return <XCircle className="w-3 h-3 mr-1" />;
  }
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const data = await petService.getPaymentHistory();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF5' }}>
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="min-h-screen py-8 pt-33" style={{ background: '#FAFAF5', color: '#0F0F0F' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#0F0F0F' }}>Payments</h1>
          <Link
            to="/pets/create"
            className="inline-flex items-center px-4 py-2 rounded-md font-semibold"
            style={{ background: '#009966', color: '#FFFFFF' }}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Start New Listing
          </Link>
        </div>

        {/* Info banner */}
        <div className="rounded-md p-4 mb-6" style={{ background: '#FFEFB5', color: '#3F3D56' }}>
          <p className="text-sm">
            Your first listing is free. After that: $5 for Adoption listings and $20 for Sale listings.
            You’ll be redirected to a secure gateway when payment is required.
          </p>
        </div>

        {/* Content */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No payment history found</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ background: '#FAFAF5' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3F3D56' }}>
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3F3D56' }}>
                    Pet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3F3D56' }}>
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3F3D56' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3F3D56' }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#0F0F0F' }}>
                      <div className="flex items-center">
                        <span className="truncate">{payment.transaction_id}</span>
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="ml-2 text-xs underline"
                          style={{ color: '#009966' }}
                          title="Copy Transaction ID"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            navigator.clipboard.writeText(payment.transaction_id || '');
                          }}
                        >
                          Copy
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#3F3D56' }}>
                      {payment.pet_name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: '#0F0F0F' }}>
                      {formatCurrency(payment.amount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span style={chipStyles(payment.status)}>
                        {iconForStatus(payment.status)}
                        {String(payment.status || '').charAt(0).toUpperCase() + String(payment.status || '').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#3F3D56' }}>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(payment.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer actions */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: '#FAFAF5' }}>
              <div className="text-xs" style={{ color: '#3F3D56' }}>
                Need help with a payment? Contact support.
              </div>
              <Link
                to="/pets/create"
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-semibold"
                style={{ background: '#009966', color: '#FFFFFF' }}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                New Listing
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;