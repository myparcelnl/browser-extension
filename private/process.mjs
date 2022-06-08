import createStore from './webstore.mjs';
import publishExtension from './publish-extension.mjs';
import {apps} from './store-data.mjs';
import uploadExtension from './upload-extension.mjs';
import yargs from 'yargs';

const {
  /**
   * Publish - Toggle publishing.
   *
   * @type {boolean}
   */
  publish,

  /**
   * Build - Can be 'stage' or 'prod'. Omit to process all.
   *
   * @type {string}
   */
  build,

  /**
   * Upload - Toggle uploading.
   *
   * @type {boolean}
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
    await uploadExtension(app, store);
  }

  if (publish) {
    await publishExtension(app, store);
  }
};

/**
 * Publish given app or all apps to target; testers or public.
 */
if (app) {
  execute(app);
} else {
  Object.keys(apps).forEach((app) => {
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
