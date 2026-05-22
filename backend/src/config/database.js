/**
 * Database selector: PostgreSQL (server) or SQLite (desktop app)
 */
const useSqlite =
  process.env.DB_TYPE === 'sqlite' || process.env.DESKTOP_MODE === '1';

module.exports = useSqlite
  ? require('./sqliteDb')
  : require('./db');
