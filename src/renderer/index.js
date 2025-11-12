const elements = {
  steamPathInput: document.getElementById('steam-path'),
  chooseSteam: document.getElementById('choose-steam'),
  scanButton: document.getElementById('scan-button'),
  restartSteam: document.getElementById('restart-steam'),
  statusBanner: document.getElementById('status-banner'),
  resultsContainer: document.getElementById('results-container'),
  resultsCount: document.getElementById('results-count'),
  summaryFiles: document.getElementById('summary-files'),
  summarySize: document.getElementById('summary-size'),
  summaryFolder: document.getElementById('summary-folder'),
  appVersion: document.getElementById('app-version'),
  template: document.getElementById('unlocker-template'),
  openDiscord: document.getElementById('open-discord')
};

const state = {
  steamExePath: '',
  pluginFolder: '',
  unlockers: []
};

const STATUS_CLASSES = {
  info: 'status-info',
  success: 'status-success',
  warning: 'status-warning',
  error: 'status-error'
};

function setStatus(message, type = 'info') {
  elements.statusBanner.textContent = message;
  elements.statusBanner.className = `status-banner ${STATUS_CLASSES[type] || STATUS_CLASSES.info}`;
  elements.statusBanner.classList.remove('hidden');
}

function clearStatus() {
  elements.statusBanner.classList.add('hidden');
  elements.statusBanner.textContent = '';
}

function toggleLoading(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  button.dataset.loading = isLoading ? 'true' : 'false';
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function updateSummary(summary = { totalFiles: 0, totalSize: '0 B' }) {
  elements.summaryFiles.textContent = summary.totalFiles;
  elements.summarySize.textContent = summary.totalSize;
  elements.summaryFolder.textContent = state.pluginFolder || '—';
  elements.resultsCount.textContent = `${summary.totalFiles} ${summary.totalFiles === 1 ? 'file' : 'files'}`;
}

function renderUnlockers(unlockers) {
  const container = elements.resultsContainer;
  container.innerHTML = '';

  if (!unlockers.length) {
    container.classList.add('empty');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <h3>Your Steam configuration looks clean!</h3>
        <p>No unlocker scripts were found in the stplug-in folder.</p>
      </div>
    `;
    return;
  }

  container.classList.remove('empty');

  unlockers
    .slice()
    .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))
    .forEach((unlocker) => {
      const node = elements.template.content.firstElementChild.cloneNode(true);
      const title = node.querySelector('.title');
      const subtitle = node.querySelector('.subtitle');
      const appId = node.querySelector('.app-id');
      const fileSize = node.querySelector('.file-size');
      const modified = node.querySelector('.modified');
      const cover = node.querySelector('.cover');
      const deleteButton = node.querySelector('[data-delete]');
      const openStoreButton = node.querySelector('[data-open-store]');

      const metadata = unlocker.metadata || {};
      const gameTitle = metadata.name || 'Unknown Steam title';
      title.textContent = gameTitle;
      appId.textContent = unlocker.appId ? `AppID #${unlocker.appId}` : 'No AppID detected';
      fileSize.textContent = unlocker.sizeLabel;
      modified.textContent = `Edited ${formatDate(new Date(unlocker.modifiedAt))}`;

      if (metadata.headerImage) {
        cover.style.backgroundImage = `url('${metadata.headerImage}')`;
        cover.dataset.placeholder = metadata.name?.charAt(0) || '?';
      } else {
        cover.classList.add('placeholder');
        cover.dataset.placeholder = (gameTitle || '?').charAt(0);
      }

      deleteButton.addEventListener('click', async () => {
        if (!confirm(`Delete ${unlocker.fileName}?`)) return;
        try {
          toggleLoading(deleteButton, true);
          await window.steamUnlocker.deleteUnlocker(unlocker.filePath);
          setStatus(`${unlocker.fileName} removed successfully.`, 'success');
          await performScan();
        } catch (error) {
          console.error(error);
          setStatus(error.message || 'Unable to delete the selected file.', 'error');
        } finally {
          toggleLoading(deleteButton, false);
        }
      });

      openStoreButton.addEventListener('click', () => {
        if (unlocker.appId) {
          window.steamUnlocker.openExternal(`https://store.steampowered.com/app/${unlocker.appId}`);
        }
      });

      container.appendChild(node);
    });
}

async function loadPreferences() {
  try {
    const prefs = await window.steamUnlocker.getPreferences();
    if (prefs.steamExePath) {
      state.steamExePath = prefs.steamExePath;
      elements.steamPathInput.value = prefs.steamExePath;
    }
  } catch (error) {
    console.error(error);
  }
}

async function chooseSteamExecutable() {
  try {
    toggleLoading(elements.chooseSteam, true);
    const selected = await window.steamUnlocker.selectSteamExe();
    if (selected) {
      state.steamExePath = selected;
      elements.steamPathInput.value = selected;
      clearStatus();
      setStatus('Steam executable selected successfully.', 'success');
      await performScan();
    }
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Unable to use the selected file.', 'error');
  } finally {
    toggleLoading(elements.chooseSteam, false);
  }
}

async function performScan() {
  if (!state.steamExePath) {
    setStatus('Please choose your steam.exe before scanning.', 'info');
    return;
  }

  try {
    toggleLoading(elements.scanButton, true);
    setStatus('Scanning stplug-in folder…', 'info');
    const result = await window.steamUnlocker.scanUnlockers(state.steamExePath);
    state.unlockers = result.unlockers;
    state.pluginFolder = result.pluginDir;
    renderUnlockers(state.unlockers);
    updateSummary(result.summary);
    if (state.unlockers.length) {
      setStatus(`Detected ${state.unlockers.length} unlocker script(s).`, 'warning');
    } else {
      setStatus('No unlocker scripts were detected. Great job!', 'success');
    }
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Scan failed. Make sure your Steam path is correct.', 'error');
  } finally {
    toggleLoading(elements.scanButton, false);
  }
}

async function restartSteam() {
  if (!state.steamExePath) {
    setStatus('Select your Steam executable before trying to restart.', 'info');
    return;
  }
  try {
    toggleLoading(elements.restartSteam, true);
    await window.steamUnlocker.restartSteam();
    setStatus('Steam restart command sent successfully.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Unable to restart Steam.', 'error');
  } finally {
    toggleLoading(elements.restartSteam, false);
  }
}

function initialize() {
  elements.chooseSteam.addEventListener('click', chooseSteamExecutable);
  elements.scanButton.addEventListener('click', performScan);
  elements.restartSteam.addEventListener('click', restartSteam);
  elements.openDiscord.addEventListener('click', () => {
    window.steamUnlocker.openExternal('https://discord.gg/steamunlocker');
  });

  const version = window.appInfo?.version;
  if (version) {
    elements.appVersion.textContent = `Electron v${version}`;
  }

  loadPreferences();
}

initialize();
