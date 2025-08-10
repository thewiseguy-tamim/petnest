// src/components/dashboard/UserGrowthChart.jsx
import React, { useState, useEffect } from 'react';
import {
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer,
Legend,
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import LoadingSpinner from '../common/LoadingSpinner';

const UserGrowthChart = ({ dateRange }) => {
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
fetchUserData();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [dateRange]);

const fetchUserData = async () => {
setLoading(true);
try {
const response = await analyticsService.getUserGrowthData(dateRange);
if (response && response.chartData && Array.isArray(response.chartData)) {
setData(response.chartData);
} else {
console.error('Invalid data structure from getUserGrowthData:', response);
setData([]);
}
} catch (error) {
console.error('Failed to fetch user data:', error);
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
<BarChart data={data} margin={{ top: 5, right: 30, left: 8, bottom: 5 }}>
<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
<XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
<YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
<Tooltip
contentStyle={{
backgroundColor: 'white',
border: '1px solid #e5e7eb',
borderRadius: '6px',
}}
/>
<Legend />
<Bar dataKey="newUsers" name="New Users" fill="#60A5FA" radius={[6, 6, 0, 0]} />
<Bar dataKey="totalUsers" name="Total Users" fill="#A78BFA" radius={[6, 6, 0, 0]} />
</BarChart>
</ResponsiveContainer>
);
};

export default UserGrowthChart;