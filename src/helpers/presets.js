import config from '../helpers/config';
import { detect } from 'detect-browser';

const BOLCOM = 'bolcom';
const DRUPAL = 'drupal';
const GRATISWEBSHOPBEGINNEN = 'gratiswebshopbeginnen';
const JOOMLA = 'joomla';
const LIGHTSPEED = 'lightspeed';
const LUONDO = 'luondo';
const MAGENTO1 = 'magento1';
const MAGENTO2 = 'magento2';
const MIJNWEBWINKEL = 'mijnwebwinkel';
const MYSHOP = 'myshop';
const OPENCART = 'opencart';
const OSCOMMERCE = 'oscommerce';
const PRESTASHOP = 'prestashop';
const SEOSHOP = 'seoshop';
const SHOPIFY = 'shopify';
const SHOPPAGINA = 'shoppagina';
const VIRTUEMART = 'virtuemart';
const WOOCOMMERCE = 'woocommerce';

/**
 * Fetch presets from presets json file.
 *
 * @return {Promise<Object>}
 */
const getPresetFields = async() => {
  const data = await fetch(chrome.extension.getURL(config.presetsFile));
  return data.json();
};

export default {

  /**
   * Get browser info.
   *
   * @return {string}
   */
  detectBrowser() {
    const browserInfo = detect();
    return `${browserInfo.os.replace(/\s/, '-').toLowerCase()}_${browserInfo.name}/${browserInfo.version}`;
  },

  /**
   * Find existing preset by given URL.
   *
   * @param {string} url - URL.
   * @return {*|string|boolean}
   */
  findPresetByURL(url) {
    if (url.includes('.myshopify.com')) {
      return SHOPIFY;
    }

    if (url.includes('/wp-admin/')) {
      return WOOCOMMERCE;
    }

    return false;
  },

  /**
   * Get preset data by preset name.
   *
   * @param {string} preset - Preset name.
   * @return {Promise<Object>}
   */
  async getPresetData(preset) {
    const fields = await getPresetFields();

    return fields[preset];
  },
};
