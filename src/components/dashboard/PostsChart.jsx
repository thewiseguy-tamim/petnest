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
import LoadingSpinner from '../common/LoadingSpinner';

const PostsChart = ({ dateRange }) => {
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
fetchPostsData();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [dateRange]);

const fetchPostsData = async () => {
setLoading(true);
try {
const response = await analyticsService.getPostsAnalytics(dateRange);
if (response && response.petsByCategory) {
const chartData = response.petsByCategory.map((item) => ({
category: item.category,
count: item.count,
adoptions: Math.floor(item.count * 0.3),
sales: Math.floor(item.count * 0.7),
}));
setData(chartData);
} else {
setData([]);
}
} catch (error) {
console.error('Failed to fetch posts data:', error);
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
No data available
</div>
);
}

return (
<ResponsiveContainer width="100%" height={300}>
<AreaChart data={data} margin={{ top: 5, right: 30, left: 8, bottom: 5 }}>
<defs>
<linearGradient id="adoptionsGrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
<stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
</linearGradient>
<linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5} />
<stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
</linearGradient>
</defs>
<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
<XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '12px' }} />
<YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
<Tooltip
contentStyle={{
backgroundColor: 'white',
border: '1px solid #e5e7eb',
borderRadius: '6px',
}}
/>
<Legend />
<Area type="monotone" dataKey="adoptions" stackId="1" stroke="#10B981" fill="url(#adoptionsGrad)" name="Adoptions" />
<Area type="monotone" dataKey="sales" stackId="1" stroke="#F59E0B" fill="url(#salesGrad)" name="Sales" />
</AreaChart>
</ResponsiveContainer>
);
};

export default PostsChart;