const platform = chrome.runtime.getManifest().short_name.toLowerCase();

/**
 * Config class with all extension settings in it.
 */
export default class Config {

  static contextMenuCreateShipment = `${platform}-create-shipment`;
  static contextMenuSwitchApp = `${platform}-switch-app`;

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
  static mappingPrefix = `${platform}-mapping-`;
  static settingPrefix = `${platform}-setting-`;

  // Directories
  static cssDir = './css';
  static imgDir = './images';
  static jsDir = './js';

  // Icons
  static activeIcon = `${this.imgDir}/icon-${platform}-128px-alt.png`;
  static defaultIcon = `${this.imgDir}/icon-${platform}-128px.png`;

  // Files
  static configFile = './config.json';
  static contentCSS = `${this.cssDir}/${platform}-content.css`;
  static contentJS = `${this.jsDir}/${platform}-content.js`;
};
