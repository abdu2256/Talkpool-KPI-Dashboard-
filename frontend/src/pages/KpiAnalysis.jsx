import { useState } from 'react';
import Topbar from '../components/Layout/Topbar';
import FilterBar from '../components/common/FilterBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import HourlyLineChart from '../components/charts/HourlyLineChart';
import ThroughputChart from '../components/charts/ThroughputChart';
import DailyTrendChart from '../components/charts/DailyTrendChart';
import DataTable from '../components/common/DataTable';
import { useKpiData } from '../hooks/useKpiData';
import { Link } from 'react-router-dom';

const defaultFilters = { date: '', cluster: 'All', hour: '' };

export default function KpiAnalysis() {
  const [filters, setFilters] = useState(defaultFilters);
  const { summary, hourlyTrend, dailyTrend, records, meta, loading, error } =
    useKpiData(filters);

  const hasData = summary?.record_count > 0;

  return (
    <div className="page-container">
      <Topbar
        title="KPI Analysis"
        subtitle="Deep-dive into network performance metrics"
      />

      <FilterBar filters={filters} onChange={setFilters} meta={meta} />

      {loading && <LoadingSpinner />}

      {!loading && !error && !hasData && (
        <EmptyState
          title="No Data for Analysis"
          message="Upload KPI files to enable detailed analysis."
          action={<Link to="/upload" className="btn btn-primary">Upload Data</Link>}
        />
      )}

      {!loading && !error && hasData && (
        <>
          <div className="analysis-stats">
            <div className="stat-box">
              <span className="stat-label">Records Analyzed</span>
              <span className="stat-value">{summary.record_count}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Avg RRC</span>
              <span className="stat-value">{summary.avg_rrc}%</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Avg ERAB</span>
              <span className="stat-value">{summary.avg_erab}%</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Avg Drop</span>
              <span className="stat-value">{summary.avg_drop}%</span>
            </div>
          </div>

          <div className="charts-grid charts-grid--analysis">
            <div className="chart-card chart-card--wide">
              <h3>Success Rates Over Time (Hourly)</h3>
              <HourlyLineChart data={hourlyTrend} metrics={['rrc', 'erab', 'drop_rate']} />
            </div>
            <div className="chart-card chart-card--wide">
              <h3>Throughput Analysis</h3>
              <ThroughputChart
                data={hourlyTrend.map((d) => ({
                  ...d,
                  label: `${String(d.hour).padStart(2, '0')}:00`,
                }))}
              />
            </div>
            <div className="chart-card chart-card--wide">
              <h3>Daily Performance Trend</h3>
              <DailyTrendChart data={dailyTrend} />
            </div>
          </div>

          <div className="table-section">
            <h3>Filtered Records</h3>
            <DataTable records={records} />
          </div>
        </>
      )}

      {error && <div className="alert alert-error">{error}</div>}
    </div>
  );
}
