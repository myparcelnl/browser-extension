var BaseMatcher, BigCommerceMatcher, CountryCodesEn, GoogleGeocodeApi, Magento1Matcher, Magento2Matcher, Matcher, MyparcelMatcher, OsCommerceMatcher, SelectedTextMatcher, ShopifyMatcher, ShoppaginaMatcher, merge,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CountryCodesEn = (function() {
  CountryCodesEn.COUNTRIES = {
    'AF': 'Afghanistan',
    'AX': 'Aland Islands',
    'AL': 'Albania',
    'DZ': 'Algeria',
    'AS': 'American Samoa',
    'AD': 'Andorra',
    'AO': 'Angola',
    'AI': 'Anguilla',
    'AQ': 'Antarctica',
    'AG': 'Antigua And Barbuda',
    'AR': 'Argentina',
    'AM': 'Armenia',
    'AW': 'Aruba',
    'AU': 'Australia',
    'AT': 'Austria',
    'AZ': 'Azerbaijan',
    'BS': 'Bahamas',
    'BH': 'Bahrain',
    'BD': 'Bangladesh',
    'BB': 'Barbados',
    'BY': 'Belarus',
    'BE': 'Belgium',
    'BZ': 'Belize',
    'BJ': 'Benin',
    'BM': 'Bermuda',
    'BT': 'Bhutan',
    'BO': 'Bolivia',
    'BA': 'Bosnia And Herzegovina',
    'BW': 'Botswana',
    'BV': 'Bouvet Island',
    'BR': 'Brazil',
    'IO': 'British Indian Ocean Territory',
    'BN': 'Brunei Darussalam',
    'BG': 'Bulgaria',
    'BF': 'Burkina Faso',
    'BI': 'Burundi',
    'KH': 'Cambodia',
    'CM': 'Cameroon',
    'CA': 'Canada',
    'CV': 'Cape Verde',
    'KY': 'Cayman Islands',
    'CF': 'Central African Republic',
    'TD': 'Chad',
    'CL': 'Chile',
    'CN': 'China',
    'CX': 'Christmas Island',
    'CC': 'Cocos (Keeling) Islands',
    'CO': 'Colombia',
    'KM': 'Comoros',
    'CG': 'Congo',
    'CD': 'Congo, Democratic Republic',
    'CK': 'Cook Islands',
    'CR': 'Costa Rica',
    'CI': 'Cote D\'Ivoire',
    'HR': 'Croatia',
    'CU': 'Cuba',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'DJ': 'Djibouti',
    'DM': 'Dominica',
    'DO': 'Dominican Republic',
    'EC': 'Ecuador',
    'EG': 'Egypt',
    'SV': 'El Salvador',
    'GQ': 'Equatorial Guinea',
    'ER': 'Eritrea',
    'EE': 'Estonia',
    'ET': 'Ethiopia',
    'FK': 'Falkland Islands (Malvinas)',
    'FO': 'Faroe Islands',
    'FJ': 'Fiji',
    'FI': 'Finland',
    'FR': 'France',
    'GF': 'French Guiana',
    'PF': 'French Polynesia',
    'TF': 'French Southern Territories',
    'GA': 'Gabon',
    'GM': 'Gambia',
    'GE': 'Georgia',
    'DE': 'Germany',
    'GH': 'Ghana',
    'GI': 'Gibraltar',
    'GR': 'Greece',
    'GL': 'Greenland',
    'GD': 'Grenada',
    'GP': 'Guadeloupe',
    'GU': 'Guam',
    'GT': 'Guatemala',
    'GG': 'Guernsey',
    'GN': 'Guinea',
    'GW': 'Guinea-Bissau',
    'GY': 'Guyana',
    'HT': 'Haiti',
    'HM': 'Heard Island & Mcdonald Islands',
    'VA': 'Holy See (Vatican City State)',
    'HN': 'Honduras',
    'HK': 'Hong Kong',
    'HU': 'Hungary',
    'IS': 'Iceland',
    'IN': 'India',
    'ID': 'Indonesia',
    'IR': 'Iran, Islamic Republic Of',
    'IQ': 'Iraq',
    'IE': 'Ireland',
    'IM': 'Isle Of Man',
    'IL': 'Israel',
    'IT': 'Italy',
    'JM': 'Jamaica',
    'JP': 'Japan',
    'JE': 'Jersey',
    'JO': 'Jordan',
    'KZ': 'Kazakhstan',
    'KE': 'Kenya',
    'KI': 'Kiribati',
    'KR': 'Korea',
    'KW': 'Kuwait',
    'KG': 'Kyrgyzstan',
    'LA': 'Lao People\'s Democratic Republic',
    'LV': 'Latvia',
    'LB': 'Lebanon',
    'LS': 'Lesotho',
    'LR': 'Liberia',
    'LY': 'Libyan Arab Jamahiriya',
    'LI': 'Liechtenstein',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'MO': 'Macao',
    'MK': 'Macedonia',
    'MG': 'Madagascar',
    'MW': 'Malawi',
    'MY': 'Malaysia',
    'MV': 'Maldives',
    'ML': 'Mali',
    'MT': 'Malta',
    'MH': 'Marshall Islands',
    'MQ': 'Martinique',
    'MR': 'Mauritania',
    'MU': 'Mauritius',
    'YT': 'Mayotte',
    'MX': 'Mexico',
    'FM': 'Micronesia, Federated States Of',
    'MD': 'Moldova',
    'MC': 'Monaco',
    'MN': 'Mongolia',
    'ME': 'Montenegro',
    'MS': 'Montserrat',
    'MA': 'Morocco',
    'MZ': 'Mozambique',
    'MM': 'Myanmar',
    'NA': 'Namibia',
    'NR': 'Nauru',
    'NP': 'Nepal',
    'NL': 'Netherlands',
    'AN': 'Netherlands Antilles',
    'NC': 'New Caledonia',
    'NZ': 'New Zealand',
    'NI': 'Nicaragua',
    'NE': 'Niger',
    'NG': 'Nigeria',
    'NU': 'Niue',
    'NF': 'Norfolk Island',
    'MP': 'Northern Mariana Islands',
    'NO': 'Norway',
    'OM': 'Oman',
    'PK': 'Pakistan',
    'PW': 'Palau',
    'PS': 'Palestinian Territory, Occupied',
    'PA': 'Panama',
    'PG': 'Papua New Guinea',
    'PY': 'Paraguay',
    'PE': 'Peru',
    'PH': 'Philippines',
    'PN': 'Pitcairn',
    'PL': 'Poland',
    'PT': 'Portugal',
    'PR': 'Puerto Rico',
    'QA': 'Qatar',
    'RE': 'Reunion',
    'RO': 'Romania',
    'RU': 'Russian Federation',
    'RW': 'Rwanda',
    'BL': 'Saint Barthelemy',
    'SH': 'Saint Helena',
    'KN': 'Saint Kitts And Nevis',
    'LC': 'Saint Lucia',
    'MF': 'Saint Martin',
    'PM': 'Saint Pierre And Miquelon',
    'VC': 'Saint Vincent And Grenadines',
    'WS': 'Samoa',
    'SM': 'San Marino',
    'ST': 'Sao Tome And Principe',
    'SA': 'Saudi Arabia',
    'SN': 'Senegal',
    'RS': 'Serbia',
    'SC': 'Seychelles',
    'SL': 'Sierra Leone',
    'SG': 'Singapore',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'SB': 'Solomon Islands',
    'SO': 'Somalia',
    'ZA': 'South Africa',
    'GS': 'South Georgia And Sandwich Isl.',
    'ES': 'Spain',
    'LK': 'Sri Lanka',
    'SD': 'Sudan',
    'SR': 'Suriname',
    'SJ': 'Svalbard And Jan Mayen',
    'SZ': 'Swaziland',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'SY': 'Syrian Arab Republic',
    'TW': 'Taiwan',
    'TJ': 'Tajikistan',
    'TZ': 'Tanzania',
    'TH': 'Thailand',
    'TL': 'Timor-Leste',
    'TG': 'Togo',
    'TK': 'Tokelau',
    'TO': 'Tonga',
    'TT': 'Trinidad And Tobago',
    'TN': 'Tunisia',
    'TR': 'Turkey',
    'TM': 'Turkmenistan',
    'TC': 'Turks And Caicos Islands',
    'TV': 'Tuvalu',
    'UG': 'Uganda',
    'UA': 'Ukraine',
    'AE': 'United Arab Emirates',
    'GB': 'United Kingdom',
    'US': 'United States',
    'UM': 'United States Outlying Islands',
    'UY': 'Uruguay',
    'UZ': 'Uzbekistan',
    'VU': 'Vanuatu',
    'VE': 'Venezuela',
    'VN': 'Viet Nam',
    'VG': 'Virgin Islands, British',
    'VI': 'Virgin Islands, U.S.',
    'WF': 'Wallis And Futuna',
    'EH': 'Western Sahara',
    'YE': 'Yemen',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe'
  };

  function CountryCodesEn() {
    CountryCodesEn.COUNTRIES;
  }

  CountryCodesEn.prototype.findByCountryName = function(country_name) {
    var code, name, ref, result;
    if (country_name == null) {
      country_name = 'NL';
    }
    ref = CountryCodesEn.COUNTRIES;
    for (code in ref) {
      name = ref[code];
      if (name.toLowerCase() === country_name.toLowerCase()) {
        result = code;
        break;
      }
    }
    return result;
  };

  CountryCodesEn.prototype.findByCountryCode = function(code) {
    return CountryCodesEn.COUNTRIES[code.toUpperCase()];
  };

  return CountryCodesEn;

})();

