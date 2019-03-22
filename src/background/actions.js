import { sendToContent, sendToPopup } from '../background';
import MyParcelAPI from '../helpers/MyParcelAPI';
import actionNames from '../helpers/actionNames';
import log from '../helpers/log';
import presets from '../helpers/presets';
import storage from './storage';

export default {

  async getContent(request) {
    console.log('getContent', request);
    const {url, preset} = request;

    let selectors = await storage.getSavedMappingsForURL(url);
    let selectedPreset = null;

    if (selectors && selectors.preset) {
      selectedPreset = selectors.preset;
    } else if (preset) {
      selectedPreset = preset;
      storage.savePreset({url, preset});
    }

    let presetFields = null;

    if (selectedPreset) {
      delete selectors.preset;
      const presetData = await presets.getPresetData(selectedPreset);
      const overrides = selectors ? Object.keys(selectors) : null;

      presetFields = {name: selectedPreset, overrides};
      selectors = {...presetData, ...selectors};
    }

    log.success('requesting content for fields in url from content');
    sendToContent({action: actionNames.getContent, selectors, preset: presetFields});
  },

  async getStorage(request) {
    const data = await storage.getSavedMappings();
    sendToPopup(Object.assign(request, {data}));
  },

  // async getFieldSettingsForURL(request) {
  //   const fields = await storage.getSavedMappingsForURL(request.url);
  //   sendToPopup({...request, fields});
  // },

  /**
   * Save mapped field to local storage and send it to popup if not null
   * @param request
   */
  saveMappedField(request) {
    console.log(request);
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
    MyParcelAPI.get('tracktraces',
      null,
      {barcode, postal_code: postalCode, country_code: countryCode})
      .then((response) => {
        const trackingInfo = response.data.tracktraces[0];
        console.log(trackingInfo);
        return trackingInfo;
      });
  },
};
