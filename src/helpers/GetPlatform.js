/**
 * Get the platform name.
 *
 * @returns {string}
 */
export const getPlatform = () => {
  const appName = chrome.runtime.getManifest().short_name.toLowerCase();

  return appName.replace('staging', '').trim();
};
