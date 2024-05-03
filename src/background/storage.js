import Logger from '../helpers/Logger';
import Config from '../helpers/Config';
import Chrome from '../helpers/Chrome';

export default {
  /**
   * Retrieve saved field mappings from storage and convert them from to objects.
   *
   * @returns {Promise<Object>}
   */
  async getSavedMappings() {
    const storageKeys = await this.getStorageKeys(Config.mappingPrefix);

    Object.keys(storageKeys).forEach((key) => {
      storageKeys[key] = JSON.parse(storageKeys[key]);
    });

    return storageKeys;
  },

  /**
   * Retrieve saved settings from storage.
   *
   * @returns {Promise<Object>}
   */
  getSavedGlobalSettings() {
    return this.getStorageKeys(Config.globalSettingPrefix);
  },

  /**
   * Retrieve saved settings from storage.
   *
   * @returns {Promise<Object>}
   * @param {String} url - Url to get related settings of.
   */
  getSavedSettingsForUrl(url) {
    return this.getStorageKeys(`${Config.urlSettingPrefix + url}-`);
  },

  /**
   * Get field mappings for given URL. Returns empty object if entry doesn't exist.
   *
   * @param {String} url - URL to fetch mappings for.
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

    Logger.success(`Nieuwe mapping voor ${url}:`, mappings);

    const key = {
      [`${Config.mappingPrefix}${url}`]: JSON.stringify(mappings),
    };

    this.saveToStorage(key);
  },

  /**
   * Save new/updated settings to storage.
   *
   * @param {Object} settings - Settings object.
   * @param {String} prefix - Prefix to add to the setting name(s).
   */
  saveSettings(settings, prefix = Config.urlSettingPrefix) {
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
   *
   * @param {{url: String, fields: Array}} data - Object containing URL and field(s) to remove.
   *
   * @returns {Promise}
   */
  async deleteMappedFields(data) {
    const {url, fields} = data;
    const mappings = await this.getSavedMappingsForURL(url);
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
   *
   * @param {String} prefix - Prefix to filter by.
   * @returns {Promise<Object>}
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
   * @param {String} prefix - Prefix string to filter object keys with.
   * @returns {Object}
   */
  filterKeys(object, prefix) {
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
   * @param {String} key - Key of storage item to remove.
   * @param {Function} callback - Callback function.
   */
  removeFromStorage(key, callback = Chrome.catchError) {
    chrome.storage.sync.remove(key, callback);
  },

  /**
   * @param {String} url
   *
   * @returns {String}
   */
  getStorageMappingKey(url) {
    return `${Config.mappingPrefix}${url}`;
  },
};
