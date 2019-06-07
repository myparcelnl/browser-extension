/* eslint-disable no-console */

/**
 * Publish an app to the chrome web store.
 *
 * @param {string} app - App name.
 * @param {Object} store - Store.
 */
module.exports = (app, store) => {
  let target = 'default';

  // Upload staging apps to trustedTesters group instead of default.
  if (app.startsWith('staging')) {
    target = 'trustedTesters';
  }

  store.publish(target, store.token).then(() => {
    console.log(`\u001b[32m${app}\u001b[0m`, `Extension published (to ${target})!`);
  }).catch((err) => {
    console.log(`\u001b[31m${app}\u001b[0m`, `Extension could not be published: ${err.message}`);
  });
};
