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

  // Prefixes used for the key names to save to browser storage
  static mappingPrefix = 'myparcel-mapping-';
  static settingPrefix = 'myparcel-setting-';

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
  static bootPopup = `${this.distDir}/popup.html`;
  static configFile = `${this.configDir}/config.json`;
  static contentCSS = `${this.cssDir}/content.css`;
  static contentJS = `${this.jsDir}/Content.js`;
};
