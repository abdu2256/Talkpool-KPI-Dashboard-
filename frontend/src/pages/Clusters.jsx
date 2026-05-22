import { useState } from 'react';
import Topbar from '../components/Layout/Topbar';
import FilterBar from '../components/common/FilterBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ClusterBarChart from '../components/charts/ClusterBarChart';
import { useKpiData } from '../hooks/useKpiData';
import { Link } from 'react-router-dom';

const defaultFilters = { date: '', cluster: 'All', hour: '' };

export default function Clusters() {
  const [filters, setFilters] = useState(defaultFilters);
  const { clusterData, meta, loading, error } = useKpiData(filters);

  const hasData = clusterData?.length > 0;

  return (
    <div className="page-container">
      <Topbar
        title="Cluster Analysis"
        subtitle="Compare KPI performance across network clusters"
      />

      <FilterBar filters={filters} onChange={setFilters} meta={meta} />

      {loading && <LoadingSpinner />}

      {!loading && !error && !hasData && (
        <EmptyState
          title="No Cluster Data"
          message="Upload KPI data with cluster identifiers to enable cluster analysis."
          action={<Link to="/upload" className="btn btn-primary">Upload Data</Link>}
        />
      )}

      {!loading && !error && hasData && (
        <>
          <div className="cluster-cards">
            {clusterData.map((c) => (
              <div key={c.cluster} className="cluster-card">
                <h4>{c.cluster}</h4>
                <div className="cluster-metrics">
                  <div>
                    <span className="metric-label">RRC</span>
                    <span className="metric-value">{c.rrc}%</span>
                  </div>
                  <div>
                    <span className="metric-label">ERAB</span>
                    <span className="metric-value">{c.erab}%</span>
                  </div>
                  <div>
                    <span className="metric-label">Drop</span>
                    <span className="metric-value">{c.drop_rate}%</span>
                  </div>
                  <div>
                    <span className="metric-label">DL</span>
                    <span className="metric-value">{c.throughput_dl} Mbps</span>
                  </div>
                  <div>
                    <span className="metric-label">Records</span>
                    <span className="metric-value">{c.record_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>RRC by Cluster</h3>
              <ClusterBarChart data={clusterData} dataKey="rrc" name="RRC %" />
            </div>
            <div className="chart-card">
              <h3>ERAB by Cluster</h3>
              <ClusterBarChart data={clusterData} dataKey="erab" name="ERAB %" />
            </div>
            <div className="chart-card">
              <h3>Drop Rate by Cluster</h3>
              <ClusterBarChart data={clusterData} dataKey="drop_rate" name="Drop %" />
            </div>
            <div className="chart-card">
              <h3>DL Throughput by Cluster</h3>
              <ClusterBarChart
                data={clusterData}
                dataKey="throughput_dl"
                name="DL Mbps"
              />
            </div>
          </div>

          <div className="table-section">
            <h3>Cluster Summary Table</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cluster</th>
                    <th>RRC %</th>
                    <th>ERAB %</th>
                    <th>Drop %</th>
                    <th>DL Mbps</th>
                    <th>UL Mbps</th>
                    <th>Records</th>
                  </tr>
                </thead>
                <tbody>
                  {clusterData.map((c) => (
                    <tr key={c.cluster}>
                      <td><span className="cluster-badge">{c.cluster}</span></td>
                      <td>{c.rrc}</td>
                      <td>{c.erab}</td>
                      <td>{c.drop_rate}</td>
                      <td>{c.throughput_dl}</td>
                      <td>{c.throughput_ul}</td>
                      <td>{c.record_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {error && <div className="alert alert-error">{error}</div>}
    </div>
  );
}
