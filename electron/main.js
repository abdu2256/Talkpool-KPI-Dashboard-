/**
 * Talkpool KPI Dashboard — Electron desktop app
 * Opens native window; data saved in AppData permanently
 */
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const PORT = process.env.PORT || '5000';
let mainWindow = null;
let backendProcess = null;

function getResourcesPath() {
  return app.isPackaged ? process.resourcesPath : path.join(__dirname, '..');
}

function getBackendPaths() {
  const root = getResourcesPath();
  return {
    script: path.join(root, 'backend', 'src', 'index.js'),
    cwd: path.join(root, 'backend'),
    frontendDist: path.join(root, 'frontend', 'dist'),
  };
}

function waitForBackend(port, maxAttempts = 80) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts += 1;
      const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) resolve();
        else if (attempts < maxAttempts) setTimeout(check, 400);
        else reject(new Error('Backend health check failed'));
      });
      req.on('error', () => {
        if (attempts < maxAttempts) setTimeout(check, 400);
        else reject(new Error('Backend did not start in time'));
      });
      req.setTimeout(2000, () => req.destroy());
    };
    setTimeout(check, 800);
  });
}

function startBackend() {
  const { script, cwd, frontendDist } = getBackendPaths();

  if (!fs.existsSync(script)) {
    return Promise.reject(new Error(`Backend not found: ${script}`));
  }

  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    DESKTOP_MODE: '1',
    DB_TYPE: 'sqlite',
    DATA_DIR: app.getPath('userData'),
    FRONTEND_DIST: frontendDist,
    PORT: String(PORT),
  };

  backendProcess = spawn(process.execPath, [script], {
    env,
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  backendProcess.stdout.on('data', (d) => console.log('[backend]', d.toString().trim()));
  backendProcess.stderr.on('data', (d) => console.error('[backend]', d.toString().trim()));

  backendProcess.on('error', (err) => {
    console.error('Failed to spawn backend:', err);
  });

  return waitForBackend(PORT);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Talkpool KPI Dashboard',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
    backendProcess = null;
  }
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      await startBackend();
      createWindow();
    } catch (err) {
      console.error(err);
      const { dialog } = require('electron');
      dialog.showErrorBox(
        'Talkpool KPI — Startup Error',
        `${err.message}\n\nTry reinstalling or contact IT support.`
      );
      app.quit();
    }
  });

  app.on('window-all-closed', () => {
    stopBackend();
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('before-quit', () => stopBackend());
}
