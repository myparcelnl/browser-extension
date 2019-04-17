import config from '../helpers/config';
import log from '../helpers/log';

export default {

  /**
   * Retrieve saved field mappings from storage.
   *
   * @return {Promise<Object>}
   */
  async getSavedMappings() {
    const keys = await this.getStorageKeys(config.mappingPrefix);
    const mappings = {};

    Object.keys(keys).forEach((key) => {
      if (!key.startsWith(config.mappingPrefix)) {
        return;
      }

      const url = key.replace(config.mappingPrefix, '');
      mappings[url] = JSON.parse(keys[key]);
    });

    return mappings;
  },

  /**
   * Retrieve saved settings from storage.
   *
   * @return {Promise<Object>}
   */
  getSavedSettings() {
    return this.getStorageKeys(config.settingPrefix);
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
   * Get settings from storage and set defaults for any settings that are not present.
   *
   * @param {Object} request - Request object.
   */
  getSettings(request) {
    const keys = {};

    for (const setting of request) {
      keys[config.settingPrefix + setting] = request[setting];
    }

    this.saveToStorage(keys);
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
   * Save new/updated settings to storage.
   *
   * @param {Object} request - Request object.
   */
  saveSettings(request) {
    const keys = {};

    for (const setting of request) {
      keys[config.settingPrefix + setting] = request[setting];
    }

    this.saveToStorage(keys);
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
   * Get all keys from storage. Optionally filter by key prefix.
   *
   * @param {string} prefix - Prefix to filter by.
   * @return {Promise<Object>}
   */
  getStorageKeys(prefix = null) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (result) => {
        if (prefix) {
          result = this.filterKeys(result, prefix);
        }

        resolve(result);
      });
    });
  },

  /**
   * Filter object by key prefix.
   *
   * @param {Object} object - Object to filter.
   * @param {string} prefix - Prefix string to filter object keys with.
   */
  filterKeys(object, prefix) {
    const result = {};
    const filtered = Object.keys(object).filter((key) => key.startsWith(prefix));

    filtered.forEach((obj) => {
      result[obj] = object[obj];
    });

    return result;
  },
  /**
   * Save data to storage.
   *
   * @param {Object} data - Object with all data keys to store.
   * @param {Function} callback - Callback function.
   */
  saveToStorage(data, callback = undefined) {
    chrome.storage.sync.set(data, callback);
  },

  /**
   * Remove key from storage.
   *
   * @param {string} key - Key of storage item to remove.
   * @param {Function} callback - Callback function.
   */
  removeFromStorage(key, callback = undefined) {
    chrome.storage.sync.remove(key, callback);
  },

  /**
   * Clear all keys in storage.
   *
  * @param {Function} callback - Callback function.
   */
  clearAll(callback = undefined) {
    chrome.storage.sync.clear(callback);
  },
};
