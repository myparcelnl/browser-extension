var ShoppaginaMatcher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ShoppaginaMatcher = (function(superClass) {
  extend(ShoppaginaMatcher, superClass);

  function ShoppaginaMatcher() {
    return ShoppaginaMatcher.__super__.constructor.apply(this, arguments);
  }

  ShoppaginaMatcher.prototype.PATTERN = /shoppagina.nl\/admin\/Shop\/order-view\//i;

  ShoppaginaMatcher.prototype.address = function(callback) {
    var address, form, fullName, fullStreet, street_information;
    if (callback == null) {
      callback = null;
    }
    this.doc = document;
    form = '' === this.docValue('customer_shipping_street') ? 'customer' : 'customer_shipping';
    fullStreet = this.docValue(form + '_street') + ' ' + this.docValue(form + '_street_nr') + ' ' + this.docValue(form + '_street_nr_add');
    street_information = new AddressParser().processStreetPart(fullStreet.trim());
    fullName = this.docValue(form + '_name_first') + ' ' + this.docValue(form + '_name_last');
    address = {
      street: street_information.street,
      postal_code: this.docValue(form + '_zipcode'),
      city: this.docValue(form + '_city'),
      cc: this.docValue(form + '_country'),
      person: fullName.replace('  ', ' '),
      company: this.docValue(form + '_company'),
      phone: this.docValue(form + '_phone'),
      street_additional_info: '',
      number: street_information.number,
      number_suffix: street_information.number_addition,
      email: this.docValue(form + '_email'),
      note: document.getElementsByClassName('breadcrumb')[0].getElementsByTagName('li')[3].innerHTML.trim(),
      platform: 'Shoppagina',
      url: this.url
    };
    this.info('Found the following address from Shoppagina');
    this._log(address);
    if (callback) {
      return callback(address);
    } else {
      return address;
    }
  };

  ShoppaginaMatcher.prototype.updateUI = function() {
    return this.info('Updating UI for Shoppagina');
  };

  ShoppaginaMatcher.prototype.activate = function() {
    return true;
  };

  return ShoppaginaMatcher;

})(BaseMatcher);
