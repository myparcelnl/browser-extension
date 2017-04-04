var MyparcelApi;

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
