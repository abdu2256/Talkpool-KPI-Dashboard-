import { Link } from 'react-router-dom';

/**
 * Reusable filter controls: date, cluster, hour
 */
export default function FilterBar({ filters, onChange, meta, showUpload = false }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="filter-date">Date</label>
        <select
          id="filter-date"
          value={filters.date}
          onChange={(e) => onChange({ ...filters, date: e.target.value })}
        >
          <option value="">All Dates</option>
          {(meta?.dates || []).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-cluster">Cluster</label>
        <select
          id="filter-cluster"
          value={filters.cluster}
          onChange={(e) => onChange({ ...filters, cluster: e.target.value })}
        >
          <option value="All">All Clusters</option>
          {(meta?.clusters || []).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-hour">Hour</label>
        <select
          id="filter-hour"
          value={filters.hour}
          onChange={(e) => onChange({ ...filters, hour: e.target.value })}
        >
          <option value="">All Hours</option>
          {hours.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </div>

      {showUpload && (
        <Link to="/upload" className="btn btn-primary filter-upload-btn">
          Upload Data
        </Link>
      )}
    </div>
  );
}
