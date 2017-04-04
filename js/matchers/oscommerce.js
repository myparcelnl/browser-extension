var OsCommerceMatcher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

OsCommerceMatcher = (function(superClass) {
  extend(OsCommerceMatcher, superClass);

  function OsCommerceMatcher() {
    return OsCommerceMatcher.__super__.constructor.apply(this, arguments);
  }

  OsCommerceMatcher.prototype.PATTERN = /orders.php\?page=[0-9]*&oID=[0-9]*&action=edit/i;

  OsCommerceMatcher.prototype.address = function(callback) {
    var address, city, city_part, company, country, country_part, data, email, person, phone, postal_code, street_information, temp, y;
    if (callback == null) {
      callback = null;
    }
    data = [];
    temp = this.xpath('//*[@id="contentText"]/table/tbody/tr[2]/td/table/tbody/tr[2]/td[2]/table/tbody/tr/td[2]/text()');
    while ((y = temp.iterateNext())) {
      data.push(y.textContent);
    }
    phone = this.read_xpath('//*[@id="contentText"]/table/tbody/tr[2]/td/table/tbody/tr[2]/td[1]/table/tbody/tr[3]/td[2]');
    email = this.read_xpath('//*[@id="contentText"]/table/tbody/tr[2]/td/table/tbody/tr[2]/td[1]/table/tbody/tr[4]/td[2]/a/u');
    if (data.length === 6) {
      street_information = new AddressParser().processStreetPart(data[2]);
      person = data[1];
      company = data[0];
      city_part = data[4];
      country_part = data[5];
    } else if (data.length === 5) {
      street_information = new AddressParser().processStreetPart(data[2]);
      person = data[1];
      company = data[0];
      city_part = data[3];
      country_part = data[4];
    } else {
      person = data[0];
      company = null;
      street_information = new AddressParser().processStreetPart(data[1]);
      city_part = data[2];
      country_part = data[3];
    }
    city_part = city_part.split(',');
    if (city_part.length === 2) {
      city = city_part[0];
      postal_code = city_part[1];
    }
    country_part = country_part.split(',');
    if (country_part.length === 2) {
      country = (new CountryCodesEn()).findByCountryName(country_part[1].trim());
    } else {
      country = country_part;
    }
    address = {
      street: street_information.street,
      postal_code: postal_code,
      city: city,
      cc: country,
      person: person,
      phone: phone,
      street_additional_info: null,
      company: company,
      number: street_information.number,
      number_suffix: street_information.number_addition,
      email: email,
      note: null,
      platform: 'Oscommerce',
      url: this.url
    };
    this.info('Found the following address from Oscommerce');
    this._log(address);
    if (callback) {
      return callback(address);
    } else {
      return address;
    }
  };

  OsCommerceMatcher.prototype.updateUI = function() {
    return this.info('Updating UI for Oscommerce');
  };

  OsCommerceMatcher.prototype.activate = function() {
    return true;
  };

  return OsCommerceMatcher;

})(BaseMatcher);
