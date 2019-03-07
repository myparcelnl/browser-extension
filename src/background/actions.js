import background, {popup} from '../background';
import MyParcelAPI from '../helpers/MyParcelAPI';
import storage from './storage';

export default {

  /**
   * Move focus to popup, save mapped field to local storage and send it to popup
   * @param request
   * @param url
   */
  saveMappedField(request, url) {
    console.log('saving mapped field');
    console.log(request);
    console.log(url);
    background.moveFocus(popup);
    storage.saveMappedField(Object.assign(request, {url}));
    background.sendToPopup(request);
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
