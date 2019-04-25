// Strings
const contextMenuTitle = 'Label aanmaken van selectie';
const contextMenuItemId = 'myparcel-create-shipment';

const classPrefix = 'myparcel__';
const mappingPrefix = 'myparcel-mapping-';
const settingPrefix = 'myparcel-setting-';
const selectionClass = `${classPrefix}mapping-field`;
const tooltipClass = `${classPrefix}mapping-tooltip`;
const wrappedItemClass = `${classPrefix}wrapped-item`;

// Directories
const configDir = './config';
const distDir = './dist';
const cssDir = `${distDir}/css`;
const imgDir = `${distDir}/images`;
const jsDir = `${distDir}/js`;

// Icons
const activeIcon = `${imgDir}/icon-128px-alt.png`;
const defaultIcon = `${imgDir}/icon-128px.png`;

// Files
const configFile = `${configDir}/config.json`;
const presetsFile = `${configDir}/presets.json`;
const contentJS = `${jsDir}/content.js`;
const contentCSS = `${cssDir}/content.css`;

export default {
  activeIcon,
  classPrefix,
  configDir,
  configFile,
  contextMenuItemId,
  contextMenuTitle,
  cssDir,
  defaultIcon,
  distDir,
  imgDir,
  contentCSS,
  contentJS,
  jsDir,
  mappingPrefix,
  presetsFile,
  selectionClass,
  settingPrefix,
  tooltipClass,
  wrappedItemClass,
};
