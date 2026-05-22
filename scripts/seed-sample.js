/**
 * Seed database from sample CSV (run from project root)
 * Usage: node scripts/seed-sample.js
 */
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const { pool, initDatabase } = require('../backend/src/config/db');
const { parseUploadedFile } = require('../backend/src/utils/parseFile');
const { insertRecords } = require('../backend/src/services/kpiService');

const samplePath = path.join(__dirname, '../sample-data/sample_kpi_data.csv');

async function seed() {
  if (!fs.existsSync(samplePath)) {
    console.error('Sample file not found:', samplePath);
    process.exit(1);
  }

  await initDatabase();
  const rows = await parseUploadedFile(samplePath, 'sample_kpi_data.csv');
  const result = await insertRecords(rows);
  console.log(`Seeded ${result.inserted} records from sample CSV`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
