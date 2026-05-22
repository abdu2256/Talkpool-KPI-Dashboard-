/**
 * KPI REST API controllers
 */
const fs = require('fs');
const path = require('path');
const kpiService = require('../services/kpiService');
const { parseUploadedFile } = require('../utils/parseFile');
const { getArchiveDir } = require('../config/paths');

function extractFilters(query) {
  return {
    date: query.date || null,
    dateFrom: query.dateFrom || null,
    dateTo: query.dateTo || null,
    cluster: query.cluster || null,
    hour: query.hour !== undefined && query.hour !== '' ? query.hour : null,
  };
}

async function getRecords(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const limit = Math.min(parseInt(req.query.limit, 10) || 500, 1000);
    const offset = parseInt(req.query.offset, 10) || 0;
    const [records, total] = await Promise.all([
      kpiService.getRecords(filters, limit, offset),
      kpiService.getRecordCount(filters),
    ]);
    res.json({ success: true, data: records, total, limit, offset });
  } catch (err) {
    next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const summary = await kpiService.getSummary(filters);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

async function getHourlyTrend(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const data = await kpiService.getHourlyTrend(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getClusterComparison(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const data = await kpiService.getClusterComparison(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getDailyTrend(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const data = await kpiService.getDailyTrend(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getMeta(req, res, next) {
  try {
    const [clusters, dates] = await Promise.all([
      kpiService.getClusters(),
      kpiService.getDates(),
    ]);
    res.json({ success: true, data: { clusters, dates } });
  } catch (err) {
    next(err);
  }
}

async function getUploads(req, res, next) {
  try {
    const history = await kpiService.getUploadHistory();
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

async function uploadFile(req, res, next) {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a CSV or XLSX file.',
      });
    }

    filePath = req.file.path;
    const rows = await parseUploadedFile(filePath, req.file.originalname);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid KPI rows found in file. Check column headers and data format.',
      });
    }

    const result = await kpiService.insertRecords(rows);

    // Permanently archive uploaded file (never delete)
    const archiveDir = getArchiveDir();
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const archivePath = path.join(archiveDir, `${Date.now()}-${safeName}`);
    fs.renameSync(filePath, archivePath);
    filePath = null;

    await kpiService.logUploadedFile(req.file.originalname, archivePath, result.inserted);

    res.json({
      success: true,
      message: `Successfully processed ${rows.length} rows. File saved permanently.`,
      data: {
        parsed: rows.length,
        inserted: result.inserted,
        skipped: result.skipped,
        archived: path.basename(archivePath),
      },
    });
  } catch (err) {
    next(err);
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        const archiveDir = getArchiveDir();
        const archivePath = path.join(
          archiveDir,
          `${Date.now()}-${req.file?.originalname || 'upload.csv'}`
        );
        fs.renameSync(filePath, archivePath);
        await kpiService.logUploadedFile(
          req.file?.originalname || 'upload',
          archivePath,
          0
        );
      } catch {
        /* keep temp file if archive fails */
      }
    }
  }
}

async function exportCSV(req, res, next) {
  try {
    const filters = extractFilters(req.query);
    const records = await kpiService.getRecords(filters, 10000, 0);

    const headers = [
      'Date',
      'Hour',
      'Cluster',
      'RRC Setup Success Rate',
      'ERAB Setup Success Rate',
      'Drop Rate',
      'Per User Throughput DL',
      'Per User Throughput UL',
    ];

    const lines = [headers.join(',')];
    for (const r of records) {
      const date =
        r.record_date instanceof Date
          ? r.record_date.toISOString().split('T')[0]
          : String(r.record_date).split('T')[0];
      lines.push(
        [
          date,
          r.record_hour,
          r.cluster,
          r.rrc_setup_success_rate ?? '',
          r.erab_setup_success_rate ?? '',
          r.drop_rate ?? '',
          r.per_user_throughput_dl ?? '',
          r.per_user_throughput_ul ?? '',
        ].join(',')
      );
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="talkpool-kpi-export-${Date.now()}.csv"`
    );
    res.send(lines.join('\n'));
  } catch (err) {
    next(err);
  }
}

async function clearData(req, res, next) {
  try {
    const deleted = await kpiService.clearAllRecords();
    res.json({
      success: true,
      message: `Deleted ${deleted} records`,
      data: { deleted },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRecords,
  getSummary,
  getHourlyTrend,
  getClusterComparison,
  getDailyTrend,
  getMeta,
  getUploads,
  uploadFile,
  exportCSV,
  clearData,
};
