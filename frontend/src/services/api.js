/**
 * Axios API client for Talkpool KPI backend
 */
import axios from 'axios';

// Desktop app runs API on same port (5000); dev uses Vite proxy
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '5000'
    ? '/api'
    : import.meta.env.DEV
      ? '/api'
      : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const kpiApi = {
  getRecords: (params) => api.get('/kpi/records', { params }),
  getSummary: (params) => api.get('/kpi/summary', { params }),
  getHourlyTrend: (params) => api.get('/kpi/trend/hourly', { params }),
  getDailyTrend: (params) => api.get('/kpi/trend/daily', { params }),
  getClusterComparison: (params) => api.get('/kpi/clusters', { params }),
  getMeta: () => api.get('/kpi/meta'),
  uploadFile: (formData) =>
    api.post('/kpi/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  exportCSV: (params) =>
    api.get('/kpi/export', { params, responseType: 'blob' }),
  clearData: () => api.delete('/kpi/clear'),
  health: () => api.get('/health'),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api;
