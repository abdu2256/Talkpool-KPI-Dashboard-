import { useState } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../components/Layout/Topbar';
import FilterBar from '../components/common/FilterBar';
import KpiCard from '../components/common/KpiCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import DataTable from '../components/common/DataTable';
import HourlyLineChart from '../components/charts/HourlyLineChart';
import ThroughputChart from '../components/charts/ThroughputChart';
import ClusterBarChart from '../components/charts/ClusterBarChart';
import DailyTrendChart from '../components/charts/DailyTrendChart';
import { useKpiData } from '../hooks/useKpiData';

const defaultFilters = { date: '', cluster: 'All', hour: '' };

export default function Dashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const { summary, hourlyTrend, dailyTrend, clusterData, records, meta, loading, error, refetch } =
    useKpiData(filters);

  const hasData = summary?.record_count > 0;

  return (
    <div className="page-container">
      <Topbar
        title="Telecom KPI Dashboard"
        subtitle="Real-time network performance monitoring"
      >
        <button type="button" className="btn btn-secondary" onClick={refetch}>
          Refresh
        </button>
      </Topbar>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        meta={meta}
        showUpload
      />

      {loading && <LoadingSpinner message="Loading KPI data..." />}

      {!loading && error && (
        <div className="alert alert-error">
          <strong>Connection error:</strong> {error}
          <p className="alert-hint">Ensure the backend is running and PostgreSQL is connected.</p>
        </div>
      )}

      {!loading && !error && !hasData && (
        <EmptyState
          title="No KPI Data Yet"
          message="Upload a CSV or XLSX file to populate the dashboard with telecom KPI metrics."
          action={
            <Link to="/upload" className="btn btn-primary">
              Upload KPI Data
            </Link>
          }
        />
      )}

      {!loading && !error && hasData && (
        <>
          <div className="kpi-grid">
            <KpiCard
              title="RRC Setup Success"
              value={summary.avg_rrc}
              unit="%"
              icon="📶"
              variant="blue"
            />
            <KpiCard
              title="ERAB Setup Success"
              value={summary.avg_erab}
              unit="%"
              icon="🔗"
              variant="green"
            />
            <KpiCard
              title="Drop Rate"
              value={summary.avg_drop}
              unit="%"
              icon="📉"
              variant="red"
            />
            <KpiCard
              title="DL Throughput"
              value={summary.avg_dl}
              unit="Mbps"
              icon="⬇️"
              variant="purple"
            />
            <KpiCard
              title="UL Throughput"
              value={summary.avg_ul}
              unit="Mbps"
              icon="⬆️"
              variant="teal"
            />
            <KpiCard
              title="Total Records"
              value={summary.record_count}
              icon="📋"
              variant="gray"
            />
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Hourly Success Rate Trend</h3>
              {hourlyTrend.length ? (
                <HourlyLineChart data={hourlyTrend} metrics={['rrc', 'erab', 'drop_rate']} />
              ) : (
                <p className="chart-empty">No hourly data for selected filters</p>
              )}
            </div>
            <div className="chart-card">
              <h3>Throughput by Hour</h3>
              {hourlyTrend.length ? (
                <ThroughputChart
                  data={hourlyTrend.map((d) => ({
                    ...d,
                    label: `${String(d.hour).padStart(2, '0')}:00`,
                  }))}
                />
              ) : (
                <p className="chart-empty">No throughput data</p>
              )}
            </div>
            <div className="chart-card">
              <h3>Cluster Comparison (RRC)</h3>
              {clusterData.length ? (
                <ClusterBarChart data={clusterData} dataKey="rrc" name="RRC Success %" />
              ) : (
                <p className="chart-empty">No cluster data</p>
              )}
            </div>
            <div className="chart-card">
              <h3>Daily RRC Trend</h3>
              {dailyTrend.length ? (
                <DailyTrendChart data={dailyTrend} />
              ) : (
                <p className="chart-empty">No daily trend data</p>
              )}
            </div>
          </div>

          <div className="table-section">
            <h3>Recent KPI Records</h3>
            <DataTable records={records} />
          </div>
        </>
      )}
    </div>
  );
}
