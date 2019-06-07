const createStore = require('./webstore');
const publishExtension = require('./publish-extension');
const storeData = require('./store-data');
const uploadExtension = require('./upload-extension');
const yargs = require('yargs');

const {
  /**
   * publish - Toggle publishing.
   *
   * @type {Boolean}
   */
  publish,

  /**
   * build - Can be 'stage' or 'prod'. Omit to process all.
   *
   * @type {String}
   */
  build,

  /**
   * upload - Toggle uploading.
   *
   * @type {Boolean}
   */
  upload,
} = yargs.argv;

/**
 * Which app to process. Leave null for all apps.
 *
 * @type {string}
 */
const app = yargs.argv.app || null;

/**
 * Run functions based on command arguments and given app.
 *
 * @param {string} app - App name.
 *
 * @returns {Promise}
 */
const execute = async(app) => {
  const store = await createStore(app);

  if (upload) {
    uploadExtension(app, store);
  }

  if (publish) {
    publishExtension(app, store);
  }
};

/**
 * Publish given app or all apps to target; testers or public.
 */
if (app) {
  execute(app);
} else {
  Object.keys(storeData.apps).forEach((app) => {
    // Ignore prod apps if build is stage.
    if (build === 'stage' && !app.startsWith('staging')) {
      return;
    }

    // Ignore staging apps if build is prod.
    if (build === 'prod' && app.startsWith('staging')) {
      return;
    }

    execute(app);
  });
}
