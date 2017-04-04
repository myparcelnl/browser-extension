var AddressParser, compact, merge, tap,
  slice = [].slice;

merge = function() {
  var xs;
  xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  if ((xs != null ? xs.length : void 0) > 0) {
    return tap({}, function(m) {
      var i, k, len, results, v, x;
      results = [];
      for (i = 0, len = xs.length; i < len; i++) {
        x = xs[i];
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

tap = function(o, fn) {
  fn(o);
  return o;
};

compact = function() {
  var elem, i, len, ref, results;
  ref = this;
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    elem = ref[i];
    if (elem != null) {
      results.push(elem);
    }
  }
  return results;
};

AddressParser = (function() {
  function AddressParser(string, options) {
    if (options == null) {
      options = {};
    }
    this.string = string;
    this.options = options;
    this.address = {};
    this.google = new GoogleGeocodeApi('api_key');
  }

  AddressParser.prototype.parse = function() {
    var parts;
    parts = this.parts();
    if (this.isDutchAddress() === true) {
      this.address = merge(this.processPostalCode(parts['postal_code']), this.processCityPart(parts['city_part']), this.processPersonPart(parts['person_part']));
      return this.address;
    } else {
      return this.google.parse(this.string);
    }
  };

  AddressParser.prototype.isDutchAddress = function() {
    if (this.string.match(/\b([0-9]{4}\s?[a-zA-Z]{2}\b)/i) !== null) {
      return true;
    } else {
      return false;
    }
  };

  AddressParser.prototype.parts = function() {
    var data, match, parts, reg;
    reg = /\b([0-9]{4}\s?[a-zA-Z]{2}\b)/i;
    data = {};
    match = this.string.match(reg);
    if (match !== null) {
      data['postal_code'] = match[1];
      parts = this.string.split(data['postal_code']);
      data['person_part'] = parts[0];
      data['city_part'] = parts[1];
    }
    return data;
  };

  AddressParser.prototype.processPostalCode = function(string) {
    if (string == null) {
      string = '';
    }
    return {
      'postal_code': string.toUpperCase()
    };
  };

  AddressParser.prototype.processPersonPart = function(string) {
    var data, index, part, parts;
    if (string == null) {
      string = '';
    }
    parts = string.split(/\n/i);
    parts = parts.filter(function(n) {
      return n.length > 1;
    });
    data = {};
    if (parts.length >= 2) {
      data['person'] = parts.shift();
      data['street'] = parts.pop();
    }
    for (index in parts) {
      part = parts[index];
      data['street_line_' + (index + 2)] = part;
    }
    if (data['street']) {
      data = merge(data, this.processStreetPart(data['street']));
    }
    return data;
  };

  AddressParser.prototype.processStreetPart = function(string) {
    var data, matches, reg;
    if (string == null) {
      string = '';
    }
    reg = /^(\d*[\wäöüß\d '\-\.]+)[,\s]+(\d+)\s*([\wäöüß\d\-\/]*)$/i;
    matches = string.match(reg);
    if (matches) {
      matches.shift();
      data = {
        'street': matches[0],
        'number': matches[1],
        'number_addition': matches[2]
      };
    } else {
      data = {
        'street': string,
        'number': '',
        'number_addition': ''
      };
    }
    return data;
  };

  AddressParser.prototype.processCityPart = function(string) {
    var data, index, part, parts, ref;
    if (string == null) {
      string = '';
    }
    parts = string.split(/\n/i);
    if (parts.length === 1) {
      return {
        'city': string.trim()
      };
    } else {
      data = {};
      ref = ['city', 'state', 'country'];
      for (index in ref) {
        part = ref[index];
        if (parts[index]) {
          data[part] = parts[index].trim();
        }
      }
      return data;
    }
  };

  return AddressParser;

})();
