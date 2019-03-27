import { sendToContent, sendToPopup } from '../background';
import MyParcelAPI from '../helpers/MyParcelAPI';
import actionNames from '../helpers/actionNames';
import presets from '../helpers/presets';
import storage from './storage';

export default {

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

  async getStorage(request) {
    const data = await storage.getSavedMappings();
    sendToPopup(Object.assign(request, {data}));
  },

  /**
   * Save mapped field to local storage and send it to popup if not null
   * @param request
   */
  saveMappedField(request) {
    if (request.path !== null) {
      storage.savePreset(request);
      sendToPopup(request);
    }
  },

  deleteField(request) {
    storage.deleteMappedField(request);
  },

  /**
   * Track a shipment using the MyParcel API
   * @param barcode
   * @param postalCode
   * @param countryCode
   */
  trackShipment(barcode, postalCode, countryCode) {
    MyParcelAPI.get(
      'tracktraces',
      null,
      {barcode, postal_code: postalCode, country_code: countryCode}
    )
      .then((response) => {
        const trackingInfo = response.data.tracktraces[0];
        return trackingInfo;
      });
  },
};
