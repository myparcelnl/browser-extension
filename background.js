var API_HOST, AddressParser, MixpanelApi, MyparcelApi, addStoredShipment, clearStoredShipments, compact, distinctId, getStoredShipments, merge, postShipments, printStoredShipments, returnSavedUserObject, tap, token, track, uniqueId, updateBadgeCount,
  slice = [].slice;

MyparcelApi = (function() {
  var HOST, serialize;

  HOST = 'https://api.myparcel.nl';

  function MyparcelApi(api_key) {
    this.api_key = api_key;
  }

  MyparcelApi.prototype.post = function(path, data, headers) {
    var header, http_headers, request, value;
    if (data == null) {
      data = {};
    }
    if (headers == null) {
      headers = {};
    }
    http_headers = this.default_headers();
    for (header in headers) {
      value = headers[header];
      http_headers.append(header, value);
    }
    request = new Request(this.full_url(path), {
      method: 'POST',
      headers: http_headers,
      body: JSON.stringify(data)
    });
    return fetch(request);
  };

  MyparcelApi.prototype.get = function(path, data) {
    var http_headers, request;
    if (data == null) {
      data = {};
    }
    http_headers = this.default_headers();
    request = new Request(this.full_url(path, data), {
      method: 'GET',
      headers: http_headers
    });
    return fetch(request);
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

  MyparcelApi.prototype.default_headers = function() {
    var headers;
    headers = {
      'Authorization': 'Basic; ' + window.btoa(this.api_key)
    };
    return new Headers(headers);
  };

  MyparcelApi.prototype.full_url = function(path, data) {
    if (data == null) {
      data = null;
    }
    if (data) {
      return ("" + HOST + path + "?") + serialize(data);
    } else {
      return "" + HOST + path;
    }
  };

  return MyparcelApi;

})();

MixpanelApi = (function() {
  var HOST;

  HOST = 'https://api.mixpanel.com';

  function MixpanelApi(token, distinct_id) {
    this.token = token;
    this.distinct_id = distinct_id;
  }

  MixpanelApi.prototype.track = function(event, context) {
    var data, key, payload, url, value;
    if (context == null) {
      context = {};
    }
    payload = {
      event: event,
      properties: {
        distinct_id: this.distinct_id,
        token: this.token
      }
    };
    for (key in context) {
      value = context[key];
      payload.properties[key] = value;
    }
    data = window.btoa(JSON.stringify(payload));
    url = HOST + "/track?data=" + data;
    fetch(url);
    return true;
  };

  return MixpanelApi;

})();

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

token = '604fbfb8970cd78162d8e6201b817d6a';

API_HOST = 'https://api.myparcel.nl';

updateBadgeCount = function() {
  getStoredShipments(function(data) {
    if (data.data.length > 0) {
      chrome.browserAction.setBadgeText({
        text: data.data.length.toString()
      });
    } else {
      chrome.browserAction.setBadgeText({
        text: ''
      });
    }
  });
};

distinctId = function(callback) {
  chrome.storage.local.get('distinct_id', function(data) {
    var distinct_id;
    if (data && data.distinct_id) {
      callback(data.distinct_id);
    } else {
      distinct_id = uniqueId(10);
      chrome.storage.local.set({
        'distinct_id': distinct_id
      }, function(data) {});
      callback(distinct_id);
    }
  });
};

uniqueId = function(length) {
  var id;
  if (length == null) {
    length = 8;
  }
  id = "";
  while (id.length < length) {
    id += Math.random().toString(36).substr(2);
  }
  return id.substr(0, length);
};

track = (function(_this) {
  return function(event, context) {
    if (context == null) {
      context = {};
    }
    return distinctId(function(distinct_id) {
      var mixpanel;
      context.version = 'n/a';
      if ('undefined' !== typeof chrome.app) {
        context.version = chrome.app.getDetails().version || 'n/a';
      }
      mixpanel = new MixpanelApi(token, distinct_id);
      return returnSavedUserObject(function(user) {
        context.email = user.email;
        console.log("Tracking " + event + " ", context);
        return mixpanel.track(event, context);
      });
    });
  };
})(this);

returnSavedUserObject = function(callback) {
  chrome.storage.local.get('user', function(data) {
    callback(data.user);
  });
};

printStoredShipments = function(callback) {
  returnSavedUserObject(function(user) {
    chrome.storage.local.get('storedShipments', function(data) {
      var format, ids;
      if (!$.isArray(data.storedShipments)) {
        callback({
          status: 'error'
        });
        return;
      }
      if (user.format) {
        format = user.format.toUpperCase();
      } else {
        format = 'A4';
      }
      track('print_shipments', {
        count: data.storedShipments.length,
        format: format,
        ids: data.storedShipments
      });
      ids = data.storedShipments.join(';');
      $.ajax({
        dataType: 'json',
        method: 'GET',
        url: API_HOST + '/shipment_labels/' + ids,
        data: {
          format: format
        },
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', 'Basic; ' + user.api_key_base64);
          xhr.setRequestHeader('Accept', 'application/json');
        },
        success: function(response) {
          clearStoredShipments(function() {
            console.log('done');
          });
          callback({
            status: 'ok',
            data: API_HOST + response.data.pdfs.url
          });
        }
      });
    });
  });
};

