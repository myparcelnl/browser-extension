// Strings
const contextMenuTitle = 'Label aanmaken van selectie';
const contextMenuItemId = 'myparcel-create-shipment';

const classPrefix = 'myparcel__';
const mappingPrefix = 'myparcel-mapping-';
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
const injectJS = `${jsDir}/inject.js`;
const injectCSS = `${cssDir}/inject.css`;

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
  injectCSS,
  injectJS,
  jsDir,
  mappingPrefix,
  presetsFile,
  selectionClass,
  tooltipClass,
  wrappedItemClass,
};
