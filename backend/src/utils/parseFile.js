/**
 * Parse CSV and XLSX uploads into normalized KPI row objects
 */
const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');

// Column name aliases for flexible file headers
const COLUMN_MAP = {
  date: ['date', 'record_date', 'record date'],
  hour: ['hour', 'record_hour', 'record hour', 'hr'],
  cluster: ['cluster', 'cluster_name', 'cluster name', 'site'],
  rrc: ['rrc setup success rate', 'rrc_setup_success_rate', 'rrc success rate', 'rrc'],
  erab: ['erab setup success rate', 'erab_setup_success_rate', 'erab success rate', 'erab'],
  drop: ['drop rate', 'drop_rate', 'drops'],
  dl: ['per user throughput dl', 'per_user_throughput_dl', 'throughput dl', 'dl throughput'],
  ul: ['per user throughput ul', 'per_user_throughput_ul', 'throughput ul', 'ul throughput'],
};

function normalizeKey(key) {
  return String(key || '')
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, ' ');
}

function findColumn(row, aliases) {
  const keys = Object.keys(row);
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (aliases.some((a) => normalized === a || normalized.includes(a))) {
      return row[key];
    }
  }
  return null;
}

function parseRow(raw) {
  const dateVal = findColumn(raw, COLUMN_MAP.date);
  const hourVal = findColumn(raw, COLUMN_MAP.hour);
  const clusterVal = findColumn(raw, COLUMN_MAP.cluster);

  if (!dateVal || clusterVal === null || clusterVal === undefined || clusterVal === '') {
    return null;
  }

  let recordDate = dateVal;
  if (typeof dateVal === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    recordDate = new Date(excelEpoch.getTime() + dateVal * 86400000)
      .toISOString()
      .split('T')[0];
  } else {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      recordDate = d.toISOString().split('T')[0];
    } else {
      recordDate = String(dateVal).trim().split('T')[0];
    }
  }

  const hour = parseInt(hourVal, 10);
  if (isNaN(hour) || hour < 0 || hour > 23) {
    return null;
  }

  const toNum = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = parseFloat(String(v).replace('%', '').trim());
    return isNaN(n) ? null : n;
  };

  return {
    record_date: recordDate,
    record_hour: hour,
    cluster: String(clusterVal).trim(),
    rrc_setup_success_rate: toNum(findColumn(raw, COLUMN_MAP.rrc)),
    erab_setup_success_rate: toNum(findColumn(raw, COLUMN_MAP.erab)),
    drop_rate: toNum(findColumn(raw, COLUMN_MAP.drop)),
    per_user_throughput_dl: toNum(findColumn(raw, COLUMN_MAP.dl)),
    per_user_throughput_ul: toNum(findColumn(raw, COLUMN_MAP.ul)),
  };
}

/**
 * Parse CSV file from disk path
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const parsed = parseRow(data);
        if (parsed) rows.push(parsed);
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

/**
 * Parse XLSX file from disk path
 */
function parseXLSX(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const rows = [];
  for (const row of json) {
    const parsed = parseRow(row);
    if (parsed) rows.push(parsed);
  }
  return Promise.resolve(rows);
}

/**
 * Route to correct parser by file extension
 */
async function parseUploadedFile(filePath, originalName) {
  const ext = (originalName || filePath).toLowerCase().split('.').pop();
  if (ext === 'csv') {
    return parseCSV(filePath);
  }
  if (ext === 'xlsx' || ext === 'xls') {
    return parseXLSX(filePath);
  }
  throw new Error(`Unsupported file type: .${ext}. Use CSV or XLSX.`);
}

module.exports = { parseUploadedFile, parseRow };
