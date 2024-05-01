/* eslint-disable no-console */
import {createRequire} from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const packageData = require('../package.json');

export default async (app, store) => {
  let path = `dist/chrome-extension-${app}-${packageData.version}.zip`;

  if (app.startsWith('staging')) {
    path = `dist/staging-chrome-extension-${app.replace('staging_', '')}-${packageData.version}.zip`;
  }

  try {
    const zip = fs.createReadStream(path);

    await store.uploadExisting(zip, store.token);
    console.log(`\u001b[32m${app}\u001b[0m`, `Extension ${app}@${packageData.version} successfully uploaded!`);
  } catch (e) {
    console.log(
      `\u001b[31m${app}\u001b[0m`,
      `Extension ${app}@${packageData.version} could not be uploaded: ${e.message}`,
    );
  }
};
