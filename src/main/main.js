import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import {
  scanSteamUnlockers,
  deleteUnlockerFile,
  restartSteamClient,
  ensureSteamPathIntegrity
} from '../shared/steam.js';

// === Recréation de __dirname ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Préférences ===
const preferences = new Store({
  name: 'preferences',
  defaults: { steamExePath: '' }
});

// === Création de la fenêtre principale ===
async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#05060d',
    title: 'SteamUnlocker Remover',
    autoHideMenuBar: true, // ⛔ cache la barre de menu native
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false // ⛔ bloque l’ouverture des DevTools
    }
  });

  // ✅ Bloque TOUS les raccourcis clavier (F5, Ctrl+R, etc.)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Empêche tous les raccourcis de débogage / rechargement
    if (
      (input.control || input.meta) &&
      ['R', 'Shift', 'I', 'J'].includes(input.key.toUpperCase())
    ) {
      event.preventDefault();
    }

    // Bloque aussi F5, F11, F12, etc.
    if (['F5', 'F11', 'F12'].includes(input.code)) {
      event.preventDefault();
    }
  });

  // 🔒 Empêche ouverture des DevTools via context menu
  mainWindow.webContents.on('context-menu', (event) => {
    event.preventDefault();
  });

  await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

// === Gestion du cycle de vie ===
app.whenReady().then(() => {
  createWindow();

  // Sur macOS, réouvre la fenêtre si elle a été fermée
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// === IPC handlers ===
ipcMain.handle('preferences:get', async () => ({
  steamExePath: preferences.get('steamExePath', '')
}));

ipcMain.handle('preferences:set', async (event, updates) => {
  if (typeof updates !== 'object' || !updates)
    return { steamExePath: preferences.get('steamExePath', '') };

  if (updates.steamExePath) {
    const validated = ensureSteamPathIntegrity(updates.steamExePath);
    if (!validated.valid) throw new Error(validated.message);
    preferences.set('steamExePath', validated.steamExePath);
  }

  return { steamExePath: preferences.get('steamExePath', '') };
});

ipcMain.handle('steam:selectExe', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select steam.exe',
    properties: ['openFile'],
    filters: [
      { name: 'Steam Executable', extensions: ['exe'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePaths.length) return null;

  const selectedPath = result.filePaths[0];
  const validation = ensureSteamPathIntegrity(selectedPath);
  if (!validation.valid) throw new Error(validation.message);

  preferences.set('steamExePath', validation.steamExePath);
  return validation.steamExePath;
});

ipcMain.handle('steam:scan', async (event, explicitSteamPath) => {
  const storedPath = preferences.get('steamExePath', '');
  const targetPath = explicitSteamPath || storedPath;
  if (!targetPath) throw new Error('Please select your steam.exe to start scanning.');

  const validation = ensureSteamPathIntegrity(targetPath);
  if (!validation.valid) throw new Error(validation.message);

  return scanSteamUnlockers(validation.steamExePath);
});

ipcMain.handle('steam:delete', async (event, unlockerPath) => {
  if (!unlockerPath) throw new Error('No file path provided for deletion.');
  await deleteUnlockerFile(unlockerPath);
  return true;
});

ipcMain.handle('steam:restart', async () => {
  const steamExePath = preferences.get('steamExePath', '');
  if (!steamExePath) throw new Error('Steam executable path is not configured.');
  await restartSteamClient(steamExePath);
  return true;
});

ipcMain.handle('shell:open', async (event, url) => {
  if (typeof url === 'string') await shell.openExternal(url);
});
