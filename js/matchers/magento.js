var Magento1Matcher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Magento1Matcher = (function(superClass) {
  extend(Magento1Matcher, superClass);

  function Magento1Matcher() {
    return Magento1Matcher.__super__.constructor.apply(this, arguments);
  }

  Magento1Matcher.prototype.PATTERN = /\/sales_order\/view\/order_id\/[0-9]{1,}\/key\//i;

  Magento1Matcher.prototype.address = function(callback) {
    var address, countryId, countrySelected, doc, fullName, fullStreet, shippingAddressLink, street_information, xmlhttp;
    if (callback == null) {
      callback = null;
    }
    shippingAddressLink = document.getElementsByClassName('head-shipping-address')[0].parentNode.getElementsByTagName('a')[0].getAttribute('href');
    xmlhttp = new XMLHttpRequest();
    doc = '';
    xmlhttp.onreadystatechange = function() {
      var parser;
      if (xmlhttp.readyState === XMLHttpRequest.DONE) {
        if (xmlhttp.status === 200) {
          parser = new DOMParser();
          doc = parser.parseFromString(xmlhttp.responseText, 'text/xml');
          if (!doc.getElementById('firstname')) {
            return doc = parser.parseFromString(xmlhttp.responseText, 'text/html');
          }
        } else if (xmlhttp.status === 400) {
          return alert('There was an error 400');
        } else {
          return alert('The request was not succesful. Admin session expired?');
        }
      }
    };
    xmlhttp.open('GET', shippingAddressLink, false);
    xmlhttp.send();
    this.doc = doc;
    fullStreet = this.docValue('street0') + ' ' + this.docValue('street1') + ' ' + this.docValue('street2') + ' ' + this.docValue('street3') + ' ' + this.docValue('street4');
    street_information = new AddressParser().processStreetPart(fullStreet.trim());
    fullName = doc.getElementById('firstname').getAttribute('value') + ' ' + doc.getElementById('middlename').getAttribute('value') + ' ' + doc.getElementById('lastname').getAttribute('value');
    countryId = doc.getElementById('country_id');
    countrySelected = countryId.options[countryId.selectedIndex].value;
    address = {
      street: street_information.street,
      postal_code: this.docValue('postcode'),
      city: this.docValue('city'),
      cc: countrySelected,
      person: fullName.replace('  ', ' '),
      company: this.docValue('company'),
      phone: this.docValue('telephone'),
      street_additional_info: this.docValue('region'),
      number: street_information.number,
      number_suffix: street_information.number_addition,
      email: this.mailtoLink('sales_order_view_tabs_order_info_content'),
      note: document.title.split('/')[0].trim(),
      platform: 'Magento 1',
      url: this.url
    };
    this.info('Found the following address from Magento 1');
    this._log(address);
    if (callback) {
      return callback(address);
    } else {
      return address;
    }
  };

  Magento1Matcher.prototype.updateUI = function() {
    return this.info('Updating UI for Magento 1');
  };

  Magento1Matcher.prototype.activate = function() {
    return true;
  };

  return Magento1Matcher;

})(BaseMatcher);
