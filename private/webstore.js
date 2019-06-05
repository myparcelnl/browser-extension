const {apps, clientId, clientSecret, refreshToken} = require('./store-data');
const WebStore = require('chrome-webstore-upload');

module.exports = async(app) => {
  const store = new WebStore({
    extensionId: apps[app],
    clientId,
    clientSecret,
    refreshToken,
  });

  store.token = await store.fetchToken();

  return store;
};
