/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-magic-numbers */

const spinnerElement = document.getElementById('spinner') as HTMLDivElement;
const alertElement = document.getElementById('alert') as HTMLDivElement;

const getUrlElement = (): HTMLInputElement => document.getElementById('url') as HTMLInputElement;

/**
 * Saves options to chrome.storage.
 */
function saveOptions(e: SubmitEvent) {
  e.preventDefault();

  const urlElement = getUrlElement();
  const backofficeUrl = urlElement.value;

  spinnerElement.style.display = 'block';

  chrome.storage.sync.set({backofficeUrl}, () => {
    /**
     * Pretend to not be done instantly.
     */
    setTimeout(() => {
      spinnerElement.style.display = 'none';
      alertElement.style.display = 'flex';
    }, 300);
  });
}

/**
 * Initialize the options screen.
 */
function initialize() {
  const manifest = chrome.runtime.getManifest();
  const patterns = document.querySelector('#patterns')!;

  patterns.textContent = manifest.externally_connectable?.matches?.join('\n') ?? '';

  // Restores form state using the preferences stored in chrome.storage.
  chrome.storage.sync.get(
    {
      backofficeUrl: null,
    },
    (items) => {
      const urlElement = getUrlElement();

      urlElement.value = items.backofficeUrl;
    },
  );
}

document.addEventListener('DOMContentLoaded', initialize);
document.querySelector('form')?.addEventListener('submit', saveOptions);
