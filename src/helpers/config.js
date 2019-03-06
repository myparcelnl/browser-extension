// Strings
const contextMenuTitle = 'Label aanmaken van selectie';
const contextMenuItemId = 'myparcel-create-shipment';

const selectionClass = 'myparcel__mapping-field';
const tooltipClass = 'myparcel__mapping-tooltip';

// Files
const configFile = './config/config.json';

// Directories
const distDir = './dist';
const cssDir = `${distDir}/css`;
const imgDir = `${distDir}/images`;
const jsDir = `${distDir}/js`;
// Icons
const activeIcon = `${imgDir}/icon-128px-alt.png`;
const defaultIcon = `${imgDir}/icon-128px.png`;

// Files
const injectJS = `${jsDir}/inject.js`;
const injectCSS = `${cssDir}/inject.css`;

export default {
  contextMenuTitle,
  contextMenuItemId,
  selectionClass,
  tooltipClass,
  configFile,
  distDir,
  cssDir,
  imgDir,
  jsDir,
  activeIcon,
  defaultIcon,
  injectJS,
  injectCSS,
};
