import { sendToContent, sendToPopup } from '../background';
import ActionNames from '../helpers/ActionNames';
import MyParcelAPI from '../helpers/MyParcelAPI';
import log from '../helpers/log';
import presets from '../helpers/presets';
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
    const {url, preset} = request;
    // Data is saved and retrieved by hostname but full href is needed to try to detect a preset.
    const {hostname, href} = url;

    let selectors = await storage.getSavedMappingsForURL(hostname);
    let selectedPreset;
    let presetFields;

    if (selectors && selectors.preset) {
      selectedPreset = selectors.preset;
      delete selectors.preset;
    } else if (request.hasOwnProperty('preset')) {
      selectedPreset = preset;
    } else {
      selectedPreset = presets.findByURL(href);
    }

    if (selectedPreset) {
      const presetData = await presets.getData(selectedPreset);
      const overrides = selectors ? Object.keys(selectors) : null;

      presetFields = {name: selectedPreset, overrides};
      selectors = {...presetData, ...selectors};

      storage.savePreset({url: hostname, preset});
    }

    const data = {
      action: ActionNames.getContent,
      selectors,
    };

    if (presetFields) {
      data.preset = presetFields;
    }

    if (data.preset || data.selectors) {
      sendToContent(data);
    } else {
      log.warning(`No preset or selectors present for ${hostname}.`);
    }
  }

  /**
   * Get settings for given URL.
   *
   * @param {string} url - URL to fetch settings for.
   */
  static getSettings(url) {
    const settings = storage.getSettingsForURL(url);
    console.log(settings);

    return settings;
  }

  /**
   * Get saved mappings from Chrome synced storage.
   *
   * @param {Object} request - Request object.
   *
   * @return {Promise}
   */
  // getStorage(request) {
  //   const data = storage.getSavedMappings();
  //   sendToPopup(Object.assign(request, {data}));
  // },

  /**
   * Save mapped field to local storage and send it to popup if not null.
   *
   * @param {Object} request - Request object.
   */
  static saveMappedField(request) {
    if (request.path !== null) {
      storage.savePreset(request);
      sendToPopup(request);
    }
  }

  /**
   * Save settings to local storage.
   *
   * @param {Object} request - Request object.
   */
  static saveSettings(request) {
    if (request.path !== null) {
      storage.saveSettings(request);
      sendToPopup(request);
    }
  }

  /**
   * Delete a given field from storage.
   *
   * @param {Object} request - Request object.
   */
  static deleteField(request) {
    storage.deleteMappedField(request);
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
