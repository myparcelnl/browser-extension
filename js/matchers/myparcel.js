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
    var address = {
      street: 'Siriusdreef',
      postal_code: '2132WT',
      city: 'Hoofddorp',
      cc: 'NL',
      person: 'Mr. Parcel',
      company: 'MyParcel',
      phone: '0233030315',
      street_additional_info: '1e verdieping',
      number: '66-68',
      number_suffix: '',
      email: 'noreply@myparcel.nl',
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
