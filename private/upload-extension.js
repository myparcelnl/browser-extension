/* eslint-disable no-console */
const fs = require('fs');
const packageData = require('../package.json');

module.exports = (app, store) => {
  let path = `dist/chrome-extension-${app}-${packageData.version}.zip`;

  if (app.startsWith('staging')) {
    path = `dist/staging-chrome-extension-${app.replace('staging_', '')}-${packageData.version}.zip`;
  }

  try {
    const zip = fs.createReadStream(path);

    store.uploadExisting(zip, store.token).then(() => {
      console.log(`\u001b[32m${app}\u001b[0m`, 'Extension successfully uploaded!');
    }).catch((err) => {
      console.log(`\u001b[31m${app}\u001b[0m`, `Extension could not be uploaded: ${err.message}`);
    });
  } catch (e) {
    throw e.getMessage();
  }
};
