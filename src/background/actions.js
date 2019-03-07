import { background, popup } from '../background.js';
import MyParcelAPI from '../helpers/MyParcelAPI';
import storage from './storage';
import { sendToPopup } from '../background';

export default {

  async getStorage(request) {
    const data = await storage.getSavedMappings();
    sendToPopup(Object.assign(request, {data}));
  },

  /**
   * Move focus to popup, save mapped field to local storage and send it to popup
   * @param request
   * @param url
   */
  saveMappedField(request) {
    console.log('saving mapped field');
    console.log(request);
    storage.saveMappedField(request);
    sendToPopup(request);
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
