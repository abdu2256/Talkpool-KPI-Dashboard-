import { useState, useEffect, useCallback } from 'react';
import { kpiApi } from '../services/api';

/**
 * Shared hook for fetching KPI dashboard data with filters
 */
export function useKpiData(filters) {
  const [summary, setSummary] = useState(null);
  const [hourlyTrend, setHourlyTrend] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [clusterData, setClusterData] = useState([]);
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ clusters: [], dates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterParams = {
    date: filters.date || undefined,
    cluster: filters.cluster && filters.cluster !== 'All' ? filters.cluster : undefined,
    hour: filters.hour !== '' && filters.hour !== null && filters.hour !== undefined
      ? filters.hour
      : undefined,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, hourlyRes, dailyRes, clusterRes, recordsRes, metaRes] =
        await Promise.all([
          kpiApi.getSummary(filterParams),
          kpiApi.getHourlyTrend(filterParams),
          kpiApi.getDailyTrend(filterParams),
          kpiApi.getClusterComparison(filterParams),
          kpiApi.getRecords({ ...filterParams, limit: 100 }),
          kpiApi.getMeta(),
        ]);

      setSummary(summaryRes.data.data);
      setHourlyTrend(hourlyRes.data.data || []);
      setDailyTrend(dailyRes.data.data || []);
      setClusterData(clusterRes.data.data || []);
      setRecords(recordsRes.data.data || []);
      setMeta(metaRes.data.data || { clusters: [], dates: [] });
    } catch (err) {
      setError(err.message);
      setSummary(null);
      setHourlyTrend([]);
      setDailyTrend([]);
      setClusterData([]);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [filters.date, filters.cluster, filters.hour]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    summary,
    hourlyTrend,
    dailyTrend,
    clusterData,
    records,
    meta,
    loading,
    error,
    refetch: fetchData,
  };
}

export default useKpiData;
