/**
 * SQL helpers for PostgreSQL and SQLite
 */
const DIALECT = process.env.DB_TYPE === 'sqlite' ? 'sqlite' : 'postgres';

function adaptSql(sql) {
  if (DIALECT !== 'sqlite') return sql;
  return sql
    .replace(/::numeric/g, '')
    .replace(/::int/g, '')
    .replace(/\$(\d+)/g, '?');
}

function buildFilterQuery(filters) {
  const conditions = [];
  const params = [];

  if (filters.date) {
    conditions.push(DIALECT === 'sqlite' ? 'record_date = ?' : `record_date = $${params.length + 1}`);
    params.push(filters.date);
  }
  if (filters.dateFrom) {
    conditions.push(DIALECT === 'sqlite' ? 'record_date >= ?' : `record_date >= $${params.length + 1}`);
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push(DIALECT === 'sqlite' ? 'record_date <= ?' : `record_date <= $${params.length + 1}`);
    params.push(filters.dateTo);
  }
  if (filters.cluster && filters.cluster !== 'All') {
    conditions.push(DIALECT === 'sqlite' ? 'cluster = ?' : `cluster = $${params.length + 1}`);
    params.push(filters.cluster);
  }
  if (filters.hour !== undefined && filters.hour !== '' && filters.hour !== null) {
    conditions.push(DIALECT === 'sqlite' ? 'record_hour = ?' : `record_hour = $${params.length + 1}`);
    params.push(parseInt(filters.hour, 10));
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

module.exports = {
  DIALECT,
  adaptSql,
  buildFilterQuery,
};
