import {type DeleteFieldsMessage, type MappedFields, type StoredExtensionSettings, type StorageObject} from '../types';
import Logger from '../helpers/Logger';
import Chrome from '../helpers/Chrome';
import {GLOBAL_SETTING_PREFIX, MAPPING_PREFIX, URL_SETTING_PREFIX} from '../constants';

export default {
  /**
   * Retrieve saved field mappings from storage and convert them from to objects.
   */
  async getSavedMappings(): Promise<MappedFields> {
    const storageKeys = await this.getStorageKeys(MAPPING_PREFIX);

    return Object.keys(storageKeys).reduce((acc, key) => {
      return {
        ...acc,
        [key]: JSON.parse(storageKeys[key] as string),
      };
    }, {} as MappedFields);
  },

  /**
   * Retrieve saved settings from storage.
   */
  getSavedGlobalSettings(): Promise<Partial<StoredExtensionSettings>> {
    return this.getStorageKeys<StoredExtensionSettings>(GLOBAL_SETTING_PREFIX);
  },

  /**
   * Retrieve saved settings from storage.
   */
  getSavedSettingsForUrl(url: string): Promise<StoredExtensionSettings> {
    return this.getStorageKeys<StoredExtensionSettings>(`${URL_SETTING_PREFIX + url}-`);
  },

  /**
   * Get field mappings for given URL. Returns empty object if entry doesn't exist.
   */
  async getSavedMappingsForUrl(url: string) {
    const fieldMappings = await this.getSavedMappings();

    if (fieldMappings.hasOwnProperty(url)) {
      return fieldMappings[url];
    }

    return {};
  },

  /**
   * Save given data to local storage.
   *
   * @param {Object} data - Object which must always contain `url` and either `field` and `path` or `preset`.
   *
   * @returns {Promise}
   */
  async saveMappings(data) {
    const {field, path} = data;

    // Data is saved and retrieved by hostname, not full href
    const url = new URL(data.url).hostname;
    const mappings = await this.getSavedMappingsForUrl(url);

    // Append mapped field to existing mappings
    if (field && path) {
      mappings[field] = path;
    }

    Logger.success(`New mapping for ${url}:`, mappings);

    const key = {
      [`${MAPPING_PREFIX}${url}`]: JSON.stringify(mappings),
    };

    this.saveToStorage(key);
  },

  /**
   * Save new/updated settings to storage.
   */
  saveSettings(settings: StorageObject, prefix: string = URL_SETTING_PREFIX) {
    const keys = Object.keys(settings).reduce((acc, setting) => {
      return {
        ...acc,
        [prefix + setting]: settings[setting],
      };
    }, {});

    this.saveToStorage(keys);
  },

  /**
   * Delete given field from storage by URL and field.
   */
  async deleteMappedFields(data: DeleteFieldsMessage) {
    const {url, fields} = data;
    const mappings = await this.getSavedMappingsForUrl(url);
    const storageKey = this.getStorageMappingKey(url);

    // Delete entire key if no values are given.
    if (!fields) {
      return this.removeFromStorage(storageKey);
    }

    fields.forEach((field) => {
      delete mappings[field];
    });

    const newMappings = {
      [storageKey]: JSON.stringify(mappings),
    };

    this.saveToStorage(newMappings);
  },

  /**
   * Get all keys from storage. Optionally filter by key prefix.
   */
  getStorageKeys<T extends StorageObject>(prefix?: string): Promise<T> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (result) => {
        if (prefix) {
          result = this.filterKeys(result, prefix);
        }

        resolve(result as T);
      });
    });
  },

  /**
   * Filter object by key prefix.
   */
  filterKeys(object: StorageObject, prefix: string): StorageObject {
    const result = {};
    const filtered = Object.keys(object).filter((key) => key.startsWith(prefix));

    filtered.forEach((obj) => {
      const replacedObj = obj.replace(prefix, '');
      result[replacedObj] = object[obj];
    });

    return result;
  },

  /**
   * Save key/value pairs to storage.
   */
  saveToStorage(data: StorageObject) {
    chrome.storage.sync.set(data, Chrome.catchError);
  },

  /**
   * Remove key from storage.
   */
  removeFromStorage(key: string) {
    chrome.storage.sync.remove(key, Chrome.catchError);
  },

  getStorageMappingKey(url: string): string {
    return `${MAPPING_PREFIX}${url}`;
  },
};
