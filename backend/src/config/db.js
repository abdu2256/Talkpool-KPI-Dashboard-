/**
 * PostgreSQL connection pool and schema initialization
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'talkpool_kpi',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

/**
 * Migrate old table column names (hour -> record_hour, date -> record_date)
 */
async function migrateLegacyColumns(client) {
  const { rows } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'kpi_records'
  `);
  const cols = new Set(rows.map((r) => r.column_name));

  if (cols.size === 0) return;

  if (cols.has('hour') && !cols.has('record_hour')) {
    await client.query('ALTER TABLE kpi_records RENAME COLUMN hour TO record_hour');
    console.log('Migrated: hour -> record_hour');
  }

  if (cols.has('date') && !cols.has('record_date')) {
    await client.query('ALTER TABLE kpi_records RENAME COLUMN date TO record_date');
    console.log('Migrated: date -> record_date');
  }

  if (!cols.has('record_hour') && !cols.has('hour')) {
    await client.query(`
      ALTER TABLE kpi_records ADD COLUMN IF NOT EXISTS record_hour INTEGER DEFAULT 0
    `);
    await client.query(`UPDATE kpi_records SET record_hour = 0 WHERE record_hour IS NULL`);
    console.log('Added missing column: record_hour');
  }

  if (!cols.has('record_date') && !cols.has('date')) {
    await client.query(`
      ALTER TABLE kpi_records ADD COLUMN IF NOT EXISTS record_date DATE
    `);
    console.log('Added missing column: record_date');
  }
}

/**
 * Auto-create tables and migrate legacy schema
 */
async function initDatabase() {
  const client = await pool.connect();
  try {
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'kpi_records'
      );
    `);

    if (tableExists.rows[0].exists) {
      await migrateLegacyColumns(client);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS kpi_records (
        id SERIAL PRIMARY KEY,
        record_date DATE NOT NULL,
        record_hour INTEGER NOT NULL CHECK (record_hour >= 0 AND record_hour <= 23),
        cluster VARCHAR(100) NOT NULL,
        rrc_setup_success_rate DECIMAL(10, 4),
        erab_setup_success_rate DECIMAL(10, 4),
        drop_rate DECIMAL(10, 4),
        per_user_throughput_dl DECIMAL(12, 4),
        per_user_throughput_ul DECIMAL(12, 4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (record_date, record_hour, cluster)
      );
    `);

    // Create indexes only when columns exist
    const { rows: colRows } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'kpi_records'
    `);
    const cols = new Set(colRows.map((r) => r.column_name));

    if (cols.has('record_date')) {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_kpi_date ON kpi_records (record_date)`);
    }
    if (cols.has('cluster')) {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_kpi_cluster ON kpi_records (cluster)`);
    }
    if (cols.has('record_hour')) {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_kpi_hour ON kpi_records (record_hour)`);
    }
    if (cols.has('record_date') && cols.has('cluster')) {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_kpi_date_cluster ON kpi_records (record_date, cluster)
      `);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id SERIAL PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        stored_path TEXT NOT NULL,
        rows_imported INTEGER DEFAULT 0,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      INSERT INTO app_settings (setting_key, setting_value)
      VALUES
        ('company_name', 'Talkpool'),
        ('default_cluster', 'All'),
        ('chart_theme', 'blue'),
        ('date_format', 'YYYY-MM-DD')
      ON CONFLICT (setting_key) DO NOTHING;
    `);

    console.log('PostgreSQL database initialized successfully');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDatabase };
