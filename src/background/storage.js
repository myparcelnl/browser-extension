import log from '../helpers/log';
import config from '../helpers/config';

export default {
  /**
   * Retrieve saved MyParcelFieldMappings from (synced) local storage. Returns empty array if not found.
   * @returns {Promise<any>}
   */
  getSavedMappings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (result) => {
        return resolve(result);
      });
    });
  },

  /**
   * Find existing entry for given URL or create new settings object from URL
   * @param url
   * @returns object
   */
  async getSavedMappingsForURL(url) {
    this.fieldMappings = await this.getSavedMappings();
    console.log(this.fieldMappings);

    const urlMappings = {};
    const filteredKeys = Object.keys(this.fieldMappings).filter((key) => {
      return key.startsWith(config.mappingPrefix) && key.endsWith(url);
    });

    filteredKeys.forEach((key) => {
      urlMappings[key] = this.fieldMappings[key];
    });

    return urlMappings;
  },

  /**
   * Empty MyParcelFieldMappings in local storage
   */
  clearSavedMappings() {
    chrome.storage.sync.set({});
  },

  /**
   * Save given data to local storage. Expects data to contain url, field and path keys.
   * @param data
   * @returns {Promise<void>}
   */
  async saveMappedField(data) {
    const {url, field, path} = data;
    // let settings = await this.getSavedMappingsForURL(url);
    const newData = {};

    newData[config.mappingPrefix + field + '_' + url] = path;

    this.saveToStorage(newData);
  },

  /**
   * Executes Chrome function to actually save to synced local storage
   * @param data
   */
  saveToStorage(data) {
    chrome.storage.sync.set(data, async() => {
      log.success('Saved data to local storage.');
    });
  },
};
