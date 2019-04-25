import { PresetData } from './PresetData';
import { detect } from 'detect-browser';

export default {

  /**
   * Get browser info.
   *
   * @return {string}
   */
  detectBrowser() {
    const browserInfo = detect();
    return `${browserInfo.os.replace(/\s/, '-').toLowerCase()}_${browserInfo.name}/${browserInfo.version}`;
  },

  /**
   * Find existing preset by given URL.
   *
   * @param {string} url - URL.
   *
   * @return {string|undefined} - Preset name or undefined if no preset was found.
   */
  findByURL(url) {
    const preset = PresetData.urlMapping.find((entry) => url.includes(entry.url));
    return preset.name || undefined;
  },

  /**
   * Get preset fields by preset name.
   *
   * @param {string} presetName - Preset name.
   *
   * @return {Promise<Object>}.
   */
  getFields(presetName) {
    return PresetData.fields[presetName];
  },
};

