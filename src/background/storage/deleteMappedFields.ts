import {type DeleteFieldsMessage} from '../../types/index.js';
import {saveToStorage} from './saveToStorage.js';
import {removeFromStorage} from './removeFromStorage.js';
import {getStorageMappingKey} from './getStorageMappingKey.js';
import {getSavedMappingsForUrl} from './getSavedMappingsForUrl.js';

/**
 * Delete given field from storage by URL and field.
 */
export const deleteMappedFields = async (data: DeleteFieldsMessage) => {
  const {url, fields} = data;
  const mappings = await getSavedMappingsForUrl(url);
  const storageKey = getStorageMappingKey(url);

  // Delete entire key if no values are given.
  if (!fields) {
    return removeFromStorage(storageKey);
  }

  fields.forEach((field) => {
    delete mappings[field];
  });

  const newMappings = {
    [storageKey]: JSON.stringify(mappings),
  };

  saveToStorage(newMappings);
};
