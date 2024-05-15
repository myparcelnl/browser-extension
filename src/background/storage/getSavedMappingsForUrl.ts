import {getSavedMappings} from './getSavedMappings';

/**
 * Get field mappings for given URL. Returns empty object if entry doesn't exist.
 */
export const getSavedMappingsForUrl = async (url: string) => {
  const fieldMappings = await getSavedMappings();

  console.log({fieldMappings});

  if (fieldMappings.hasOwnProperty(url)) {
    return fieldMappings[url];
  }

  return {};
};
