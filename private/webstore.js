const {apps, clientId, clientSecret, refreshToken} = require('./store-data');
const WebStore = require('chrome-webstore-upload');

module.exports = (app) => {
  return new WebStore({
    extensionId: apps[app],
    clientId,
    clientSecret,
    refreshToken,
  });
};
