import { useState, useEffect } from 'react';
import Topbar from '../components/Layout/Topbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { settingsApi, kpiApi } from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState({
    company_name: 'Talkpool',
    default_cluster: 'All',
    chart_theme: 'blue',
    date_format: 'YYYY-MM-DD',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    Promise.all([
      settingsApi.get(),
      kpiApi.health().catch((e) => ({ data: { success: false, error: e.message } })),
    ])
      .then(([settingsRes, healthRes]) => {
        setSettings((prev) => ({ ...prev, ...settingsRes.data.data }));
        setHealth(healthRes.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await settingsApi.update(settings);
      setSettings(res.data.data);
      setMessage('Settings saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Delete ALL KPI records? This cannot be undone.')) return;
    setClearing(true);
    try {
      const res = await kpiApi.clearData();
      setMessage(res.data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setClearing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading settings..." />;

  return (
    <div className="page-container">
      <Topbar title="Settings" subtitle="Configure dashboard preferences" />

      <div className="settings-grid">
        <div className="settings-card">
          <h3>General Settings</h3>
          <div className="form-group">
            <label htmlFor="company_name">Company Name</label>
            <input
              id="company_name"
              type="text"
              value={settings.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="default_cluster">Default Cluster Filter</label>
            <input
              id="default_cluster"
              type="text"
              value={settings.default_cluster || 'All'}
              onChange={(e) => handleChange('default_cluster', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="chart_theme">Chart Theme</label>
            <select
              id="chart_theme"
              value={settings.chart_theme || 'blue'}
              onChange={(e) => handleChange('chart_theme', e.target.value)}
            >
              <option value="blue">Telecom Blue</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date_format">Date Format</label>
            <select
              id="date_format"
              value={settings.date_format || 'YYYY-MM-DD'}
              onChange={(e) => handleChange('date_format', e.target.value)}
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="settings-card">
          <h3>System Status</h3>
          <div className={`status-badge ${health?.success ? 'status-ok' : 'status-error'}`}>
            {health?.success ? '● API Connected' : '● API Disconnected'}
          </div>
          {health?.database && (
            <p className="status-detail">Database: {health.database}</p>
          )}
          {health?.timestamp && (
            <p className="status-detail">Last check: {new Date(health.timestamp).toLocaleString()}</p>
          )}
          {!health?.success && health?.error && (
            <p className="status-detail error-text">{health.error}</p>
          )}
        </div>

        <div className="settings-card settings-card--danger">
          <h3>Danger Zone</h3>
          <p>Permanently delete all KPI records from the database.</p>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleClearData}
            disabled={clearing}
          >
            {clearing ? 'Clearing...' : 'Clear All KPI Data'}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
    </div>
  );
}
