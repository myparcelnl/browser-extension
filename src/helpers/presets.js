import config from '../helpers/config';
import { detect } from 'detect-browser';

const MAGENTO1 = 'magento1';
const MAGENTO2 = 'magento2';
const SHOPIFY = 'shopify';
const WOOCOMMERCE = 'woocommerce';

const getPresetFields = () => {
  return fetch(config.presetsFile).json();
};

export default {

  detectBrowser() {
    const browserInfo = detect();
    return `${browserInfo.os.replace(/\s/, '-').toLowerCase()}_${browserInfo.name}/${browserInfo.version}`;
  },

  findPreset(request) {
    if (request.url) {
      return this.findPresetByURL(request.url);
    }
  },

  findPresetByURL(url) {
    if (url.includes('.myshopify.com')) {
      return SHOPIFY;
    }
  },

  async getPresetData(preset) {
    const fields = await getPresetFields();
    switch (preset) {
      case MAGENTO1:
      case MAGENTO2:
      case SHOPIFY:
      case WOOCOMMERCE:

    }
  },
};
