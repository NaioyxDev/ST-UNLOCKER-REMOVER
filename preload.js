const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('steamRemover', {
  selectSteamPath: () => ipcRenderer.invoke('dialog:selectSteamPath'),
  removeAppIds: payload => ipcRenderer.invoke('operation:removeAppIds', payload),
  restartSteam: steamPath => ipcRenderer.invoke('operation:restartSteam', steamPath),
  onLogMessage: callback => ipcRenderer.on('log:append', (_event, message) => callback(message))
});
