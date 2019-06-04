/* eslint-disable no-console */
const storeData = require('./store-data');
const createStore = require('./webstore');
const yargs = require('yargs');

const target = yargs.argv.target || 'default';
const app = yargs.argv.app || null;
const targetName = target === 'trustedTesters' ? 'testers' : 'all users';

const publishApp = (app) => {
  const store = createStore(app);

  store.publish(target).then(() => {
    console.log(`${app}:`, `Extension published to ${targetName}!`);
  }).catch((err) => {
    console.log(`${app}:`, err.message);
  });
};

/**
 * Publish given app or all apps to target; testers or public.
 */
if (app) {
  publishApp(app);
} else {
  Object.keys(storeData.apps).forEach((app) => {
    publishApp(app);
  });
}
