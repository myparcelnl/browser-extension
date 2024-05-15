import {type MappedFields} from '../../types/index.js';
import {MAPPING_PREFIX} from '../../constants.js';
import {getStorageKeys} from './getStorageKeys.js';

/**
 * Retrieve saved field mappings from storage and convert them from to objects.
 */
export const getSavedMappings = async (): Promise<MappedFields> => {
  const storageKeys = await getStorageKeys(MAPPING_PREFIX);

  return Object.keys(storageKeys).reduce((acc, key) => {
    return {
      ...acc,
      [key]: JSON.parse(storageKeys[key] as string),
    };
  }, {} as MappedFields);
};
