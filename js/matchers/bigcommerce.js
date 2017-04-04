var BigCommerceMatcher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BigCommerceMatcher = (function(superClass) {
  extend(BigCommerceMatcher, superClass);

  function BigCommerceMatcher() {
    return BigCommerceMatcher.__super__.constructor.apply(this, arguments);
  }

  BigCommerceMatcher.prototype.PATTERN = /mybigcommerce.com\/manage\/orders$|mybigcommerce.com\/manage\/orders\?/i;

  BigCommerceMatcher.prototype.address = function(callback) {
    var address, addressParser, addressText, backup_city, backup_street, company, country, email, fetchedAddress, firstAddressRow, note, person, phone, postal_code, shippingColumn, street, street_information, visibleRows;
    if (callback == null) {
      callback = null;
    }
    visibleRows = $('#content-iframe').contents().find('tr[id^="orderRow"]:visible');
    if (0 === visibleRows.size()) {
      alert('Please open an order with the (+) button so we can read the address');
      return false;
    }
    firstAddressRow = visibleRows.first();
    shippingColumn = firstAddressRow.find('.qview-shipping-destination');
    addressText = shippingColumn.find('.qview-address').html().split('<br>');
    person = addressText.shift().replace(/\s+/g, ' ').trim();
    company = !addressText[0].match(/\d+/g) ? addressText.shift().replace(/\s+/g, ' ').trim() : '';
    addressParser = new AddressParser(addressText.join(' ').replace(/\s+/g, ' ').trim());
    fetchedAddress = addressParser.parse();
    backup_city = addressText.pop().replace(/\s+/g, ' ').trim();
    if ('' === backup_city) {
      backup_city = addressText.pop().replace(/\s+/g, ' ').trim();
    }
    backup_street = addressText.join(' ').replace(/\s+/g, ' ').trim();
    street = fetchedAddress.street ? (fetchedAddress.street + ' ' + fetchedAddress.number).replace(/\s+/g, ' ').trim() : backup_street;
    street_information = new AddressParser().processStreetPart(street);
    postal_code = fetchedAddress.postal_code ? fetchedAddress.postal_code : '';
    email = shippingColumn.find('a').first();
    country = shippingColumn.find('dd:eq(1)');
    phone = shippingColumn.find('dd:eq(2)');
    note = firstAddressRow.prev().find('td.order-source').next().next();
    address = {
      street: fetchedAddress.street ? street_information.street : backup_street.replace(street_information.number_addition, '').trim().replace(street_information.number, '').trim(),
      postal_code: postal_code,
      city: fetchedAddress.city ? fetchedAddress.city : backup_city.split(', ')[0].trim(),
      cc: fetchedAddress.cc ? fetchedAddress.cc : (new CountryCodesEn()).findByCountryName(country.html().trim()),
      person: person,
      phone: phone.html().trim(),
      street_additional_info: null,
      company: company,
      number: street_information.number,
      number_suffix: street_information.number_addition,
      email: email.html().trim(),
      note: note.html().trim(),
      platform: 'Bigcommerce',
      url: this.url
    };
    this.info('Found the following address from Bigcommerce');
    this._log(address);
    if (callback) {
      return callback(address);
    } else {
      return address;
    }
  };

  BigCommerceMatcher.prototype.updateUI = function() {
    return this.info('Updating UI for Bigcommerce');
  };

  BigCommerceMatcher.prototype.activate = function() {
    return true;
  };

  return BigCommerceMatcher;

})(BaseMatcher);
