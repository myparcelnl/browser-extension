import {type DeleteFieldsMessage} from '../../types';
import {saveToStorage} from './saveToStorage';
import {removeFromStorage} from './removeFromStorage';
import {getStorageMappingKey} from './getStorageMappingKey';
import {getSavedMappingsForUrl} from './getSavedMappingsForUrl';

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
