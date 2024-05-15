import {type StoredExtensionSettings} from '../../types';
import {URL_SETTING_PREFIX} from '../../constants';
import {getStorageKeys} from './getStorageKeys';

/**
 * Retrieve saved settings from storage.
 */
export const getSavedSettingsForUrl = (url: string): Promise<StoredExtensionSettings> =>
  getStorageKeys<StoredExtensionSettings>(`${URL_SETTING_PREFIX + url}-`);
