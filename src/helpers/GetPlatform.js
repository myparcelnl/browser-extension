import {PLATFORM} from '../constants.js';

/**
 * Get the platform name.
 *
 * @returns {string}
 */
export const getPlatform = () => PLATFORM ?? chrome.runtime.getManifest().short_name.toLowerCase();
