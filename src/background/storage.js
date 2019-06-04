import Chrome from '../helpers/Chrome';
import Config from '../helpers/Config';
import Logger from '../helpers/Logger'; // strip-log

export default {

  /**
   * Retrieve saved field mappings from storage.
   *
   * @returns {Promise<Object>}
   */
  getSavedMappings() {
    return this.getStorageKeys(Config.mappingPrefix);
  },

  /**
   * Retrieve saved settings from storage.
   *
   * @returns {Promise<Object>}
   */
  getSavedSettings() {
    return this.getStorageKeys(Config.settingPrefix);
  },

  /**
   * Get field mappings for given URL. Returns empty object if entry doesn't exist.
   *
   * @param {string} url - URL to fetch mappings for.
   *
   * @returns {Object}
   */
  async getSavedMappingsForURL(url) {
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
    const mappings = await this.getSavedMappingsForURL(url);

    // Append mapped field to existing mappings
    if (field && path) {
      mappings[field] = path;
    }

    // For Mel
    Logger.success(`Nieuwe mapping voor ${url}:`, mappings);

    const key = {
      [`${Config.mappingPrefix}${url}`]: JSON.stringify(mappings),
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
    const {settings} = request;

    for (const setting in settings) {
      if (settings.hasOwnProperty(setting)) {
        keys[Config.settingPrefix + setting] = settings[setting];
      }
    }

    this.saveToStorage(keys);
  },

  /**
   * Delete given field from storage by URL and field.
   *
   * @param {{url: string, fields: Array}} data - Object containing URL and field(s) to remove.
   *
   * @returns {Promise}
   */
  async deleteMappedFields(data) {
    const {url, fields} = data;
    const mappings = await this.getSavedMappingsForURL(url);

    // Delete entire key if no values are given.
    if (!fields) {
      return this.removeFromStorage(`${Config.mappingPrefix}${url}`);
    }

    fields.forEach((field) => {
      delete mappings[field];
    });

    const newMappings = {
      [`${Config.mappingPrefix}${url}`]: JSON.stringify(mappings),
    };

    this.saveToStorage(newMappings);
  },

  /**
   * Get all keys from storage. Optionally filter by key prefix.
   *
   * @param {string} prefix - Prefix to filter by.
   * @returns {Promise<Object>}
   */
  getStorageKeys(prefix = undefined) {
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
      const replacedObj = obj.replace(prefix, '');
      result[replacedObj] = JSON.parse(object[obj]);
    });

    return result;
  },

  /**
   * Save key/value pairs to storage.
   *
   * @param {Object} data - Object with all data keys to store.
   * @param {Function} callback - Callback function.
   */
  saveToStorage(data, callback = Chrome.catchError) {
    chrome.storage.sync.set(data, callback);
  },

  /**
   * Remove key from storage.
   *
   * @param {string} key - Key of storage item to remove.
   * @param {Function} callback - Callback function.
   */
  removeFromStorage(key, callback = Chrome.catchError) {
    chrome.storage.sync.remove(key, callback);
  },
};
