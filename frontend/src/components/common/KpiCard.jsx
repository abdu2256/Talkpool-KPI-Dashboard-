/**
 * KPI summary metric card
 */
export default function KpiCard({ title, value, unit, trend, icon, variant = 'blue' }) {
  const displayValue =
    value === null || value === undefined || value === ''
      ? '—'
      : typeof value === 'number'
        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : value;

  return (
    <div className={`kpi-card kpi-card--${variant}`}>
      <div className="kpi-card-header">
        <span className="kpi-card-icon">{icon}</span>
        <span className="kpi-card-title">{title}</span>
      </div>
      <div className="kpi-card-value">
        {displayValue}
        {unit && displayValue !== '—' && <span className="kpi-card-unit">{unit}</span>}
      </div>
      {trend && <div className="kpi-card-trend">{trend}</div>}
    </div>
  );
}
