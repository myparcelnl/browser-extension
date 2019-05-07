import {PresetData} from './PresetData';

export default class Presets {

  /**
   * Find existing preset by given href.
   *
   * @param {string} href - Full href.
   *
   * @returns {string|undefined} - Preset name or undefined if no preset was found.
   */
  static findByURL(href) {
    const preset = PresetData.urlMapping.find((entry) => href.match(entry.regex));
    return preset ? preset.name : undefined;
  }

  /**
   * Get preset fields by preset name.
   *
   * @param {string} presetName - Preset name.
   *
   * @returns {Object} - Fields for given preset.
   */
  static getFields(presetName) {
    if (PresetData.fields.hasOwnProperty(presetName)) {
      return PresetData.fields[presetName];
    } else {
      throw `Preset '${presetName}' doesn't exist.`;
    }
  }
};

