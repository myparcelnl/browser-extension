var MixpanelApi;

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
