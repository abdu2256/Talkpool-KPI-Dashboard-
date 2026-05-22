/**
 * Data directories — desktop mode stores everything permanently on disk
 */
const path = require('path');
const fs = require('fs');

function getDataRoot() {
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }
  return path.join(__dirname, '../../..');
}

function getUploadsDir() {
  const dir = path.join(getDataRoot(), 'data', 'uploads');
  fs.mkdirSync(path.join(dir, 'archive'), { recursive: true });
  return dir;
}

function getArchiveDir() {
  const dir = path.join(getUploadsDir(), 'archive');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getSqlitePath() {
  const dir = path.join(getDataRoot(), 'data');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'talkpool.db');
}

function isDesktopMode() {
  return process.env.DESKTOP_MODE === '1' || process.env.DB_TYPE === 'sqlite';
}

module.exports = {
  getDataRoot,
  getUploadsDir,
  getArchiveDir,
  getSqlitePath,
  isDesktopMode,
};
