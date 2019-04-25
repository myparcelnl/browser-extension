import { sendToContent, sendToPopup } from '../background';
import MyParcelAPI from '../helpers/MyParcelAPI';
import actionNames from '../helpers/actionNames';
import presets from '../helpers/presets';
import storage from './storage';

export default {

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
  async getContent(request) {
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
      storage.savePreset({hostname, preset});
      selectedPreset = preset;
    } else {
      selectedPreset = presets.findByURL(href);
    }

    if (selectedPreset) {
      const presetData = await presets.getData(selectedPreset);
      const overrides = selectors ? Object.keys(selectors) : null;

      presetFields = {name: selectedPreset, overrides};
      selectors = {...presetData, ...selectors};
    }

    const data = {
      action: actionNames.getContent,
      selectors,
    };

    if (presetFields) {
      data.preset = presetFields;
    }

    console.log(data);
    sendToContent(data);
  },

  getSettings(request) {
    storage.getSettings(request);
  },

  /**
   * Get saved mappings from Chrome synced storage.
   *
   * @param {Object} request - Request object.
   *
   * @return {Promise}
   */
  getStorage(request) {
    const data = storage.getSavedMappings();
    sendToPopup(Object.assign(request, {data}));
  },

  /**
   * Save mapped field to local storage and send it to popup if not null.
   *
   * @param {Object} request - Request object.
   */
  saveMappedField(request) {
    if (request.path !== null) {
      storage.savePreset(request);
      sendToPopup(request);
    }
  },

  /**
   * Save settings to local storage.
   *
   * @param {Object} request - Request object.
   */
  saveSettings(request) {
    if (request.path !== null) {
      storage.saveSettings(request);
      sendToPopup(request);
    }
  },

  /**
   * Delete a given field from storage.
   *
   * @param {Object} request - Request object.
   */
  deleteField(request) {
    storage.deleteMappedField(request);
  },

  /**
   * Track a shipment using the MyParcel API.
   *
   * @param {string} barcode - Barcode.
   * @param {string} postalCode - Postal code.
   * @param {string} countryCode - 2-digit country code.
   */
  trackShipment(barcode, postalCode, countryCode) {
    MyParcelAPI.get(
      'tracktraces',
      null,
      {barcode, postal_code: postalCode, country_code: countryCode},
    )
      .then((response) => {
        return response.data.tracktraces[0];
      });
  },
};
