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
   * @example getContent({ url: 'url.com' });
   *
   * @param {Object} request - Request object.
   *
   * @returns {Promise}
   */
  static async getContent(request) {
    // Data is saved and retrieved by hostname but full href is needed to try to detect a preset.
    const {hostname, href} = request.url;

    let selectors = await storage.getSavedMappingsForURL(hostname);
    let presetName, presetData;

    console.log(`getContent | selectors for ${hostname}`, selectors);
    console.log('getContent | request', request);

    if (selectors && selectors.preset) {
      presetName = selectors.preset;
      delete selectors.preset;
    } else if (request.hasOwnProperty('preset')) {
      presetName = request.preset;
    } else {
      presetName = Presets.findByURL(href);
      if (presetName) {
        Logger.success(`Preset '${presetName}' applied.`);
      } else {
        Logger.warning(`No preset found for "${href}".`);
      }
    }

    if (presetName) {
      const presetFields = await Presets.getFields(presetName);

      // Add overridden values to the object to be able to differentiate them from preset values (and allow the user to
      // delete them)
      const overrides = selectors ? Object.keys(selectors) : null;
      presetData = {name: presetName, overrides};

      selectors = {...presetFields, ...selectors};

      storage.saveMappings({url: hostname, preset: presetData});
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
      Logger.warning(`No preset or selectors present for "${hostname}".`);
      // sendToPopup({action: ActionNames.backgroundConnected, url: hostname});
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
    console.log('saveMappedField', request);

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