merge = function() {
  var xs;
  xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  if ((xs != null ? xs.length : void 0) > 0) {
    return tap({}, function(m) {
      var j, k, len, results, v, x;
      results = [];
      for (j = 0, len = xs.length; j < len; j++) {
        x = xs[j];
        results.push((function() {
          var results1;
          results1 = [];
          for (k in x) {
            v = x[k];
            results1.push(m[k] = v);
          }
          return results1;
        })());
      }
      return results;
    });
  }
};

GoogleGeocodeApi = (function() {
  var HOST, cleanArray, serialize;

  HOST = 'https://maps.googleapis.com';

  function GoogleGeocodeApi(api_key) {
    this.api_key = api_key;
  }

  GoogleGeocodeApi.prototype.get = function(path, data) {
    var response, xmlhttp;
    if (data == null) {
      data = {};
    }
    xmlhttp = new XMLHttpRequest();
    response = "";
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === XMLHttpRequest.DONE) {
        if (xmlhttp.status === 200) {
          return response = xmlhttp.responseText;
        } else {
          return response = false;
        }
      }
    };
    xmlhttp.open('GET', this.full_url(path, data), false);
    xmlhttp.send();
    return response;
  };

  GoogleGeocodeApi.prototype.parse = function(string) {
    var result;
    result = this.get('/maps/api/geocode/json', {
      address: this.stripEmail(string)
    });
    result = JSON.parse(result);
    if (result && result.results.length >= 1) {
      return this.mappedAddress(result, string);
    } else {
      return false;
    }
  };

  GoogleGeocodeApi.prototype.mappedAddress = function(object, source) {
    var address, components;
    components = object.results[0];
    address = {
      street: this.getStreet(components),
      postal_code: this.fetchByType(components.address_components, ['postal_code']),
      city: this.fetchByType(components.address_components, ['locality']),
      cc: this.fetchByType(components.address_components, ['country'], true),
      cc_long: this.fetchByType(components.address_components, ['country']),
      number: "",
      email: this.getEmail(source),
      platform: 'Google'
    };
    address = this.getPerson(address, source);
    return address;
  };

  GoogleGeocodeApi.prototype.getPerson = function(address, string) {
    var j, len, part, parts_to_strip, person_parts, regex;
    string = this.stripEmail(string);
    parts_to_strip = ['street', 'postal_code', 'cc_long', 'city'];
    for (j = 0, len = parts_to_strip.length; j < len; j++) {
      part = parts_to_strip[j];
      regex = new RegExp('(' + address[part] + ')', 'gi');
      string = string.replace(regex, "");
    }
    person_parts = string.split(/\r?\n|\r/);
    if (person_parts.length >= 1) {
      address.person = person_parts[0];
      if (person_parts.length > 1) {
        address.company = person_parts[1];
      }
    }
    if (address.city === false || address.cc === false || address.street === false) {
      return false;
    }
    return address;
  };

  GoogleGeocodeApi.prototype.getStreet = function(data) {
    var set;
    if (this.fetchByType(data.address_components, ["route"]) !== false && this.fetchByType(data.address_components, ["street_number"]) !== false) {
      set = [this.fetchByType(data.address_components, ["route"]), this.fetchByType(data.address_components, ["street_number"])];
      return set.join(" ");
    } else {
      return data.formatted_address.split(",")[0];
    }
  };

  GoogleGeocodeApi.prototype.stripEmail = function(string) {
    return string.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, '');
  };

  GoogleGeocodeApi.prototype.getEmail = function(string) {
    var result;
    result = string.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if (result && result.length >= 1) {
      return result[0];
    } else {
      return false;
    }
  };

  cleanArray = function(actual) {
    var i, newArray;
    newArray = new Array;
    i = 0;
    while (i < actual.length) {
      if (actual[i]) {
        newArray.push(actual[i]);
      }
      i++;
    }
    return newArray;
  };

  GoogleGeocodeApi.prototype.filterByType = function(address_components, types) {
    return address_components.filter(function(i) {
      var c, j, len, type;
      c = 0;
      for (j = 0, len = types.length; j < len; j++) {
        type = types[j];
        if (indexOf.call(i.types, type) >= 0) {
          c = c + 1;
        }
      }
      return c >= 1;
    });
  };

  GoogleGeocodeApi.prototype.fetchByType = function(address_components, types, short) {
    var result;
    if (short == null) {
      short = false;
    }
    result = this.filterByType(address_components, types);
    if (result.length === 0) {
      return false;
    }
    if (short) {
      return result[0].short_name;
    } else {
      return result[0].long_name;
    }
  };

  serialize = function(obj, prefix) {
    var k, p, str, v;
    str = [];
    for (p in obj) {
      v = obj[p];
      k = prefix ? prefix + "[" + p + "]" : p;
      if (typeof v === "object") {
        str.push(serialize(v, k));
      } else {
        str.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  };

  GoogleGeocodeApi.prototype.full_url = function(path, data) {
    if (data == null) {
      data = null;
    }
    if (data) {
      return ("" + HOST + path + "?") + serialize(data);
    } else {
      return "" + HOST + path;
    }
  };

  return GoogleGeocodeApi;

})();

