/**
 * Application settings persistence
 */
const { pool } = require('../config/database');
const { DIALECT } = require('../config/sqlHelper');

async function getAllSettings() {
  const result = await pool.query(
    'SELECT setting_key, setting_value FROM app_settings ORDER BY setting_key'
  );
  const settings = {};
  for (const row of result.rows) {
    settings[row.setting_key] = row.setting_value;
  }
  return settings;
}

async function updateSettings(updates) {
  const client = await pool.connect();
  const upsert =
    DIALECT === 'sqlite'
      ? `INSERT INTO app_settings (setting_key, setting_value, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT (setting_key)
         DO UPDATE SET setting_value = excluded.setting_value, updated_at = datetime('now')`
      : `INSERT INTO app_settings (setting_key, setting_value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (setting_key)
         DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP`;

  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(updates)) {
      await client.query(upsert, [key, String(value)]);
    }
    await client.query('COMMIT');
    return getAllSettings();
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getAllSettings, updateSettings };
