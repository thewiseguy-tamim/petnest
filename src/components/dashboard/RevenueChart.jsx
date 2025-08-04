// src/components/dashboard/RevenueChart.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import LoadingSpinner from '../common/LoadingSpinner';

const RevenueChart = ({ dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await analyticsService.getRevenueData(dateRange);
      // Ensure we have the chartData array
      if (response && response.chartData && Array.isArray(response.chartData)) {
        setData(response.chartData);
      } else {
        console.error('Invalid data structure from getRevenueData:', response);
        setData([]);
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No revenue data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
          formatter={(value) => [`$${value}`, 'Revenue']}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#FFCAB0"
          strokeWidth={2}
          dot={{ fill: '#FFCAB0', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;