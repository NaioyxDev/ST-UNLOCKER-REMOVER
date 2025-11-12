const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

function ensureSteamPathIntegrity(candidate) {
  if (!candidate) {
    return { valid: false, message: 'Steam executable path is missing.', steamExePath: '' };
  }

  const normalized = path.normalize(candidate);
  if (!fs.existsSync(normalized)) {
    return { valid: false, message: 'Steam executable not found at the provided path.', steamExePath: '' };
  }

  const fileName = path.basename(normalized).toLowerCase();
  const isWindows = process.platform === 'win32';
  const expected = isWindows ? 'steam.exe' : 'steam';

  if (fileName !== expected) {
    return { valid: false, message: `The selected file is not ${expected}.`, steamExePath: '' };
  }

  return { valid: true, message: '', steamExePath: normalized };
}

function getSteamRoot(steamExePath) {
  return path.dirname(steamExePath);
}

async function fetchSteamMetadata(appId) {
  if (!appId) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=en`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    const entry = payload?.[appId];
    if (!entry?.success || !entry.data) {
      return null;
    }
    return {
      name: entry.data.name,
      headerImage: entry.data.header_image,
      shortDescription: entry.data.short_description || '',
      genres: Array.isArray(entry.data.genres)
        ? entry.data.genres.map((genre) => genre.description)
        : []
    };
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
}

async function scanSteamUnlockers(steamExePath) {
  const steamRoot = getSteamRoot(steamExePath);
  const pluginDir = path.join(steamRoot, 'config', 'stplug-in');

  let entries;
  try {
    entries = await fsPromises.readdir(pluginDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        steamExePath,
        pluginDir,
        unlockers: [],
        summary: {
          totalFiles: 0,
          totalSize: '0 B'
        }
      };
    }
    throw error;
  }

  const luaFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.lua'));

  const unlockers = await Promise.all(
    luaFiles.map(async (entry) => {
      const filePath = path.join(pluginDir, entry.name);
      const stat = await fsPromises.stat(filePath);
      const appIdMatch = entry.name.match(/(\d{3,})/);
      const appId = appIdMatch ? appIdMatch[1] : null;
      const metadata = await fetchSteamMetadata(appId);

      return {
        id: `${appId || entry.name}-${stat.mtimeMs}`,
        appId,
        fileName: entry.name,
        filePath,
        size: stat.size,
        sizeLabel: formatFileSize(stat.size),
        modifiedAt: stat.mtime,
        metadata: metadata || null
      };
    })
  );

  const totalBytes = unlockers.reduce((acc, entry) => acc + entry.size, 0);

  return {
    steamExePath,
    pluginDir,
    unlockers,
    summary: {
      totalFiles: unlockers.length,
      totalSize: formatFileSize(totalBytes)
    }
  };
}

async function deleteUnlockerFile(unlockerPath) {
  const normalized = path.normalize(unlockerPath);
  try {
    await fsPromises.access(normalized, fs.constants.F_OK | fs.constants.W_OK);
  } catch (error) {
    throw new Error('Unable to access the selected file. It may already be deleted.');
  }
  await fsPromises.unlink(normalized);
}

async function restartSteamClient(steamExePath) {
  const normalized = path.normalize(steamExePath);

  await new Promise((resolve) => {
    try {
      const shutdown = spawn(normalized, ['-shutdown'], {
        detached: true,
        stdio: 'ignore'
      });
      shutdown.unref();
    } catch (error) {
      // Ignored: Steam may not be running.
    }
    setTimeout(resolve, 1500);
  });

  await new Promise((resolve, reject) => {
    try {
      const child = spawn(normalized, [], {
        detached: true,
        stdio: 'ignore'
      });
      child.on('error', reject);
      child.unref();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  ensureSteamPathIntegrity,
  scanSteamUnlockers,
  deleteUnlockerFile,
  restartSteamClient
};
