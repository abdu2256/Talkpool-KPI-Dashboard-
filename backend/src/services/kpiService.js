/**
 * KPI data access layer - queries and aggregations
 */
const { pool } = require('../config/database');
const { buildFilterQuery, DIALECT } = require('../config/sqlHelper');

function limitOffsetSql(limit, offset, paramLen) {
  if (DIALECT === 'sqlite') {
    return ` LIMIT ? OFFSET ?`;
  }
  return ` LIMIT $${paramLen + 1} OFFSET $${paramLen + 2}`;
}

async function getRecords(filters = {}, limit = 500, offset = 0) {
  const { where, params } = buildFilterQuery(filters);
  const query = `
    SELECT id, record_date, record_hour, cluster,
           rrc_setup_success_rate, erab_setup_success_rate, drop_rate,
           per_user_throughput_dl, per_user_throughput_ul, created_at
    FROM kpi_records
    ${where}
    ORDER BY record_date DESC, record_hour ASC, cluster ASC
    ${limitOffsetSql(limit, offset, params.length)}
  `;
  const result = await pool.query(query, [...params, limit, offset]);
  return result.rows;
}

async function getRecordCount(filters = {}) {
  const { where, params } = buildFilterQuery(filters);
  const countExpr = DIALECT === 'sqlite' ? 'COUNT(*) AS total' : 'COUNT(*)::int AS total';
  const result = await pool.query(
    `SELECT ${countExpr} FROM kpi_records ${where}`,
    params
  );
  return result.rows[0].total;
}

async function getSummary(filters = {}) {
  const { where, params } = buildFilterQuery(filters);
  const result = await pool.query(
    `SELECT
       COUNT(*) AS record_count,
       ROUND(AVG(rrc_setup_success_rate), 2) AS avg_rrc,
       ROUND(AVG(erab_setup_success_rate), 2) AS avg_erab,
       ROUND(AVG(drop_rate), 2) AS avg_drop,
       ROUND(AVG(per_user_throughput_dl), 2) AS avg_dl,
       ROUND(AVG(per_user_throughput_ul), 2) AS avg_ul
     FROM kpi_records ${where}`,
    params
  );
  return result.rows[0];
}

async function getHourlyTrend(filters = {}) {
  const { where, params } = buildFilterQuery(filters);
  const result = await pool.query(
    `SELECT record_hour AS hour,
       ROUND(AVG(rrc_setup_success_rate), 2) AS rrc,
       ROUND(AVG(erab_setup_success_rate), 2) AS erab,
       ROUND(AVG(drop_rate), 2) AS drop_rate,
       ROUND(AVG(per_user_throughput_dl), 2) AS throughput_dl,
       ROUND(AVG(per_user_throughput_ul), 2) AS throughput_ul
     FROM kpi_records ${where}
     GROUP BY record_hour
     ORDER BY record_hour ASC`,
    params
  );
  return result.rows;
}

async function getClusterComparison(filters = {}) {
  const { where, params } = buildFilterQuery(filters);
  const countCol = DIALECT === 'sqlite' ? 'COUNT(*) AS record_count' : 'COUNT(*)::int AS record_count';
  const result = await pool.query(
    `SELECT cluster,
       ROUND(AVG(rrc_setup_success_rate), 2) AS rrc,
       ROUND(AVG(erab_setup_success_rate), 2) AS erab,
       ROUND(AVG(drop_rate), 2) AS drop_rate,
       ROUND(AVG(per_user_throughput_dl), 2) AS throughput_dl,
       ROUND(AVG(per_user_throughput_ul), 2) AS throughput_ul,
       ${countCol}
     FROM kpi_records ${where}
     GROUP BY cluster
     ORDER BY cluster ASC`,
    params
  );
  return result.rows;
}

async function getDailyTrend(filters = {}) {
  const { where, params } = buildFilterQuery(filters);
  const result = await pool.query(
    `SELECT record_date AS date,
       ROUND(AVG(rrc_setup_success_rate), 2) AS rrc,
       ROUND(AVG(erab_setup_success_rate), 2) AS erab,
       ROUND(AVG(drop_rate), 2) AS drop_rate,
       ROUND(AVG(per_user_throughput_dl), 2) AS throughput_dl
     FROM kpi_records ${where}
     GROUP BY record_date
     ORDER BY record_date ASC`,
    params
  );
  return result.rows;
}

