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

    let selectors = await storage.getSavedMappingsForURL(url);
    let selectedPreset = null;

    if (selectors && selectors.preset) {
      selectedPreset = selectors.preset;
      delete selectors.preset;
    } else if (request.hasOwnProperty('preset')) {
      storage.savePreset({url, preset});
      selectedPreset = preset;
    }

    let presetFields = null;

    if (selectedPreset) {
      const presetData = await presets.getPresetData(selectedPreset);
      const overrides = selectors ? Object.keys(selectors) : null;

      presetFields = {name: selectedPreset, overrides};
      selectors = {...presetData, ...selectors};
    }

    sendToContent({action: actionNames.getContent, selectors, preset: presetFields});
  },

  /**
   * Get saved mappings from Chrome synced storage.
   *
   * @param {Object} request - Request object.
   *
   * @return {Promise}
   */
  async getStorage(request) {
    const data = await storage.getSavedMappings();
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
