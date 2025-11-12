const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { removeAppIds, restartSteam } = require('./src/main/steamManager');

const sendErrorLog = (event, message) => {
  event.sender.send('log:append', {
    message,
    level: 'error',
    timestamp: new Date().toISOString()
  });
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    minWidth: 920,
    minHeight: 640,
    backgroundColor: '#05060A',
    title: 'SteamUnlocker Remover',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('dialog:selectSteamPath', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select your Steam folder',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('operation:removeAppIds', async (event, payload) => {
  try {
    return await removeAppIds(payload, message => {
      event.sender.send('log:append', message);
    });
  } catch (error) {
    sendErrorLog(event, error.message || 'Unexpected error');
    throw error;
  }
});

ipcMain.handle('operation:restartSteam', async (event, steamPath) => {
  try {
    return await restartSteam(steamPath, message => {
      event.sender.send('log:append', message);
    });
  } catch (error) {
    sendErrorLog(event, error.message || 'Unexpected error');
    throw error;
  }
});
