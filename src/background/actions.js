import background, {popup} from '../background';
import MyParcelAPI from '../helpers/MyParcelAPI';
import Storage from './storage';

export default {
  mapField(request, url) {
    background.moveFocus(popup);
    Storage.saveMappedField(Object.assign(request, {url}));
    background.sendToExternal(request);
  },

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
