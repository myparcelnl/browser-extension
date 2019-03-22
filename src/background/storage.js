import config from '../helpers/config';
import log from '../helpers/log';

export default {

  /**
   * Get all keys from storage
   * @returns {Promise<any>}
   */
  getStorageKeys() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (result) => {
        resolve(result);
      });
    });
  },

  /**
   * Retrieve saved field mappings from storage.
   * @returns {Promise<any>}
   */
  getSavedMappings() {
    return new Promise((resolve) => {
      this.getStorageKeys().then((keys) => {
        const mappings = {};

        Object.keys(keys).forEach((key) => {
          if (!key.startsWith(config.mappingPrefix)) {
            return;
          }

          const url = key.replace(config.mappingPrefix, '');
          mappings[url] = JSON.parse(keys[key]);
        });

        return resolve(mappings);
      });
    });
  },

  /**
   * Find existing entry for given URL or create new settings object from URL
   * @param url
   * @returns object
   */
  async getSavedMappingsForURL(url) {
    const fieldMappings = await this.getSavedMappings();
    return fieldMappings[url];
  },

  /**
   * Save given data to local storage. Expects data to contain url, field and path keys.
   * @param data
   * @returns {Promise<void>}
   */
  async savePreset(data) {
    const {url, field, path, preset} = data;
    log.event(`savePreset ${preset || field}`);
    const mappings = await this.getSavedMappingsForURL(url) || {};

    const newMappings = {
      ...mappings,
      preset,
    };

    if (field && path) {
      newMappings[field] = path;
    }

    console.log(JSON.stringify(newMappings));
    const key = {
      [`${config.mappingPrefix}${url}`]: JSON.stringify(newMappings),
    };

    this.saveToStorage(key);
  },

  /**
   * Delete given field from storage by URL and field
   * @param data
   * @returns {Promise<void>}
   */
  async deleteMappedField(data) {
    const {url, field} = data;
    const mappings = await this.getSavedMappingsForURL(url);
    delete mappings[field];

    const newMappings = {
      [`${config.mappingPrefix}${url}`]: JSON.stringify(mappings),
    };

    this.saveToStorage(newMappings);
  },

  /**
   * Save data to storage
   * @param data
   */
  saveToStorage(data) {
    chrome.storage.sync.set(data);
  },

  /**
   * Remove key from storage
   * @param data
   */
  removeFromStorage(key) {
    chrome.storage.sync.remove(key);
  },

  /**
   * Clear all keys in storage
   */
  clearAll() {
    chrome.storage.sync.clear();
  },
};