Matcher = (function() {
  function Matcher(url) {
    this.source = this.source(url);
  }

  Matcher.prototype.updateBadge = function() {};

  Matcher.prototype.name = function() {
    return this.source.constructor.name;
  };

  Matcher.prototype.source = function(url) {
    if (url.match(ShopifyMatcher.prototype.PATTERN)) {
      return new ShopifyMatcher(url);
    }
    if (url.match(Magento1Matcher.prototype.PATTERN)) {
      return new Magento1Matcher(url);
    }
    if (url.match(Magento2Matcher.prototype.PATTERN)) {
      return new Magento2Matcher(url);
    }
    if (url.match(OsCommerceMatcher.prototype.PATTERN)) {
      return new OsCommerceMatcher(url);
    }
    if (url.match(MyparcelMatcher.prototype.PATTERN)) {
      return new MyparcelMatcher(url);
    }
    if (url.match(BigCommerceMatcher.prototype.PATTERN)) {
      return new BigCommerceMatcher(url);
    }
    if (url.match(ShoppaginaMatcher.prototype.PATTERN)) {
      return new ShoppaginaMatcher(url);
    }
    return new SelectedTextMatcher(url);
  };

  return Matcher;

})();

BaseMatcher = (function() {
  BaseMatcher.prototype.PATTERN = '';

  function BaseMatcher(url) {
    if (url == null) {
      url = 'unknown';
    }
    this.url = url;
    this.updateUI();
  }

  BaseMatcher.prototype.address = function(callback) {
    if (callback == null) {
      callback = null;
    }
  };

  BaseMatcher.prototype.updateUI = function() {
    return this.info("Updating UI");
  };

  BaseMatcher.prototype.activate = function() {
    return false;
  };

  BaseMatcher.prototype.info = function(message) {
    return this._log("[INFO] - " + message);
  };

  BaseMatcher.prototype._log = function(message) {
    chrome.runtime.sendMessage({
      message: message
    });
    return true;
  };

  BaseMatcher.prototype.docValue = function(id) {
    var elem, res;
    res = '';
    elem = this.doc.getElementById(id);
    if (null !== elem) {
      res = 'undefined' === typeof elem.value ? elem.getAttribute('value') : elem.value;
    }
    return res;
  };

  BaseMatcher.prototype.mailtoLink = function(id) {
    var href, i, j, links, mailto, ref;
    links = document.getElementById(id).getElementsByTagName('a');
    mailto = '';
    for (i = j = 0, ref = links.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      href = links[i].getAttribute('href');
      if (0 === href.indexOf('mailto:')) {
        mailto = href.replace('mailto:', '');
      }
    }
    return mailto;
  };

  BaseMatcher.prototype.xpath = function(path) {
    return document.evaluate(path, document, null, XPathResult.ANY_TYPE, null);
  };

  BaseMatcher.prototype.read_xpath = function(path) {
    var value;
    value = this.xpath(path).iterateNext();
    if (value !== null) {
      return value.textContent;
    }
    return null;
  };

  return BaseMatcher;

})();

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

