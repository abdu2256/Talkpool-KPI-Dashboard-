import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Layout/Topbar';
import { kpiApi } from '../services/api';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const accepted = '.csv,.xlsx,.xls';

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.toLowerCase().split('.').pop();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('Please select a CSV or XLSX file.');
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await kpiApi.uploadFile(formData);
      setResult(res.data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      <Topbar
        title="Upload KPI Data"
        subtitle="Import CSV or XLSX telecom performance files"
      />

      <div className="upload-grid">
        <div
          className={`upload-dropzone ${dragOver ? 'upload-dropzone--active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accepted}
            onChange={(e) => handleFile(e.target.files[0])}
            hidden
          />
          <div className="upload-icon">📁</div>
          <p className="upload-title">
            {file ? file.name : 'Drag & drop or click to select file'}
          </p>
          <p className="upload-hint">Supported: CSV, XLSX (max 10 MB)</p>
        </div>

        <div className="upload-panel">
          <h3>Required Columns</h3>
          <ul className="column-list">
            <li>Date</li>
            <li>Hour (0-23)</li>
            <li>Cluster</li>
            <li>RRC Setup Success Rate</li>
            <li>ERAB Setup Success Rate</li>
            <li>Drop Rate</li>
            <li>Per User Throughput DL</li>
            <li>Per User Throughput UL</li>
          </ul>

          <div className="upload-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload & Parse'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              View Dashboard
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {result && (
            <div className="alert alert-success">
              <strong>Upload successful!</strong>
              <p>
                Parsed: {result.data?.parsed} rows | Inserted/Updated:{' '}
                {result.data?.inserted}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="info-card">
        <h3>Sample CSV Format</h3>
        <pre className="code-block">{`Date,Hour,Cluster,RRC Setup Success Rate,ERAB Setup Success Rate,Drop Rate,Per User Throughput DL,Per User Throughput UL
2025-05-01,0,Cluster-A,98.5,97.2,0.8,45.2,12.3`}</pre>
        <p>
          Use the sample file at <code>sample-data/sample_kpi_data.csv</code> in the project root.
        </p>
      </div>
    </div>
  );
}