async function getClusters() {
  const result = await pool.query(
    `SELECT DISTINCT cluster FROM kpi_records ORDER BY cluster ASC`
  );
  return result.rows.map((r) => r.cluster);
}

async function getDates() {
  const result = await pool.query(
    `SELECT DISTINCT record_date FROM kpi_records ORDER BY record_date DESC LIMIT 90`
  );
  return result.rows.map((r) => {
    const d = r.record_date;
    return d instanceof Date ? d.toISOString().split('T')[0] : String(d).split('T')[0];
  });
}

async function insertRecords(rows) {
  if (!rows.length) return { inserted: 0, skipped: 0 };

  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;

  const upsertSql =
    DIALECT === 'sqlite'
      ? `INSERT INTO kpi_records (
           record_date, record_hour, cluster,
           rrc_setup_success_rate, erab_setup_success_rate, drop_rate,
           per_user_throughput_dl, per_user_throughput_ul
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (record_date, record_hour, cluster)
         DO UPDATE SET
           rrc_setup_success_rate = excluded.rrc_setup_success_rate,
           erab_setup_success_rate = excluded.erab_setup_success_rate,
           drop_rate = excluded.drop_rate,
           per_user_throughput_dl = excluded.per_user_throughput_dl,
           per_user_throughput_ul = excluded.per_user_throughput_ul`
      : `INSERT INTO kpi_records (
           record_date, record_hour, cluster,
           rrc_setup_success_rate, erab_setup_success_rate, drop_rate,
           per_user_throughput_dl, per_user_throughput_ul
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (record_date, record_hour, cluster)
         DO UPDATE SET
           rrc_setup_success_rate = EXCLUDED.rrc_setup_success_rate,
           erab_setup_success_rate = EXCLUDED.erab_setup_success_rate,
           drop_rate = EXCLUDED.drop_rate,
           per_user_throughput_dl = EXCLUDED.per_user_throughput_dl,
           per_user_throughput_ul = EXCLUDED.per_user_throughput_ul
         RETURNING id`;

  try {
    await client.query('BEGIN');
    for (const row of rows) {
      try {
        const result = await client.query(upsertSql, [
          row.record_date,
          row.record_hour,
          row.cluster,
          row.rrc_setup_success_rate,
          row.erab_setup_success_rate,
          row.drop_rate,
          row.per_user_throughput_dl,
          row.per_user_throughput_ul,
        ]);
        if (result.rowCount > 0 || DIALECT === 'sqlite') inserted++;
      } catch {
        skipped++;
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return { inserted, skipped };
}

async function logUploadedFile(originalName, storedPath, rowsImported) {
  await pool.query(
    DIALECT === 'sqlite'
      ? `INSERT INTO uploaded_files (original_name, stored_path, rows_imported) VALUES (?, ?, ?)`
      : `INSERT INTO uploaded_files (original_name, stored_path, rows_imported) VALUES ($1, $2, $3)`,
    [originalName, storedPath, rowsImported]
  );
}

async function getUploadHistory(limit = 50) {
  const sql =
    DIALECT === 'sqlite'
      ? `SELECT * FROM uploaded_files ORDER BY uploaded_at DESC LIMIT ?`
      : `SELECT * FROM uploaded_files ORDER BY uploaded_at DESC LIMIT $1`;
  const result = await pool.query(sql, [limit]);
  return result.rows;
}

async function clearAllRecords() {
  const result = await pool.query('DELETE FROM kpi_records');
  return result.rowCount;
}

module.exports = {
  getRecords,
  getRecordCount,
  getSummary,
  getHourlyTrend,
  getClusterComparison,
  getDailyTrend,
  getClusters,
  getDates,
  insertRecords,
  logUploadedFile,
  getUploadHistory,
  clearAllRecords,
};
