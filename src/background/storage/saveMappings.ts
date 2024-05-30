import {type MappedFieldMessage} from '../../types/index.js';
import Logger from '../../helpers/Logger.js';
import {MAPPING_PREFIX} from '../../constants.js';
import {saveToStorage} from './saveToStorage.js';
import {getSavedMappingsForUrl} from './getSavedMappingsForUrl.js';

/**
 * Save given data to local storage.
 */
export const saveMappings = async (data: MappedFieldMessage): Promise<void> => {
  const {field, path} = data;

  // Data is saved and retrieved by hostname, not full href
  const url = new URL(data.url).hostname;
  const mappings = await getSavedMappingsForUrl(url);

  // Append mapped field to existing mappings
  if (field && path) {
    mappings[field] = path;
  }

  Logger.success(`New mapping for ${url}:`, mappings);

  const key = {
    [`${MAPPING_PREFIX}${url}`]: JSON.stringify(mappings),
  };

  saveToStorage(key);
};
