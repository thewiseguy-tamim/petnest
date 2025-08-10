import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DateRangePicker from '../../components/dashboard/DateRangePicker';
import UserGrowthChart from '../../components/dashboard/UserGrowthChart';
import PostsChart from '../../components/dashboard/PostsChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import analyticsService from '../../services/analyticsService';
import petService from '../../services/petService';
import StatsCard from '../../components/dashboard/StatsCard';
import { TrendingUp, Users, FileText, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const toNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const sumCompletedPayments = (payments) => {
  if (!Array.isArray(payments)) return 0;
  return payments
    .filter((p) => (p.status || '').toLowerCase() === 'completed')
    .reduce((sum, p) => sum + toNumber(p.amount), 0);
};

const Analytics = () => {
  const [dateRange, setDateRange] = useState('month');
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsResp, paymentsResp] = await Promise.all([
        analyticsService.getAdminStats(dateRange).catch(() => ({})),
        petService.getPaymentHistory().catch(() => []),
      ]);
      setStats(statsResp || {});
      setPayments(Array.isArray(paymentsResp) ? paymentsResp : []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setStats({});
      setPayments([]);
    } finally {
      setLoading(false);
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

  const totalUsers = stats?.overview?.totalUsers ?? 0;
  const totalPosts = stats?.overview?.totalPosts ?? 0;
  const activeUsers = stats?.overview?.activeUsers ?? 0;
  const verifiedUsers = stats?.overview?.verifiedUsers ?? 0;
  const userGrowth = toNumber(stats?.growth?.userGrowth ?? 0);
  const postGrowth = toNumber(stats?.growth?.postGrowth ?? 0);

  // Force Total Revenue from payments (completed only)
  const totalRevenueFromPayments = sumCompletedPayments(payments);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your platform's performance and growth</p>
            </div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            change={`${userGrowth}% vs last`}
            changeType="positive"
          />
          <StatsCard
            title="Total Posts"
            value={totalPosts}
            icon={FileText}
            change={`${postGrowth}% vs last`}
            changeType="positive"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(totalRevenueFromPayments)}
            icon={DollarSign}
            change="Completed payments"
            changeType="positive"
          />
          <StatsCard
            title="Active Users"
            value={activeUsers}
            icon={TrendingUp}
            change={`${verifiedUsers} verified`}
            changeType="positive"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
            <UserGrowthChart dateRange={dateRange} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts Activity</h2>
            <PostsChart dateRange={dateRange} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;