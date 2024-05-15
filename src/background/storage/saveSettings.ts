import {type StorageObject} from '../../types/index.js';
import {URL_SETTING_PREFIX} from '../../constants.js';
import {saveToStorage} from './saveToStorage.js';

/**
 * Save new/updated settings to storage.
 */
export const saveSettings = (settings: StorageObject, prefix: string = URL_SETTING_PREFIX) => {
  const keys = Object.keys(settings).reduce((acc, setting) => {
    return {
      ...acc,
      [prefix + setting]: settings[setting],
    };
  }, {});

  saveToStorage(keys);
};
