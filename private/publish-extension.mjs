/* eslint-disable no-console */

/**
 * Publish an app to the chrome web store.
 *
 * @param {string} app - App name.
 * @param {Object} store - Store.
 */
export default async (app, store) => {
  let target = 'default';

  // Upload staging apps to trustedTesters group instead of default.
  if (app.startsWith('staging')) {
    target = 'trustedTesters';
  }

  try {
    const res = await store.publish(target, store.token);

    if (res.error) {
      throw res.error;
    }

    console.log(`\u001b[32m${app}\u001b[0m`, `Extension published (to ${target})!`);
  } catch (e) {
    console.log(`\u001b[31m${app}\u001b[0m`, `Extension could not be published: ${e.message}`);
  }
};
