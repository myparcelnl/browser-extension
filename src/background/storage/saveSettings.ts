import {type StorageObject} from '../../types';
import {URL_SETTING_PREFIX} from '../../constants';
import {saveToStorage} from './saveToStorage';

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
