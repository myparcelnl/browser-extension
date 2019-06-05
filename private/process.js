const createStore = require('./webstore');
const publishExtension = require('./publish-extension');
const storeData = require('./store-data');
const uploadExtension = require('./upload-extension');
const yargs = require('yargs');

console.log('args', yargs.argv);

/**
 * Which app to process. Leave null for all apps.
 *
 * @type {string}
 */
const app = yargs.argv.app || null;

/**
 * Target argument. 'default' to publish publicly or 'trustedTesters' to publish to test accounts.
 *
 * @type {string}
 */
const publish = yargs.argv.publish || 'default';

/**
 * Run functions based on command arguments and given app.
 *
 * @param {string} app - App name.
 *
 * @returns {Promise}
 */
const execute = async(app) => {
  const store = await createStore(app);

  if (yargs.argv.upload) {
    uploadExtension(app, store);
  }

  if (yargs.argv.publish) {
    publishExtension(app, store, publish);
  }
};

/**
 * Publish given app or all apps to target; testers or public.
 */
if (app) {
  execute(app);
} else {
  Object.keys(storeData.apps).forEach((app) => {
    execute(app);
  });
}
