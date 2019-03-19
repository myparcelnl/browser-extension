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

const getPresetFields = () => {
  return fetch(chrome.extension.getURL(config.presetsFile)).then((data) => data.json());
};

export default {

  detectBrowser() {
    const browserInfo = detect();
    return `${browserInfo.os.replace(/\s/, '-').toLowerCase()}_${browserInfo.name}/${browserInfo.version}`;
  },

  findPreset(url) {
    const preset = this.findPresetByURL(url);

    // if (!preset) {
    //   preset = this.findPresetByURL(url);
    // }

    return preset;
  },

  findPresetByURL(url) {
    if (url.includes('.myshopify.com')) {
      return SHOPIFY;
    }

    if (url.includes('/wp-admin/')) {
      return WOOCOMMERCE;
    }

    return false;
  },

  async getPresetData(preset) {
    const fields = await getPresetFields();

    return fields[preset];
  },
};
