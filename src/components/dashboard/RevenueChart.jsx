import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

const toNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const currencyFull = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

// Round up to a “nice” upper bound for the Y axis (multiples of 10)
const niceUpper = (maxVal) => {
  if (!Number.isFinite(maxVal) || maxVal <= 0) return 1;
  const step = 10;
  return Math.ceil(maxVal / step) * step;
};

const RevenueChart = ({ dateRange, data: incomingData }) => {
  // Use data as-is (no re-aggregation or date parsing)
  const data = useMemo(() => {
    const arr = Array.isArray(incomingData) ? incomingData : [];
    const cleaned = arr
      .map((d) => ({
        date: String(d?.date ?? ''),
        amount: Math.round(toNumber(d?.amount) * 100) / 100,
      }))
      .filter((d) => Number.isFinite(d.amount));

    // If all dates are YYYY-MM-DD, sort by date; otherwise, keep original order
    const allYMD = cleaned.length > 0 && cleaned.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date));
    if (allYMD) {
      cleaned.sort((a, b) => a.date.localeCompare(b.date));
    }

    return cleaned;
  }, [incomingData, dateRange]);

  if (incomingData === undefined) {
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

  // Trend: compare last vs first point (assuming incoming order is chronological for non-YYYY-MM-DD labels)
  const first = data[0]?.amount ?? 0;
  const last = data[data.length - 1]?.amount ?? 0;
  const diff = last - first;

  let trend = 'flat';
  if (diff > 0) trend = 'up';
  if (diff < 0) trend = 'down';

  const pct = first > 0 ? (diff / first) * 100 : last > 0 ? 100 : 0;
  const pctLabel = first === 0 && last > 0 ? 'New' : `${Math.abs(pct).toFixed(1)}%`;

  const COLORS = {
    up: '#16a34a',   // green-600
    down: '#ef4444', // red-500
    flat: '#64748b', // slate-500
  };

  const BADGE = {
    up: 'text-green-700 bg-green-50 border-green-200',
    down: 'text-red-700 bg-red-50 border-red-200',
    flat: 'text-slate-700 bg-slate-50 border-slate-200',
  };

  const TREND_SYMBOL = { up: '▲', down: '▼', flat: '▬' };

  // Y-axis ticks: only show 0 and the nice upper bound
  const maxY = Math.max(...data.map((d) => d.amount), 0);
  const upper = niceUpper(maxY);
  const yTicks = [0, upper];

  // Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const current = toNumber(payload[0].value);
    return (
      <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">
          {currencyFull.format(current)}
        </div>
      </div>
    );
  };

  // Value labels above bars for non-zero values
  const BarValueLabel = (props) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    const cx = x + width / 2;
    const cy = y - 6;
    return (
      <text
        x={cx}
        y={cy}
        fill="#111827"
        textAnchor="middle"
        fontSize={12}
      >
        {currencyFull.format(toNumber(value))}
      </text>
    );
  };

  return (
    <div className="w-full">
      {/* Trend badge */}
      <div className="flex justify-end mb-2">
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${BADGE[trend]}`}>
          <span>{TREND_SYMBOL[trend]}</span>
          <span>
            {trend === 'flat' ? 'Flat' : trend === 'up' ? 'Up' : 'Down'} {pctLabel}
          </span>
          <span className="text-gray-400">vs start</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 24, left: 8, bottom: 5 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS[trend]} stopOpacity={0.8} />
              <stop offset="100%" stopColor={COLORS[trend]} stopOpacity={0.4} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            minTickGap={16}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            ticks={yTicks}
            domain={[0, upper]}
            allowDecimals={false}
            width={60}
            tickFormatter={(v) => `$${Math.round(v)}`}
          />
          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="amount"
            fill="url(#barGrad)"
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationDuration={600}
          >
            <LabelList dataKey="amount" content={BarValueLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;