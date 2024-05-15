import {type MappedFields} from '../../types';
import {MAPPING_PREFIX} from '../../constants';
import {getStorageKeys} from './getStorageKeys';

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
