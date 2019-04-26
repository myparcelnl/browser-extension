/**
 * Config class with all extension settings in it.
 */
export default class Config {
  // Strings
  static contextMenuTitle = 'Label aanmaken van selectie';
  static contextMenuItemId = 'myparcel-create-shipment';

  static classPrefix = 'myparcel__';
  static mappingPrefix = 'myparcel-mapping-';
  static settingPrefix = 'myparcel-setting-';
  static selectionClass = `${this.classPrefix}mapping-field`;
  static tooltipClass = `${this.classPrefix}mapping-tooltip`;
  static wrappedItemClass = `${this.classPrefix}wrapped-item`;

  // Directories
  static configDir = './config';
  static distDir = './dist';
  static cssDir = `${this.distDir}/css`;
  static imgDir = `${this.distDir}/images`;
  static jsDir = `${this.distDir}/js`;

  // Icons
  static activeIcon = `${this.imgDir}/icon-128px-alt.png`;
  static defaultIcon = `${this.imgDir}/icon-128px.png`;

  // Files
  static configFile = `${this.configDir}/config.json`;
  static contentJS = `${this.jsDir}/content.js`;
  static contentCSS = `${this.cssDir}/content.css`;
};
