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
   * Mapping for detecting presets by URL. `Presets.findPresetByURL` will check if `url` is present in the given href.
   *
   * @type {Array}
   */
  static urlMapping = [
    {
      url: '/wp-admin/',
      name: this.WOOCOMMERCE,
    },
    {
      url: '.myshopify.com/admin/orders',
      name: this.SHOPIFY,
    },
    {
      url: 'app.luondo.nl',
      name: this.LUONDO,
    },
    {
      url: 'shoppagina.nl\\/admin\\/Shop\\/order-view',
      name: this.SHOPPAGINA,
    },
    // {
    //   regex: '\\/sales_order\\/view\\/order_id\\/[0-9]{1,}\\/key',
    //   name: this.MAGENTO1,
    // },
  ];

  /**
   * Preset field selectors for every platform.
   *
   * @type {Object.<MyParcel.PresetFields>}
   */
  static fields = {
    [this.BOL_COM]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.DRUPAL]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.GRATISWEBSHOPBEGINNEN]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.JOOMLA]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.LIGHTSPEED]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.LUONDO]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: ':nth-child(3) > .general > tbody > :nth-child(6) > :nth-child(2)',
      city: ':nth-child(3) > .general > tbody > :nth-child(5) > :nth-child(2)',
      company: ':nth-child(3) > .general > tbody > :nth-child(1) > :nth-child(2)',
      description: undefined,
      email: undefined,
      number: ':nth-child(3) > .general > tbody > :nth-child(3) > :nth-child(2)',
      number_suffix: ':nth-child(3) > .general > tbody > :nth-child(3) > :nth-child(2)',
      package_type: undefined,
      person: ':nth-child(3) > .general > tbody > :nth-child(2) > :nth-child(2)',
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: ':nth-child(3) > .general > tbody > :nth-child(4) > :nth-child(2)',
      street: ':nth-child(3) > .general > tbody > :nth-child(3) > :nth-child(2)',
      weight: undefined,
    },
    [this.MAGENTO1]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.MAGENTO2]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.MIJNWEBWINKEL]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.MYSHOP]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.OPENCART]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.OSCOMMERCE]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.PRESTASHOP]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.SEOSHOP]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.SHOPIFY]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: '.ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      company: ':nth-child(4) > :nth-child(1) > .ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      description: undefined,
      email: undefined,
      number: '.ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      number_suffix: '.ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      package_type: undefined,
      person: '.ui-type-container > div > :nth-child(1) > a',
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: '.ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      street: '.ui-type-container > .ui-stack > .ui-stack-item--fill > p',
      weight: undefined,
    },
    [this.SHOPPAGINA]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.VIRTUEMART]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: undefined,
      company: undefined,
      description: undefined,
      email: undefined,
      number: undefined,
      number_suffix: undefined,
      package_type: undefined,
      person: undefined,
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: undefined,
      street: undefined,
      weight: undefined,
    },
    [this.WOOCOMMERCE]: {
      additional_street: undefined,
      address_field_1: undefined,
      box: undefined,
      cc: undefined,
      city: ':nth-child(3) > .address > p@3',
      company: ':nth-child(3) > .address > p@0',
      description: undefined,
      email: undefined,
      number: ':nth-child(3) > .address > p@2',
      number_suffix: ':nth-child(3) > .address > p@2',
      package_type: undefined,
      person: ':nth-child(3) > .address > p@1',
      phone: undefined,
      pickup_number: undefined,
      pickup_postal: undefined,
      pickup_street: undefined,
      postal_code: ':nth-child(3) > .address > p@3',
      street: ':nth-child(3) > .address > p@2',
      weight: undefined,
    },
  };
}
