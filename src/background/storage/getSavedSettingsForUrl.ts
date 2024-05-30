import {type StoredExtensionSettings} from '../../types/index.js';
import {URL_SETTING_PREFIX} from '../../constants.js';
import {getStorageKeys} from './getStorageKeys.js';

/**
 * Retrieve saved settings from storage.
 */
export const getSavedSettingsForUrl = (url: string): Promise<StoredExtensionSettings> =>
  getStorageKeys<StoredExtensionSettings>(`${URL_SETTING_PREFIX + url}-`);
