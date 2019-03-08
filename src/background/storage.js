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
    const urlMappings = {};

    const filteredKeys = Object.keys(this.fieldMappings).filter((key) => {
      return key.startsWith(config.mappingPrefix) && key.endsWith(url);
    });

    const regex = RegExp(`${config.mappingPrefix}(.+)_${url}`);

    filteredKeys.forEach((key) => {
      urlMappings[key] = {
        field: regex.exec(key)[1],
        path: this.fieldMappings[key],
      };
    });

    return urlMappings;
  },

  /**
   * Empty MyParcelFieldMappings in local storage
   */
  clearSavedMappings() {
    chrome.storage.sync.remove();
  },

  /**
   * Save given data to local storage. Expects data to contain url, field and path keys.
   * @param data
   * @returns {Promise<void>}
   */
  saveMappedField(data) {
    const {url, field, path} = data;
    // let settings = await this.getSavedMappingsForURL(url);
    const newData = {};

    newData[`${config.mappingPrefix + field}_${url}`] = path;

    this.saveToStorage(newData);
  },

  async deleteMappedField(data) {
    const {url, field} = data;
    let remove;

    await this.getSavedMappingsForURL(url)
      .then((mappings) => {
        for (const item in mappings) {
          if (mappings[item].field === field) {
            remove = item;
          }
        }
      });

    if (remove) {
      this.removeFromStorage(remove);
    }
  },

  /**
   * Executes Chrome function to actually save to synced local storage
   * @param data
   */
  saveToStorage(data) {
    chrome.storage.sync.set(data);
  },

  /**
   * Executes Chrome function to remove key from synced local storage
   * @param data
   */
  removeFromStorage(data) {
    chrome.storage.sync.remove(data);
  },
};
