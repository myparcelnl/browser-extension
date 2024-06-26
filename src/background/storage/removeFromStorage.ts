import Chrome from '../../helpers/Chrome.js';

/**
 * Remove key from storage.
 */
export const removeFromStorage = (key: string): void => {
  chrome.storage.sync.remove(key, Chrome.catchError);
};
