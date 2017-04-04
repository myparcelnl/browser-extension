var ShopifyMatcher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ShopifyMatcher = (function(superClass) {
  extend(ShopifyMatcher, superClass);

  function ShopifyMatcher() {
    return ShopifyMatcher.__super__.constructor.apply(this, arguments);
  }

  ShopifyMatcher.prototype.PATTERN = /myshopify.com\/admin\/orders\/[0-9]{1,}/i;

  ShopifyMatcher.prototype.address = function(callback) {
    var address, dom, dom_email, street_information;
    if (callback == null) {
      callback = null;
    }
    dom = $($("script[data-define='{editAddressModal_shipping_address: new Shopify.Modal(this)}']").html());
    dom_email = $($("script[data-define='{editCustomerEmailModal: new Shopify.Modal(this)}']").html());
    street_information = dom.find('input#address_address1').val();
    street_information = new AddressParser().processStreetPart(street_information);
    address = {
      street: street_information.street,
      postal_code: dom.find('input#address_zip').val(),
      city: dom.find('input#address_city').val(),
      cc: (new CountryCodesEn()).findByCountryName(dom.find('select#address_country').val()),
      person: dom.find('input#address_first_name').val() + " " + dom.find('input#address_last_name').val(),
      company: dom.find('input#address_company').val(),
      phone: dom.find('input#address_phone').val(),
      street_additional_info: dom.find('input#address_address2').val(),
      company: dom.find('input#address_company').val(),
      number: street_information.number,
      number_suffix: street_information.number_addition,
      email: dom_email.find('input#order_email').val(),
      note: null,
      platform: 'Shopify',
      url: this.url
    };
    this.info("Found the following address from Shopify");
    this._log(address);
    if (callback) {
      return callback(address);
    } else {
      return address;
    }
  };

  ShopifyMatcher.prototype.updateUI = function() {
    return this.info("Updating UI for shopify");
  };

  ShopifyMatcher.prototype.activate = function() {
    return true;
  };

  return ShopifyMatcher;

})(BaseMatcher);
