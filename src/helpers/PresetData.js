/**
 * Contains platform preset names, URL mappings and fields.
 */
export class PresetData {
  static BOL_COM = 'bol_com';
  static DRUPAL = 'drupal';
  static GRATISWEBSHOPBEGINNEN = 'gratiswebshopbeginnen';
  static JOOMLA = 'joomla';
  static LIGHTSPEED = 'lightspeed';
  static LUONDO = 'luondo';
  static MAGENTO1 = 'magento1';
  static MAGENTO2 = 'magento2';
  static MIJNWEBWINKEL = 'mijnwebwinkel';
  static MYSHOP = 'myshop';
  static OPENCART = 'opencart';
  static OSCOMMERCE = 'oscommerce';
  static PRESTASHOP = 'prestashop';
  static SEOSHOP = 'seoshop';
  static SHOPIFY = 'shopify';
  static SHOPPAGINA = 'shoppagina';
  static VIRTUEMART = 'virtuemart';
  static WOOCOMMERCE = 'woocommerce';

  /**
   * Mapping for detecting presets by URL. `presets.findPresetByURL` will check if `url` is present in the given href.
   *
   * @type {Array}
   */
  static urlMapping = [
    {
      url: '/wp-admin/',
      name: this.WOOCOMMERCE,
    },
    {
      url: '.myshopify.com',
      name: this.SHOPIFY,
    },
    {
      url: 'app.luondo.nl',
      name: this.LUONDO,
    },
  ];

  /**
   * Preset field selectors for every platform.
   *
   * @type {Array}
   */
  static fields = {
    [this.BOL_COM]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.DRUPAL]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.GRATISWEBSHOPBEGINNEN]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.JOOMLA]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.LIGHTSPEED]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.LUONDO]: {
      city: ':nth-child(3) > .general > tbody > :nth-child(5) > :nth-child(2)',
      company: ':nth-child(3) > .general > tbody > :nth-child(1) > :nth-child(2)',
      country: ':nth-child(3) > .general > tbody > :nth-child(6) > :nth-child(2)',
      name: ':nth-child(3) > .general > tbody > :nth-child(2) > :nth-child(2)',
      number: ':nth-child(3) > .general > tbody > :nth-child(3) > :nth-child(2)',
      numberSuffix: ':nth-child(3) > .general > tbody > :nth-child(3) > :nth-child(2)',
      postalCode: ':nth-child(3) > .general > tbody > :nth-child(4) > :nth-child(2)',
      street: ':nth-child(3) > .general > tbody > :nth-child(3) > :nth-child(2)',
    },
    [this.MAGENTO1]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.MAGENTO2]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.MIJNWEBWINKEL]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.MYSHOP]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.OPENCART]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.OSCOMMERCE]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.PRESTASHOP]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.SEOSHOP]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.SHOPIFY]: {
      name: '.ui-type-container > div > :nth-child(1) > a',
      company: ':nth-child(4) > :nth-child(1) > .ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      street: '.ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      number: '.ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      numberSuffix: '.ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      postalCode: '.ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      city: '.ui-type-container > .ui-stack > .ui-stack-item--fill > p',
    },
    [this.SHOPPAGINA]: {
      name: '',
      company: '',
      street: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.VIRTUEMART]: {
      name: '',
      company: '',
      number: '',
      numberSuffix: '',
      postalCode: '',
      city: '',
    },
    [this.WOOCOMMERCE]: {
      name: ':nth-child(3) > .address > p@1',
      company: ':nth-child(3) > .address > p@0',
      street: ':nth-child(3) > .address > p@2',
      number: ':nth-child(3) > .address > p@2',
      numberSuffix: ':nth-child(3) > .address > p@2',
      postalCode: ':nth-child(3) > .address > p@3',
      city: ':nth-child(3) > .address > p@3',
    },
  }
}
