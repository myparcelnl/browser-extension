import {type StorageObject} from '../../types/index.js';
import {filterKeys} from './filterKeys.js';

/**
 * Get all keys from storage. Optionally filter by key prefix.
 */
export const getStorageKeys = <T extends StorageObject>(prefix?: string): Promise<T> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, (result) => {
      if (prefix) {
        result = filterKeys(result, prefix);
      }

      resolve(result as T);
    });
  });
};
