/* eslint-disable no-magic-numbers,@typescript-eslint/no-magic-numbers */
export const {PLATFORM, ENVIRONMENT, POPUP_URL} = process.env;

export const EXTENSION_PATH = 'browser-extension/create-shipment';

export const POPUP_DIMENSIONS = Object.freeze({
  width: 500,
  height: 620,
});

export const POPUP = 'popup';

export const CONTENT = 'content';

export const ACTIVE_ICON = `icon-${PLATFORM}-128px-alt.png`;

export const DEFAULT_ICON = `icon-${PLATFORM}-128px.png`;

export const URL_SETTING_PREFIX = `${PLATFORM}-url-setting-`;

export const MAPPING_PREFIX = `${PLATFORM}-mapping-`;

export const GLOBAL_SETTING_PREFIX = `${PLATFORM}-setting-`;

export const CONTEXT_MENU_CREATE_SHIPMENT = `${PLATFORM}-create-shipment`;

export const CONTEXT_MENU = Object.freeze({
  title: 'Label aanmaken van selectie',
  id: CONTEXT_MENU_CREATE_SHIPMENT,
  contexts: ['selection'],
} satisfies chrome.contextMenus.CreateProperties);
