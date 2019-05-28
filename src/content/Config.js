const platform = chrome.runtime.getManifest().short_name.toLowerCase();

/**
 * Config class with all content script settings in it.
 */
export default class ContentConfig {
  static classPrefix = `${platform}__`;

  static selectionClass = `${this.classPrefix}mapping-field`;

  static tooltipClass = `${this.classPrefix}mapping-tooltip`;
  static tooltipClassContent = `${this.tooltipClass}__content`;
  static tooltipClassEscape = `${this.tooltipClassContent}__escape`;
  static tooltipClassText = `${this.tooltipClassContent}__text`;
  static tooltipClassVisible = `${this.tooltipClass}--visible`;

  static wrappedItemClass = `${this.classPrefix}wrapped-item`;
};
