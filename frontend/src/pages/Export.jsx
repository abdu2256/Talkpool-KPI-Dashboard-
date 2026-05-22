import { useState, useEffect } from 'react';
import Topbar from '../components/Layout/Topbar';
import FilterBar from '../components/common/FilterBar';
import { kpiApi } from '../services/api';

const defaultFilters = { date: '', cluster: 'All', hour: '' };

export default function Export() {
  const [filters, setFilters] = useState(defaultFilters);
  const [meta, setMeta] = useState({ clusters: [], dates: [] });
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    kpiApi
      .getMeta()
      .then((res) => setMeta(res.data.data || { clusters: [], dates: [] }))
      .catch(() => {});
  }, []);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setMessage(null);

    const params = {
      date: filters.date || undefined,
      cluster: filters.cluster !== 'All' ? filters.cluster : undefined,
      hour: filters.hour !== '' ? filters.hour : undefined,
    };

    try {
      const res = await kpiApi.exportCSV(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talkpool-kpi-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Report exported successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-container">
      <Topbar
        title="Export Reports"
        subtitle="Download filtered KPI data as CSV"
      />

      <div className="export-panel">
        <FilterBar filters={filters} onChange={setFilters} meta={meta} />

        <div className="export-options">
          <h3>Export Options</h3>
          <p>Export all KPI records matching the selected filters to a CSV file.</p>
          <ul>
            <li>Includes all 8 KPI columns</li>
            <li>Compatible with Excel and BI tools</li>
            <li>Up to 10,000 records per export</li>
          </ul>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Generating...' : 'Download CSV Report'}
          </button>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
