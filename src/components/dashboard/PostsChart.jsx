// src/components/dashboard/PostsChart.jsx
import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import analyticsService from '../../services/analyticsService';

const PostsChart = ({ dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostsData();
  }, [dateRange]);

  const fetchPostsData = async () => {
    setLoading(true);
    try {
      const response = await analyticsService.getPostsAnalytics(dateRange);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch posts data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="adoptions"
          stackId="1"
          stroke="#10B981"
          fill="#10B981"
          fillOpacity={0.6}
          name="Adoptions"
        />
        <Area
          type="monotone"
          dataKey="sales"
          stackId="1"
          stroke="#FFCAB0"
          fill="#FFCAB0"
          fillOpacity={0.6}
          name="Sales"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PostsChart;