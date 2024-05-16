import {type StorageObject} from '../../types/index.js';
import Chrome from '../../helpers/Chrome.js';

/**
 * Save key/value pairs to storage.
 */
export const saveToStorage = (data: StorageObject): void => {
  chrome.storage.sync.set(data, Chrome.catchError);
};
