import config from '../helpers/config';
import log from '../helpers/log';

export default {

  /**
   * Get all keys from storage.
   *
   * @return {Promise<string>}
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
   *
   * @return {Promise<Object>}
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
   * Find existing entry for given URL or create new settings object from URL.
   *
   * @param {string} url - URL to fetch mappings for.
   *
   * @return {Object}
   */
  async getSavedMappingsForURL(url) {
    const fieldMappings = await this.getSavedMappings();
    return fieldMappings[url];
  },

  /**
   * Save given data to local storage.
   *
   * @param {Object} data - Object which must always contain `url` and either `field` and `path` or `preset`.
   *
   * @return {Promise}
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

    const key = {
      [`${config.mappingPrefix}${url}`]: JSON.stringify(newMappings),
    };

    this.saveToStorage(key);
  },

  /**
   * Delete given field from storage by URL and field.
   *
   * @param {Object} data - Object containing URL and field of data to remove.
   *.
   * @return {Promise}
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
   * Save data to storage.
   *
   * @param {Object} data - Object with all data keys to store.
   */
  saveToStorage(data) {
    chrome.storage.sync.set(data);
  },

  /**
   * Remove key from storage.
   *
   * @param {string} key - Key of storage item to remove.
   */
  removeFromStorage(key) {
    chrome.storage.sync.remove(key);
  },

  /**
   * Clear all keys in storage.
   */
  clearAll() {
    chrome.storage.sync.clear();
  },
};
