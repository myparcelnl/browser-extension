var SelectedTextMatcher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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
