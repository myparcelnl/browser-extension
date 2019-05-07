import {sendToContent, sendToPopup} from '../Background';
import ActionNames from '../helpers/ActionNames';
import Logger from '../helpers/Logger'; // strip-log
import Presets from '../helpers/Presets';
import defaultSettings from '../settings/defaultSettings';
import storage from './storage';

/**
 * Actions to run from the background script.
 */
export default class BackgroundActions {

  /**
   * Start the process to get content by data in request object. Requires url to be present in request. Will search
   * stored mappings for the request.url and send any found mappings(/selectors) to the content script to get the
   * content of each selector.
   *
   * Data is saved and retrieved by hostname but the full href is needed to try to detect a preset.
   *
   * @example getContent({ url: 'url.com' });
   *
   * @param {Object} request - Request object. Must contain url, hostname and href.
   *
   * @returns {Promise}
   */
  static async getContent(request) {
    const {url, href, preset} = request;
    let selectors = await storage.getSavedMappingsForURL(url);
    let presetData;

    // Use the preset from the request or if it's undefined try to map the url to one.
    const presetName = preset || Presets.findByURL(href);

    if (presetName) {
      // Add overridden values to the object to be able to differentiate them from preset values (and allow the user to
      // delete them)
      const overrides = selectors ? Object.keys(selectors) : null;
      presetData = {name: presetName, overrides};

      // Merge the preset selectors with existing selectors.
      selectors = {...await Presets.getFields(presetName), ...selectors};

      // Add the new preset to the saved data for this url.
      storage.saveMappings({url, preset: presetData});
    }

    const data = {
      action: ActionNames.getContent,
    };

    if (presetData) {
      data.preset = presetData;
    }

    if (selectors) {
      data.selectors = selectors;
    }

    // Only send to content if either a preset or at least one selector is present.
    if (data.preset || data.selectors) {
      sendToContent(data);
    } else {
      Logger.warning(`No preset or selectors present for "${url}".`);
    }
  }

  /**
   * Get settings and set defaults if there are none available. Send the settings to the popup and also return them to
   * the background script.
   *
   * @returns {Object} - Settings object.
   */
  static async getSettings() {
    const savedSettings = await storage.getSavedSettings();
    return {...defaultSettings, ...savedSettings};
  }

  /**
   * Save mapped field to local storage and send it to popup if not null.
   *
   * @param {Object} request - Request object.
   */
  static saveMappedField(request) {
    if (!request.path) {
      return;
    }

    storage.saveMappings(request);
    sendToPopup(request);
  }

  /**
   * Save settings to local storage.
   *
   * @param {Object} settings - Request object.
   *
   * @returns {Object} - New settings.
   */
  static saveSettings(settings) {
    const newSettings = {...this.getSettings(), ...settings};
    storage.saveSettings(newSettings);
    sendToPopup({action: ActionNames.savedSettings});
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
