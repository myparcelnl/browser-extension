/* eslint-disable no-console */
const WebStore = require('chrome-webstore-upload');
const storeData = require('./store-data');
const fs = require('fs');
const packageData = require('../package.json');

const {apps, refreshToken, clientSecret, clientId} = storeData;

Object.keys(apps).forEach((app) => {

  const store = new WebStore({
    extensionId: apps[app],
    clientId,
    clientSecret,
    refreshToken,
  });

  const zip = fs.createReadStream(`dist/chrome-extension-${app}-${packageData.version}.zip`);

  store.uploadExisting(zip).then(() => {
    console.log(`${app}:`, 'Extension successfully uploaded!');
  }).catch((err) => {
    console.log(`${app}:`, err.message);
  });
});
