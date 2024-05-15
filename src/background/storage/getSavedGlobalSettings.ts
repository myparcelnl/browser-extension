import {type StoredExtensionSettings} from '../../types';
import {GLOBAL_SETTING_PREFIX} from '../../constants';
import {getStorageKeys} from './getStorageKeys';

/**
 * Retrieve saved settings from storage.
 */
export const getSavedGlobalSettings = (): Promise<Partial<StoredExtensionSettings>> => {
  return getStorageKeys<StoredExtensionSettings>(GLOBAL_SETTING_PREFIX);
};
