/**
 * Preload — secure bridge (minimal for this app)
 */
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('talkpoolDesktop', {
  isDesktopApp: true,
  version: '1.0.0',
});
