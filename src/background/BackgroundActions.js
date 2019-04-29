import {sendToContent, sendToPopup} from '../background';
import ActionNames from '../helpers/ActionNames';
import Logger from '../helpers/Logger'; // strip-log
import MyParcelAPI from '../helpers/MyParcelAPI';
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
   * @return {Promise}
   */
  static async getContent(request) {
    // Data is saved and retrieved by hostname but full href is needed to try to detect a preset.
    const {hostname, href} = await request.url;
    console.log('hostname', hostname);
    console.log('href', href);

    let selectors = await storage.getSavedMappingsForURL(hostname);
    let presetName, presetFields;

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
      const presetData = {name: presetName, overrides};

      selectors = {...presetFields, ...selectors};

      storage.saveMappings({url: hostname, preset: presetData});
    }

    const data = {
      action: ActionNames.getContent,
    };

    if (presetFields) {
      data.preset = presetFields;
    }

    if (selectors) {
      data.selectors = selectors;
    }

    // Only send to content if either a preset or at least one selector is present.
    if (data.preset || data.selectors) {
      sendToContent(data);
    } else {
      Logger.warning(`No preset or selectors present for "${hostname}".`);
    }
  }

  /**
   * Get settings and set defaults if there are none available. Send the settings to the popup and also return them to
   * the background script.
   */
  static async getSettings() {
    const savedSettings = await storage.getSavedSettings();
    const settings = {...defaultSettings, ...savedSettings};
    sendToPopup({action: ActionNames.foundSettings, settings});
    return settings;
  }

  /**
   * Save mapped field to local storage and send it to popup if not null.
   *
   * @param {Object} request - Request object.
   */
  static saveMappedField(request) {
    if (request.path !== null) {
      storage.saveMappings(request);
      sendToPopup(request);
    }
  }

  /**
   * Save settings to local storage.
   *
   * @param {Object} request - Request object.
   */
  static saveSettings(request) {
    storage.saveSettings(request);
    sendToPopup({...request, action: ActionNames.savedSettings});
  }

  /**
   * Delete a given field from storage.
   *
   * @param {Object} request - Request object.
   */
  static deleteFields(request) {
    storage.deleteMappedFields(request);
  }

  /**
   * Track a shipment using the MyParcel API.
   *
   * @param {string} barcode - Barcode.
   * @param {string} postalCode - Postal code.
   * @param {string} countryCode - 2-digit country code.
   */
  static trackShipment(barcode, postalCode, countryCode) {
    MyParcelAPI.get(
      'tracktraces',
      null,
      {barcode, postal_code: postalCode, country_code: countryCode},
    )
      .then((response) => {
        return response.data.tracktraces[0];
      });
  }
}
