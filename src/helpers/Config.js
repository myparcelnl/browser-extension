/**
 * Config class with all extension settings in it.
 */
export default class Config {

  static contextMenuCreateShipment = 'myparcel-create-shipment';
  static contextMenuSwitchApp = 'myparcel-switch-app';

  static contextMenus = [
    {
      title: 'Label aanmaken van selectie',
      id: this.contextMenuCreateShipment,
      contexts: ['selection'],
    },
    {
      title: 'Switch app',
      id: this.contextMenuSwitchApp,
      contexts: ['browser_action'],
    },
  ];

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
