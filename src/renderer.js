const appIdsInput = document.getElementById('appIds');
const steamPathInput = document.getElementById('steamPath');
const browseButton = document.getElementById('browse');
const removeButton = document.getElementById('remove');
const restartButton = document.getElementById('restart');
const logStream = document.getElementById('logStream');
const statusLabel = document.getElementById('statusLabel');

const setStatus = (text, accentClass = '') => {
  statusLabel.textContent = text;
  statusLabel.className = accentClass;
};

const appendLog = ({ message, level = 'info', timestamp }) => {
  const entry = document.createElement('div');
  entry.classList.add('log-entry');
  entry.dataset.level = level;

  const time = document.createElement('time');
  time.textContent = new Date(timestamp).toLocaleString();
  entry.appendChild(time);

  const text = document.createElement('span');
  text.textContent = message;
  entry.appendChild(text);

  logStream.appendChild(entry);
  logStream.scrollTo({ top: logStream.scrollHeight, behavior: 'smooth' });
};

const handleError = error => {
  appendLog({ message: error.message || String(error), level: 'error', timestamp: new Date().toISOString() });
  setStatus('Erreur', 'error');
};

browseButton.addEventListener('click', async () => {
  try {
    const path = await window.steamRemover.selectSteamPath();
    if (path) {
      steamPathInput.value = path;
      appendLog({
        message: `Chemin Steam défini sur ${path}.`,
        timestamp: new Date().toISOString(),
        level: 'info'
      });
      setStatus('Chemin mis à jour', 'success');
    }
  } catch (error) {
    handleError(error);
  }
});

removeButton.addEventListener('click', async () => {
  setStatus('Suppression...', 'pending');
  try {
    await window.steamRemover.removeAppIds({
      steamPath: steamPathInput.value.trim(),
      rawAppIds: appIdsInput.value
    });
    setStatus('Terminé', 'success');
  } catch (error) {
    handleError(error);
  }
});

restartButton.addEventListener('click', async () => {
  setStatus('Relance de Steam...', 'pending');
  try {
    await window.steamRemover.restartSteam(steamPathInput.value.trim());
    setStatus('Steam relancé', 'success');
  } catch (error) {
    handleError(error);
  }
});

window.steamRemover.onLogMessage(appendLog);
