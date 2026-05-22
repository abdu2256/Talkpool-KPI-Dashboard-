/**
 * KPI API routes
 */
const express = require('express');
const kpiController = require('../controllers/kpiController');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/records', kpiController.getRecords);
router.get('/summary', kpiController.getSummary);
router.get('/trend/hourly', kpiController.getHourlyTrend);
router.get('/trend/daily', kpiController.getDailyTrend);
router.get('/clusters', kpiController.getClusterComparison);
router.get('/meta', kpiController.getMeta);
router.get('/uploads', kpiController.getUploads);
router.post('/upload', upload.single('file'), kpiController.uploadFile);
router.get('/export', kpiController.exportCSV);
router.delete('/clear', kpiController.clearData);

module.exports = router;
