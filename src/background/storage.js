import log from '../helpers/log';

export default {
  /**
   * Retrieve saved MyParcelFieldMappings from (synced) local storage. Returns empty array if not found.
   * @returns {Promise<any>}
   */
  getSavedMappings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['MyParcelFieldMappings'], (result) => {
        return resolve(result.MyParcelFieldMappings || []);
      });
    });
  },

  /**
   * Find existing entry for given URL or create new settings object from URL
   * @param url
   * @returns object
   */
  getSavedMappingsForURL(url) {
    return this.MyParcelFieldMappings.find((entry) => entry.url === url) || {url, fields: {}};
  },

  /**
   * Empty MyParcelFieldMappings in local storage
   */
  clearSavedMappings() {
    chrome.storage.sync.set({MyParcelFieldMappings: []});
  },

  /**
   * Save given data to local storage. Expects data to contain url, field and path keys.
   * @param data
   * @returns {Promise<void>}
   */
  async saveMappedField(data) {
    if (!this.MyParcelFieldMappings) {
      this.MyParcelFieldMappings = await this.getSavedMappings();
    }

    const settings = await this.getSavedMappingsForURL(data.url);

    // Add mapped field to local settings object
    settings.fields[data.field] = data.path;

    // Add updated settings and save to storage
    this.saveToStorage({ MyParcelFieldMappings: Object.assign(this.MyParcelFieldMappings, settings) });
  },

  /**
   * Executes Chrome function to actually save to synced local storage
   * @param data
   */
  saveToStorage(data) {
    chrome.storage.sync.set(data, () => {
      log.success('Saved data to local storage.');
    });
  },
};
