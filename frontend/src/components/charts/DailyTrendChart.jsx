import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DailyTrendChart({ data }) {
  if (!data?.length) return null;

  const chartData = data.map((d) => ({
    ...d,
    label: d.date instanceof Date ? d.date.toISOString().split('T')[0] : String(d.date).split('T')[0],
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorRrc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0B5ED7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0B5ED7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} domain={[90, 100]} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="rrc"
          name="Avg RRC %"
          stroke="#0B5ED7"
          fill="url(#colorRrc)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
