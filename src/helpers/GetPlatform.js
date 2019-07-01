/**
 * Get the platform name.
 *
 * @returns {string}
 */
export const getPlatform = () => chrome.runtime.getManifest().short_name.toLowerCase();
