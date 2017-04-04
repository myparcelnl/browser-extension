var MyparcelMatcher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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
