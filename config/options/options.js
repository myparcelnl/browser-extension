const spinner = document.getElementById('spinner');
const alert = document.getElementById('alert');

/**
 * Saves options to chrome.storage.
 *
 * @param {Event} e - Form submit event.
 */
function saveOptions(e) {
  e.preventDefault();

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
 * Initialize the options screen.
 */
function initialize() {
  const manifest = chrome.runtime.getManifest();
  const span = document.querySelector('#patterns');

  span.textContent = manifest.externally_connectable.matches.join('\n');

  // Restores form state using the preferences stored in chrome.storage.
  chrome.storage.sync.get({
    backofficeUrl: null,
  }, (items) => {
    document.getElementById('url').value = items.backofficeUrl;
  });
}

document.addEventListener('DOMContentLoaded', initialize);
document.querySelector('form').addEventListener('submit', saveOptions);
