import {type StoredExtensionSettings} from '../../types/index.js';
import {GLOBAL_SETTING_PREFIX} from '../../constants.js';
import {getStorageKeys} from './getStorageKeys.js';

/**
 * Retrieve saved settings from storage.
 */
export const getSavedGlobalSettings = (): Promise<Partial<StoredExtensionSettings>> => {
  return getStorageKeys<StoredExtensionSettings>(GLOBAL_SETTING_PREFIX);
};
