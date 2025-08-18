import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DateRangePicker from '../../components/dashboard/DateRangePicker';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import analyticsService from '../../services/analyticsService';
import petService from '../../services/petService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';

const toNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const startOfRange = (range) => {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case 'day':
      d.setDate(now.getDate() - 1);
      break;
    case 'week':
      d.setDate(now.getDate() - 6);
      break;
    case 'month':
      d.setDate(now.getDate() - 29);
      break;
    case 'year':
      d.setFullYear(now.getFullYear() - 1);
      break;
    default:
      d.setDate(now.getDate() - 29);
  }
  d.setHours(0, 0, 0, 0);
  return d;
};

const dateKey = (date) => {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
};

const labelFor = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const buildChartFromPayments = (payments, range) => {
  const start = startOfRange(range);
  const filtered = payments
    .filter((p) => (p.status || '').toLowerCase() === 'completed')
    .filter((p) => new Date(p.created_at) >= start);

  const map = new Map();
  filtered.forEach((p) => {
    const key = dateKey(p.created_at);
    const sum = map.get(key) || 0;
    map.set(key, sum + toNumber(p.amount));
  });

  const days = [];
  const cursor = new Date(start);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  while (cursor <= today) {
    const key = dateKey(cursor);
    days.push({ date: labelFor(cursor), amount: toNumber(map.get(key) || 0) });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const normalizeTransactions = (txs) =>
  txs
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
    .map((t) => ({
      id: t.transaction_id || t.id, // keep gateway ID for display
      amount: toNumber(t.amount),
      status: (t.status || '').toLowerCase(),
      date: t.created_at,
    }));

const RevenueReports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [revenueData, setRevenueData] = useState({
    summary: { totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 },
    chartData: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const [analyticsResp, paymentsResp] = await Promise.all([
        analyticsService.getRevenueData(dateRange).catch(() => null),
        petService.getPaymentHistory().catch(() => []),
      ]);

      const payments = Array.isArray(paymentsResp) ? paymentsResp : [];

      // Always compute summary from completed payments to ensure correctness
      const completed = payments.filter((p) => (p.status || '').toLowerCase() === 'completed');
      const totalRevenue = completed.reduce((s, p) => s + toNumber(p.amount), 0);
      const totalTransactions = completed.length;
      const averageTransaction = totalTransactions ? totalRevenue / totalTransactions : 0;

      // Chart: prefer analytics chartData if valid; otherwise build from payments
      const chartData =
        analyticsResp?.chartData && Array.isArray(analyticsResp.chartData) && analyticsResp.chartData.length
          ? analyticsResp.chartData.map((d) => ({
              date: d.date || labelFor(new Date()),
              amount: toNumber(d.amount),
            }))
          : buildChartFromPayments(payments, dateRange);

      // Recent transactions:
      // Use analytics only if it includes gateway transaction_id; otherwise fall back to payments to ensure correctness.
      const useAnalyticsRecent =
        Array.isArray(analyticsResp?.recentTransactions) &&
        analyticsResp.recentTransactions.length > 0 &&
        analyticsResp.recentTransactions.every((t) => t && t.transaction_id);

      const recentTransactions = useAnalyticsRecent
        ? analyticsResp.recentTransactions.map((t) => ({
            id: t.transaction_id || t.id, // prefer gateway transaction ID
            amount: toNumber(t.amount),
            status: (t.status || '').toLowerCase(),
            date: t.date || t.created_at,
          }))
        : normalizeTransactions(payments);

      setRevenueData({
        summary: { totalRevenue, totalTransactions, averageTransaction },
        chartData,
        recentTransactions,
      });
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      setRevenueData({
        summary: { totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 },
        chartData: [],
        recentTransactions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await analyticsService.exportAnalyticsData('revenue', dateRange);
    } catch (error) {
      console.error('Failed to export data:', error);
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

  const summary = revenueData.summary;

  const statusPillClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
      case 'valid': // safety for alt labels
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'failed':
      case 'invalid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusLabel = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'valid') return 'Completed';
    if (s) return s.charAt(0).toUpperCase() + s.slice(1);
    return 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Revenue Reports</h1>
              <p className="text-gray-600 mt-1">Track your platform's financial performance</p>
            </div>
            <div className="flex items-center gap-3">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(toNumber(summary.totalRevenue))}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {summary.totalTransactions || 0}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Total Transactions</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(toNumber(summary.averageTransaction))}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Average Transaction</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData?.recentTransactions?.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{transaction.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(toNumber(transaction.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusPillClass(transaction.status)}`}>
                        {statusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RevenueReports;