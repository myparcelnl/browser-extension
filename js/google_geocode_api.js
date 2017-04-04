var GoogleGeocodeApi, merge,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
