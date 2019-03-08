import { background, popup } from '../background.js';
import { sendToContent, sendToPopup } from '../background';
import MyParcelAPI from '../helpers/MyParcelAPI';
import log from '../helpers/log';
import storage from './storage';

export default {

  async newShipment(url) {
    log.success('got data for url:');
    const data = await storage.getSavedMappingsForURL(url);
    console.log(data);
    // sendToContent(Object.assign(request, {data}));
  },

  async getStorage(request) {
    const data = await storage.getSavedMappings();
    sendToPopup(Object.assign(request, {data}));
  },

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
