/**
 * Express server — used by CLI and Electron desktop app
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { pool, initDatabase } = require('./config/database');
const { isDesktopMode, getDataRoot } = require('./config/paths');
const kpiRoutes = require('./routes/kpiRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

function getDistPath() {
  if (process.env.FRONTEND_DIST) {
    return process.env.FRONTEND_DIST;
  }
  return path.join(__dirname, '../../frontend/dist');
}

function createApp() {
  const desktop = isDesktopMode();
  const distPath = getDistPath();

  app.use(
    cors({
      origin: desktop
        ? [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`]
        : process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({
        success: true,
        message: 'Talkpool KPI API is running',
        mode: desktop ? 'desktop' : 'server',
        database: desktop ? 'sqlite' : 'postgresql',
        dataPath: desktop ? getDataRoot() : undefined,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(503).json({
        success: false,
        message: 'API running but database unavailable',
        error: err.message,
      });
    }
  });

  app.use('/api/kpi', kpiRoutes);
  app.use('/api/settings', settingsRoutes);

  if (desktop && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  } else if (desktop) {
    console.warn('Frontend build not found at:', distPath);
  }

  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    if (desktop && fs.existsSync(distPath)) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  app.use(errorHandler);

  return { desktop, distPath };
}

/**
 * Start HTTP server (returns when listening)
 */
async function startServer() {
  createApp();
  await initDatabase();

  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      const desktop = isDesktopMode();
      console.log(`Talkpool KPI running on http://localhost:${PORT}`);
      if (desktop) {
        console.log(`Data folder: ${path.join(getDataRoot(), 'data')}`);
      }
      resolve({ port: PORT, server });
    });
    server.on('error', reject);
  });
}

module.exports = { app, startServer, PORT };