postShipments = function(data, callback) {
  return returnSavedUserObject(function(user) {
    var DATA, PACKAGE_TYPE, URL, myparcel_api, shipments;
    if (data.url) {
      URL = data.url;
    } else {
      URL = 'unknown';
    }
    delete data.url;
    if (data.options && data.options.package_type) {
      PACKAGE_TYPE = data.options.package_type;
    } else {
      PACKAGE_TYPE = 'unknown';
    }
    DATA = data;
    shipments = {
      data: {
        shipments: [data]
      }
    };
    myparcel_api = new MyparcelApi(user.api_key);
    myparcel_api.post('/shipments', shipments, {
      'Content-Type': 'application/vnd.shipment+json;charset=utf-8'
    }).then(function(response) {
      return response.json();
    }).then(function(response) {
      var code, f, field, fields, first, i, last, len, ref, ref1, ref2;
      if (response.data !== void 0 && response.data.ids !== void 0 && response.data.ids[0] !== void 0 && response.data.ids[0].id !== void 0) {
        addStoredShipment(response.data.ids[0].id);
        track('create_shipment', {
          shipment_id: response.data.ids[0].id,
          url: URL,
          data: DATA,
          package_type: PACKAGE_TYPE
        });
        return callback({
          status: 'success',
          message: 'Awesome!!'
        });
      } else {
        fields = [];
        ref = response.errors;
        for (code in ref) {
          f = ref[code];
          ref1 = f.fields;
          for (i = 0, len = ref1.length; i < len; i++) {
            field = ref1[i];
            ref2 = field.split("."), first = ref2[0], last = ref2[ref2.length - 1];
            fields.push(last);
          }
          f;
        }
        return callback({
          status: 'error',
          message: 'Something went wrong server side',
          errors: fields
        });
      }
    })["catch"](function(error) {
      console.log('Failed POST /shipments', error);
      return callback({
        status: 'error',
        message: 'Could not create shipment'
      });
    });
  });
};

getStoredShipments = function(callback) {
  chrome.storage.local.get('storedShipments', function(data) {
    if (data && $.isArray(data.storedShipments)) {
      callback({
        status: 'ok',
        data: data.storedShipments
      });
    } else {
      callback({
        status: 'ok',
        data: []
      });
    }
  });
};

addStoredShipment = function(id, callback) {
  chrome.storage.local.get('storedShipments', function(data) {
    if (data && $.isArray(data.storedShipments)) {
      data = data.storedShipments;
    } else {
      data = [];
    }
    data.push(id);
    chrome.storage.local.set({
      'storedShipments': data
    }, function(data) {
      callback;
    });
  });
};

clearStoredShipments = function(callback) {
  chrome.storage.local.remove('storedShipments', function() {
    callback;
  });
};

distinctId(function(distinct_id) {
  return console.log("Unique user id " + distinct_id);
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  var key;
  for (key in changes) {
    key = key;
    if (key === 'storedShipments') {
      updateBadgeCount();
    }
  }
});

chrome.tabs.onActivated.addListener(function(info) {
  chrome.tabs.get(info.tabId, function(change) {
    var matcher;
    matcher = new Matcher(change.url);
    if (matcher.source.activate()) {
      chrome.browserAction.setIcon({
        path: 'images/icon128.png',
        tabId: info.tabId
      });
    } else {
      chrome.browserAction.setIcon({
        path: 'images/icon128-inactive.png',
        tabId: info.tabId
      });
    }
    updateBadgeCount();
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
  var matcher;
  matcher = new Matcher(tab.url);
  if (matcher.source.activate()) {
    chrome.browserAction.setIcon({
      path: 'images/icon128.png',
      tabId: tabId
    });
  } else {
    chrome.browserAction.setIcon({
      path: 'images/icon128-inactive.png',
      tabId: tabId
    });
  }
  updateBadgeCount();
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  var field, fields, i, len, message, user;
  if (msg.message) {
    message = {};
    message.source = sender.url;
    message.message = msg.message;
    console.log(message);
    return true;
  }
  if (msg.from === 'popup' && msg.subject === 'getUser') {
    chrome.storage.local.get('user', function(data) {
      if (data.user === void 0 || data.user.api_key === void 0) {
        sendResponse({
          user: void 0
        });
      } else {
        sendResponse({
          user: data
        });
      }
    });
    return true;
  }
  if (msg.from === 'popup' && msg.subject === 'getStoredShipments') {
    getStoredShipments(sendResponse);
    return true;
  }
  if (msg.from === 'popup' && msg.subject === 'printStoredShipments') {
    printStoredShipments(sendResponse);
    updateBadgeCount();
    return true;
  }
  if (msg.from === 'popup' && msg.subject === 'clearStoredShipments') {
    clearStoredShipments(sendResponse);
    updateBadgeCount();
    return true;
  }
  if (msg.from === 'popup' && msg.subject === 'loginToApi') {
    if (msg.api_key === '' || msg.api_key === void 0) {
      sendResponse({
        status: 'error',
        message: 'No API-key, please try again.'
      });
    }
    user = {};
    user.api_key = msg.api_key;
    user.api_key_base64 = window.btoa(msg.api_key);
    user.created_at = Date.now();
    fields = ['email', 'format', 'package_type'];
    for (i = 0, len = fields.length; i < len; i++) {
      field = fields[i];
      if (msg[field]) {
        user[field] = msg[field];
      }
    }
    chrome.storage.local.set({
      'user': user
    }, function() {
      sendResponse({
        status: 'success',
        message: 'Awesome!!'
      });
    });
    return true;
  }
  if (msg.from === 'popup' && msg.subject === 'newShipment') {
    postShipments(msg.shipment, sendResponse);
    return true;
  }
  if (msg.from === 'popup' && msg.subject === 'track') {
    track(msg.event, msg.context || {});
  }
});
