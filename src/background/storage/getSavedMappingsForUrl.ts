import {getSavedMappings} from './getSavedMappings.js';

/**
 * Get field mappings for given URL. Returns empty object if entry doesn't exist.
 */
export const getSavedMappingsForUrl = async (url: string): Promise<Record<string, string>> => {
  const fieldMappings = await getSavedMappings();

  if (fieldMappings.hasOwnProperty(url)) {
    return fieldMappings[url];
  }

  return {};
};
