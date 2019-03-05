import MyParcelAPI from '../helpers/MyParcelAPI';

export default {
  trackShipment(barcode, postalCode, countryCode) {
    return MyParcelAPI.get('tracktraces',
      null,
      {barcode, postal_code: postalCode, country_code: countryCode})
      .then((response) => {
        console.log(response.data.tracktraces[0]);
      });
  },
};
