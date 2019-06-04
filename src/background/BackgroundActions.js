import ActionNames from '../helpers/ActionNames';
import Connection from './Connection';
import Logger from '../helpers/Logger'; // strip-log
import defaultSettings from '../settings/defaultSettings';
import storage from './storage';

/**
 * Actions to run from the background script.
 */
export default class BackgroundActions {

  /**
   * Get the content for given preset selectors and any selectors in storage. Requires `url` to be present in `request`.
   * Will search stored mappings for `request.url` and send any found selectors to the content script to get the content
   * of each selector.
   *
   * Data is saved and retrieved by hostname.
   *
   * @example getContent({ url: 'url.com' });
   *
   * @param {Object} request - Request object. Must contain url, hostname and href.
   *
   * @returns {Promise}
   */
  static async getContent(request) {
    const {preset} = request;
    const url = new URL(request.url).hostname;
    const selectors = await storage.getSavedMappingsForURL(url);

    const data = {
      action: ActionNames.getContent,
      selectors: {...preset, ...selectors},
    };

    // Set selectors to undefined if there are no keys.
    if (!Object.keys(data.selectors).length) {
      data.selectors = undefined;
    }

    // Only send to content if either a preset or at least one selector is present.
    if (data.selectors) {
      Connection.sendToContent(data);
    } else {
      Logger.warning(`No preset or selectors present for "${url}".`);
    }
  }

  /**
   * Get settings (if any) and append them to the defaults. Send the settings to the popup and also return them to the
   * background script.
   *
   * @returns {Object} - Settings object.
   */
  static async getSettings() {
    const savedSettings = await storage.getSavedSettings();
    return {...defaultSettings, ...savedSettings};
  }

  /**
   * Save mapped field to local storage if not null and send it to popup.
   *
   * @param {Object} request - Request object.
   */
  static saveMappedField(request) {
    if (request.path) {
      storage.saveMappings(request);
    }

    Connection.sendToPopup(request);
  }

  /**
   * Save settings to local storage, tell the popup about it and return them.
   *
   * @param {Object} settings - Request object.
   *
   * @returns {Object} - New settings.
   */
  static saveSettings(settings) {
    const newSettings = {...this.getSettings(), ...settings};
    storage.saveSettings(newSettings);

    Connection.sendToPopup({action: ActionNames.savedSettings});
    return newSettings;
  }

  /**
   * Delete a given field from storage.
   *
   * @param {Object} request - Request object.
   */
  static deleteFields(request) {
    storage.deleteMappedFields(request);
  }
}
