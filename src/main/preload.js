const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('steamUnlocker', {
  getPreferences: () => ipcRenderer.invoke('preferences:get'),
  setPreferences: (updates) => ipcRenderer.invoke('preferences:set', updates),
  selectSteamExe: () => ipcRenderer.invoke('steam:selectExe'),
  scanUnlockers: (steamExePath) => ipcRenderer.invoke('steam:scan', steamExePath),
  deleteUnlocker: (unlockerPath) => ipcRenderer.invoke('steam:delete', unlockerPath),
  restartSteam: () => ipcRenderer.invoke('steam:restart'),
  openExternal: (url) => ipcRenderer.invoke('shell:open', url)
});

contextBridge.exposeInMainWorld('appInfo', {
  version: process.versions.electron
});
