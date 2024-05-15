import {type StorageObject} from '../../types';
import Chrome from '../../helpers/Chrome';

/**
 * Save key/value pairs to storage.
 */
export const saveToStorage = (data: StorageObject) => {
  chrome.storage.sync.set(data, Chrome.catchError);
};
