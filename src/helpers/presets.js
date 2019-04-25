import { detect } from 'detect-browser';
import { PresetData } from './PresetData';

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
   * Get preset data by preset name.
   *
   * @param {string} preset - Preset name.
   *
   * @return {Promise<Object>}
   */
  getData(preset) {
    const {fields} = PresetData;

    return fields[preset];
  },
};

