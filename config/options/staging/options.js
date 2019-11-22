const spinner = document.getElementById('spinner');
const alert = document.getElementById('alert');

/**
 * Saves options to chrome.storage.
 */
function saveOptions() {
  const backofficeUrl = document.getElementById('url').value;
  spinner.style.display = 'block';

  chrome.storage.sync.set({backofficeUrl}, () => {
    /**
     * Pretend to not be done instantly.
     */
    setTimeout(() => {
      spinner.style.display = 'none';
      alert.style.display = 'flex';
    }, 300);
  });
}

/**
 * Restores form state using the preferences stored in chrome.storage.
 */
function restoreOptions() {
  chrome.storage.sync.get({
    backofficeUrl: null,
  }, (items) => {
    document.getElementById('url').value = items.backofficeUrl;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
