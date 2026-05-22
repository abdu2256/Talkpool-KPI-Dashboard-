/**
 * SQLite database — permanent local storage for desktop app (no PostgreSQL needed)
 */
const Database = require('better-sqlite3');
const { getSqlitePath } = require('./paths');
const { adaptSql } = require('./sqlHelper');

let db;

function getDb() {
  if (!db) {
    db = new Database(getSqlitePath());
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function query(sql, params = []) {
  const adapted = adaptSql(sql);
  const database = getDb();
  const trimmed = adapted.trim().toUpperCase();

  if (/^(BEGIN|COMMIT|ROLLBACK)/.test(trimmed)) {
    database.exec(adapted.replace(/;?\s*$/, ''));
    return Promise.resolve({ rows: [], rowCount: 0 });
  }

  if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
    const rows = database.prepare(adapted).all(...params);
    return Promise.resolve({ rows, rowCount: rows.length });
  }

  const info = database.prepare(adapted).run(...params);
  return Promise.resolve({
    rows: [],
    rowCount: info.changes,
    lastInsertRowid: info.lastInsertRowid,
  });
}

const pool = {
  query,
  connect: () =>
    Promise.resolve({
      query,
      release: () => {},
    }),
};

async function initDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS kpi_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_date TEXT NOT NULL,
      record_hour INTEGER NOT NULL CHECK (record_hour >= 0 AND record_hour <= 23),
      cluster TEXT NOT NULL,
      rrc_setup_success_rate REAL,
      erab_setup_success_rate REAL,
      drop_rate REAL,
      per_user_throughput_dl REAL,
      per_user_throughput_ul REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (record_date, record_hour, cluster)
    );

    CREATE INDEX IF NOT EXISTS idx_kpi_date ON kpi_records (record_date);
    CREATE INDEX IF NOT EXISTS idx_kpi_cluster ON kpi_records (cluster);
    CREATE INDEX IF NOT EXISTS idx_kpi_hour ON kpi_records (record_hour);

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS uploaded_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_name TEXT NOT NULL,
      stored_path TEXT NOT NULL,
      rows_imported INTEGER DEFAULT 0,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const defaults = [
    ['company_name', 'Talkpool'],
    ['default_cluster', 'All'],
    ['chart_theme', 'blue'],
    ['date_format', 'YYYY-MM-DD'],
  ];

  const insert = database.prepare(`
    INSERT OR IGNORE INTO app_settings (setting_key, setting_value) VALUES (?, ?)
  `);
  for (const [k, v] of defaults) {
    insert.run(k, v);
  }

  console.log('SQLite database ready:', getSqlitePath());
}

module.exports = { pool, initDatabase, query, getDb };
