var Magento2Matcher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Magento2Matcher = (function(superClass) {
  extend(Magento2Matcher, superClass);

  function Magento2Matcher() {
    return Magento2Matcher.__super__.constructor.apply(this, arguments);
  }

  Magento2Matcher.prototype.PATTERN = /\/sales\/order\/view\/order_id\/[0-9]{1,}\/key\//i;

  Magento2Matcher.prototype.address = function(callback) {
    var address, countrySelected, doc, fullName, fullStreet, shippingAddressLink, street_information, xmlhttp;
    if (callback == null) {
      callback = null;
    }
    shippingAddressLink = document.getElementsByClassName('order-shipping-address')[0].getElementsByTagName('a')[0].getAttribute('href');
    xmlhttp = new XMLHttpRequest();
    doc = '';
    xmlhttp.onreadystatechange = function() {
      var parser, responseText, responseTextArr1, responseTextArr2;
      if (xmlhttp.readyState === XMLHttpRequest.DONE) {
        if (xmlhttp.status === 200) {
          parser = new DOMParser();
          responseTextArr1 = xmlhttp.responseText.split('<form id="edit_form"');
          responseText = responseTextArr1[1];
          responseTextArr2 = responseText.split('</form>');
          responseText = responseTextArr2[0];
          return doc = parser.parseFromString('<form' + responseText + '</form>', 'text/xml');
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
    fullName = this.docValue('firstname') + ' ' + this.docValue('middlename') + ' ' + this.docValue('lastname');
    countrySelected = doc.getElementById('country_id').innerHTML.split('selected')[0].substr(-4, 2);
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
      platform: 'Magento 2',
      url: this.url
    };
    this.info('Found the following address from Magento 2');
    this._log(address);
    if (callback) {
      return callback(address);
    } else {
      return address;
    }
  };

  Magento2Matcher.prototype.updateUI = function() {
    return this.info('Updating UI for Magento 2');
  };

  Magento2Matcher.prototype.activate = function() {
    return true;
  };

  return Magento2Matcher;

})(BaseMatcher);
