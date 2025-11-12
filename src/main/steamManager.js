const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { exec, spawn } = require('child_process');
const { platform } = require('os');

const timestamp = () => new Date().toISOString();

const logFactory = send => (message, level = 'info') => {
  send({ message, level, timestamp: timestamp() });
};

const parseAppIds = raw => {
  if (!raw) {
    return [];
  }
  return raw
    .split(/[\s,;]+/)
    .map(entry => entry.trim())
    .filter(Boolean);
};

const ensureSteamPath = async steamPath => {
  if (!steamPath) {
    throw new Error('Steam path is empty.');
  }

  try {
    const stats = await fsp.stat(steamPath);
    if (!stats.isDirectory()) {
      throw new Error('Steam path is not a directory.');
    }
  } catch (error) {
    throw new Error(`Steam path invalid: ${error.message}`);
  }
};

const killSteamProcess = logger =>
  new Promise(resolve => {
    const system = platform();
    const commands = {
      win32: 'taskkill /IM steam.exe /F',
      linux: 'pkill -f steam',
      darwin: 'pkill -f steam'
    };

    const command = commands[system];

    if (!command) {
      logger(`Unsupported platform: ${system}`, 'error');
      return resolve();
    }

    logger('Attempting to terminate Steam process...');
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger(`Unable to terminate Steam: ${stderr || error.message}`, 'warn');
      } else {
        const output = stdout.toString().trim();
        if (output) {
          logger(output.replace(/\s+/g, ' '));
        }
        logger('Steam process terminated successfully.');
      }
      resolve();
    });
  });

const collectTargets = steamPath => [
  path.join(steamPath, 'config'),
  path.join(steamPath, 'depotcache'),
  path.join(steamPath, 'appcache')
];

const deleteAppArtifacts = async (root, appId, logger, steamRoot) => {
  try {
    const dirents = await fsp.readdir(root, { withFileTypes: true });
    await Promise.all(
      dirents.map(async dirent => {
        const fullPath = path.join(root, dirent.name);
        if (dirent.isDirectory()) {
          await deleteAppArtifacts(fullPath, appId, logger, steamRoot);
        } else if (dirent.isFile() && dirent.name.toLowerCase().includes(appId.toLowerCase())) {
          try {
            await fsp.unlink(fullPath);
            const relativePath = path.relative(steamRoot, fullPath);
            logger(`Deleted ${relativePath} for AppID ${appId}.`);
          } catch (error) {
            logger(`Failed to delete ${fullPath}: ${error.message}`, 'error');
          }
        }
      })
    );
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    logger(`Scan failed in ${root}: ${error.message}`, 'warn');
  }
};

const removeAppIds = async ({ steamPath, rawAppIds }, send) => {
  const log = logFactory(send);
  const appIds = parseAppIds(rawAppIds);

  if (!appIds.length) {
    throw new Error('Please provide at least one AppID.');
  }

  await ensureSteamPath(steamPath);

  log(`Preparing to remove traces for ${appIds.length} AppID(s).`);

  await killSteamProcess(log);

  const targets = collectTargets(steamPath);

  for (const appId of appIds) {
    log(`Cleaning data for AppID ${appId}...`);
    await Promise.all(targets.map(target => deleteAppArtifacts(target, appId, log, steamPath)));
  }

  log(`Completed cleanup for ${appIds.length} AppID(s).`);
  return { success: true };
};

const restartSteam = async (steamPath, send) => {
  const log = logFactory(send);

  await ensureSteamPath(steamPath);
  let steamExecutable = 'steam.exe';
  if (process.platform === 'darwin') {
    steamExecutable = path.join('Steam.app', 'Contents', 'MacOS', 'steam_osx');
  } else if (process.platform === 'linux') {
    steamExecutable = 'steam';
  }

  steamExecutable = path.join(steamPath, steamExecutable);

  try {
    await fsp.access(steamExecutable, fs.constants.F_OK);
  } catch (error) {
    throw new Error('steam executable not found in the provided directory.');
  }

  log('Launching Steam...');

  return new Promise((resolve, reject) => {
    const child = spawn(steamExecutable, [], {
      cwd: path.dirname(steamExecutable),
      detached: true,
      stdio: 'ignore',
      shell: false
    });

    child.once('error', error => {
      log(`Failed to restart Steam: ${error.message}`, 'error');
      reject(new Error('Unable to restart Steam.'));
    });

    child.once('spawn', () => {
      child.unref();
      log('Steam restart requested.');
      resolve({ success: true });
    });
  });
};

module.exports = {
  removeAppIds,
  restartSteam
};
