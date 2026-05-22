/**
 * KPI records data table
 */
export default function DataTable({ records }) {
  if (!records?.length) return null;

  const formatDate = (d) => {
    if (!d) return '—';
    return d instanceof Date ? d.toISOString().split('T')[0] : String(d).split('T')[0];
  };

  const fmt = (v) =>
    v === null || v === undefined ? '—' : Number(v).toFixed(2);

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Hour</th>
            <th>Cluster</th>
            <th>RRC %</th>
            <th>ERAB %</th>
            <th>Drop %</th>
            <th>DL Mbps</th>
            <th>UL Mbps</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id || `${r.record_date}-${r.record_hour}-${r.cluster}`}>
              <td>{formatDate(r.record_date)}</td>
              <td>{String(r.record_hour).padStart(2, '0')}:00</td>
              <td><span className="cluster-badge">{r.cluster}</span></td>
              <td>{fmt(r.rrc_setup_success_rate)}</td>
              <td>{fmt(r.erab_setup_success_rate)}</td>
              <td>{fmt(r.drop_rate)}</td>
              <td>{fmt(r.per_user_throughput_dl)}</td>
              <td>{fmt(r.per_user_throughput_ul)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
