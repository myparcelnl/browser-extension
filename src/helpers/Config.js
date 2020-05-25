import {getPlatform} from './GetPlatform';

const platform = getPlatform();

/**
 * Config class with all extension settings in it.
 */
export default class Config {
  static contextMenuCreateShipment = `${platform}-create-shipment`;

  static contextMenus = [
    {
      title: 'Label aanmaken van selectie',
      id: this.contextMenuCreateShipment,
      contexts: ['selection'],
    },
  ];

  // Prefixes used for the key names to save to browser storage
  static globalSettingPrefix = `${platform}-setting-`;
  static mappingPrefix = `${platform}-mapping-`;
  static urlSettingPrefix = `${platform}-url-setting-`;

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
}