SelectedTextMatcher = (function(superClass) {
  extend(SelectedTextMatcher, superClass);

  function SelectedTextMatcher() {
    return SelectedTextMatcher.__super__.constructor.apply(this, arguments);
  }

  SelectedTextMatcher.prototype.address = function(callback) {
    var address, addressParser, fetchedAddress;
    if (callback == null) {
      callback = null;
    }
    addressParser = new AddressParser(window.getSelection().toString());
    fetchedAddress = addressParser.parse();
    if (fetchedAddress) {
      address = {};
      address.number_suffix = "";
      address.street = fetchedAddress.street != null ? fetchedAddress.street : null;
      address.number = fetchedAddress.number != null ? fetchedAddress.number : null;
      address.person = fetchedAddress.person != null ? fetchedAddress.person : null;
      address.company = fetchedAddress.company != null ? fetchedAddress.company : null;
      address.postal_code = fetchedAddress.postal_code ? fetchedAddress.postal_code : null;
      address.email = fetchedAddress.email ? fetchedAddress.email : null;
      address.cc = fetchedAddress.cc ? fetchedAddress.cc : 'NL';
      address.city = fetchedAddress.city != null ? fetchedAddress.city : null;
      address.platform = fetchedAddress.platform != null ? fetchedAddress.platform : 'Selected Text';
      address.url = this.url;
      this._log("Found address from selection");
      this._log(address);
    } else {
      address = false;
    }
    if (callback) {
      return callback(address);
    } else {
      return address;
    }
  };

  SelectedTextMatcher.prototype.updateUI = function() {
    return this.info('Updating UI for selected text');
  };

  SelectedTextMatcher.prototype.parseGoogleOutput = function(response) {
    var googleAddress;
    if (response.status !== 'OK' || response.results.length < 1) {
      return {};
    }
    googleAddress = {};
    googleAddress.platform = "Selected text through Google";
    return googleAddress;
  };

  return SelectedTextMatcher;

})(BaseMatcher);

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

MyparcelMatcher = (function(superClass) {
  extend(MyparcelMatcher, superClass);

  function MyparcelMatcher() {
    return MyparcelMatcher.__super__.constructor.apply(this, arguments);
  }

  MyparcelMatcher.prototype.PATTERN = /(www|backoffice).myparcel.nl/i;

  MyparcelMatcher.prototype.address = function(callback) {
    var address;
    if (callback == null) {
      callback = null;
    }
    address = {
      street: 'Hoofdweg',
      postal_code: '2131BC',
      city: 'Hoofddorp',
      cc: 'NL',
      person: 'Timo Cochius',
      company: 'MyParcel',
      phone: '0233030315',
      street_additional_info: '3e verdieping',
      number: '679',
      number_suffix: '3c',
      email: 'info@myparcel.nl',
      note: 'Wij helpen webwinkels groeien',
      platform: 'MyParcel',
      url: this.url
    };
    this.info("Found the following address from MyParcel");
    this._log(address);
    if (callback) {
      return callback(address);
    } else {
      return address;
    }
  };

  MyparcelMatcher.prototype.updateUI = function() {};

  MyparcelMatcher.prototype.activate = function() {
    return true;
  };

  return MyparcelMatcher;

})(BaseMatcher);

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
