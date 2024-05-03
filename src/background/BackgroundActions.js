import defaultSettings from '../settings/defaultSettings';
import Logger from '../helpers/Logger';
import Config from '../helpers/Config';
import ActionNames from '../helpers/ActionNames';
import storage from './storage';
import Connection from './Connection';

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
    if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
      console.log('fixing url');
      request.url = `https://${request.url}`;
    }

    const resolvedRequest = {
      url: new URL(request.url).hostname,
      ...request,
    };
    console.log({resolvedRequest});

    const {url, preset} = resolvedRequest;

    const [savedSelectors, newPresetName] = await Promise.all([
      storage.getSavedMappingsForURL(url),
      this.handlePresetName(resolvedRequest),
    ]);

    const data = {
      action: ActionNames.getContent,
      selectors: {...preset, ...savedSelectors},
      presetName: newPresetName,
    };

    // Set selectors to null if there are no keys.
    {
      if (!Object.keys(data.selectors).length) {
        data.selectors = null;
      }
    }

    // Only send to content if either a preset or at least one selector is present.
    if (data.selectors) {
      Connection.sendToContent(data);
    } else {
      Logger.warning(`No preset or selectors present for "${url}".`);
    }
  }

  /**
   * Get settings (if any) and append them to the defaults.
   *
   * @returns {Object} - Settings object.
   */
  static async getGlobalSettings() {
    return {
      ...defaultSettings,
      ...(await storage.getSavedGlobalSettings()),
    };
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
  static saveGlobalSettings(settings) {
    const newSettings = {
      ...this.getGlobalSettings(),
      ...settings,
    };

    storage.saveSettings(newSettings, Config.globalSettingPrefix);
    Connection.sendToPopup({action: ActionNames.savedSettings});
    return newSettings;
  }

  /**
   * Delete a given field from storage.
   *
   * @param {Object} request - Request object.
   *
   * @returns {Promise}
   */
  static deleteFields(request) {
    return storage.deleteMappedFields(request);
  }

  /**
   * @param {Object} request
   *
   * @returns {String|undefined}
   */
  static async handlePresetName(request) {
    const {url, presetName, presetChosenManually, resetPresetSettings} = request;
    const presetNameSettingKey = `${url}-chosenPreset`;

    if (resetPresetSettings) {
      storage.removeFromStorage(presetNameSettingKey);
    }

    if (presetChosenManually) {
      storage.saveSettings({
        [presetNameSettingKey]: presetName,
      });
    } else {
      const settingsKeys = await storage.getStorageKeys(Config.globalSettingPrefix);

      if (settingsKeys.hasOwnProperty(presetNameSettingKey)) {
        return settingsKeys[presetNameSettingKey];
      }
    }

    return presetName;
  }
}
