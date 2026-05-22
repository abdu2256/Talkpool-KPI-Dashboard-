import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  rrc: '#0B5ED7',
  erab: '#198754',
  drop: '#DC3545',
};

export default function HourlyLineChart({ data, metrics = ['rrc', 'erab'] }) {
  if (!data?.length) return null;

  const chartData = data.map((d) => ({
    ...d,
    label: `${String(d.hour).padStart(2, '0')}:00`,
  }));

  const lines = [
    { key: 'rrc', name: 'RRC Success %', color: COLORS.rrc },
    { key: 'erab', name: 'ERAB Success %', color: COLORS.erab },
    { key: 'drop_rate', name: 'Drop Rate %', color: COLORS.drop },
  ].filter((l) =>
    metrics.some(
      (m) => l.key === m || l.key === `${m}_rate` || l.key.startsWith(m)
    )
  );

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
          }}
        />
        <Legend />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
