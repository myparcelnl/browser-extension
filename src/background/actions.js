import { background, popup } from '../background.js';
import { sendToContent, sendToPopup } from '../background';
import MyParcelAPI from '../helpers/MyParcelAPI';
import actionNames from '../helpers/actions';
import log from '../helpers/log';
import presets from '../helpers/presets';
import storage from './storage';

export default {

  async getSelectorsAndContent(request) {
    const {location, url} = request;
    log.success(`getting selectors for url: ${url}`);
    let selectors = await storage.getSavedMappingsForURL(url);
    let preset = false;
    const presetName = presets.findPreset(location);

    if (presetName) {
      log.success(`found preset for ${presetName}`);
      // sendToPopup({
      //   action: actionNames.foundPreset,
      //   overrides: Object.keys(selectors),
      //   preset: presetName,
      // });
      const presetData = await presets.getPresetData(presetName);
      const overrides = selectors ? Object.keys(selectors) : false;

      preset = {name: presetName, overrides};
      selectors = {...presetData, ...selectors};
    }

    log.success('requesting content for fields in url from content');
    sendToContent({action: actionNames.getElementsContent, selectors, preset});
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
   * @param url
   */
  saveMappedField(request) {
    if (request.path !== null) {
      storage.saveMappedField(request);
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
