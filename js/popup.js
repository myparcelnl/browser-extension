var fetchShipmentData, hideLoginForm, hideNoCDShipments, hideNoMatch, hideSettings, hideShipmentForm, hideShipmentSuccess, log, login, newShipmentCreated, noCDShipments, noMatch, original_address, pendingShipmentForm, postShipment, prefillShipmentData, readyShipmentForm, saveSettings, shipmentData, showLoginForm, showSettings, showShipmentForm, showShipmentSuccess, track, updateFormBasedOnCc, updatePlatformMessage, updateShipmentCounter;

window.addEventListener('DOMContentLoaded', function() {
  log('load popup');
  chrome.runtime.sendMessage({
    from: 'popup',
    subject: 'track',
    event: 'click_icon'
  });
  chrome.runtime.sendMessage({
    from: 'popup',
    subject: 'getUser'
  }, function(response) {
    if (response.user === void 0) {
      showLoginForm();
    } else {
      showShipmentForm();
    }
  });
  updateShipmentCounter();
  fetchShipmentData();
  $('a.logout').on('click', function(event) {
    event.preventDefault();
    return chrome.storage.local.remove(['user', 'storedShipments'], function() {
      $("section").addClass('hidden');
      return showLoginForm();
    });
  });
  $('a.clear').on('click', function(event) {
    event.preventDefault();
    return chrome.storage.local.remove(['storedShipments'], function() {
      return updateShipmentCounter();
    });
  });
  $('a.settings').on('click', function(event) {
    event.preventDefault();
    hideShipmentForm();
    return showSettings();
  });
  $('section#settings button').on('click', function(event) {
    event.preventDefault();
    return saveSettings();
  });
  $('button.print-labels').on('click', function(event) {
    event.preventDefault();
    pendingShipmentForm();
    chrome.runtime.sendMessage({
      from: 'popup',
      subject: 'printStoredShipments'
    }, function(response) {
      if (response.status === 'ok') {
        chrome.downloads.download({
          url: response.data,
          headers: [{
            name: 'Accept',
            value: 'application/json.file+pdf'
          }]
        }, function() {
          updateShipmentCounter();
          readyShipmentForm();
        });
      }
      readyShipmentForm();
    });
  });
  $('input[name=type]').on('change', function(event) {
    var value;
    value = parseInt($('input[name=type]:checked').val());
    if (value === 2) {
      $('select#cc').val('NL').trigger('change');
      return $('select#cc').attr('disabled', true);
    } else {
      return $('select#cc').attr('disabled', false).trigger('change');
    }
  });
});

login = function() {
  var api_key;
  api_key = $('input#api_key').val();
  chrome.runtime.sendMessage({
    from: 'popup',
    subject: 'loginToApi',
    api_key: api_key,
    email: $('section#login_form input#email').val()
  }, function(response) {
    if (response.status === 'success') {
      hideLoginForm();
      showShipmentForm();
    } else {
      showLoginError();
    }
  });
};

shipmentData = function() {
  var attribute, attributes, output, package_type, recipient, shipment;
  recipient = {};
  if ($("form #cc").val() === "NL") {
    attributes = ['cc', 'company', 'person', 'postal_code', 'number', 'number_suffix', 'street', 'street_additional_info', 'email', 'phone', 'city'];
  } else {
    attributes = ['cc', 'company', 'person', 'postal_code_other', 'street', 'street_additional_info', 'email', 'phone', 'city'];
  }
  output = (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = attributes.length; i < len; i++) {
      attribute = attributes[i];
      results.push(recipient[attribute] = $('form #' + attribute).val());
    }
    return results;
  })();
  if (recipient.postal_code_other) {
    recipient.postal_code = recipient.postal_code_other;
    delete recipient['postal_code_other'];
  }
  package_type = parseInt($('input[name=type]:checked').val());
  shipment = {
    recipient: recipient,
    options: {
      package_type: package_type,
      label_description: $('form #note').val()
    },
    carrier: 1,
    url: $('form #url').val()
  };
  return shipment;
};

postShipment = function() {
  chrome.runtime.sendMessage({
    from: 'popup',
    subject: 'newShipment',
    shipment: shipmentData()
  }, function(response) {
    var field, i, len, ref, message;
    readyShipmentForm();
    if (response.status === 'success') {
      $("div.error-message").addClass("hidden");
      newShipmentCreated();
    } else {
      message = 'Het aanmaken van de zending is niet gelukt, controleer de in het rood gemarkeerde velden.'
      if (typeof(response.errors) === 'undefined') {
        message = 'Jouw API-key is niet ingevoerd. Ga naar de Instellingen in de rechter bovenhoek. '
      }
      $("div.error-message p").html(message).parent().removeClass("hidden");
      ref = response.errors;
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        $("input#" + field).closest("div.form-group").addClass("has-error");
      }
    }
  });
};

newShipmentCreated = function() {
  hideShipmentForm();
  showShipmentSuccess();
  return updateShipmentCounter();
};

showShipmentForm = function() {
  $("section.please-wait").hide();
  $("section#shipment_form").removeClass("hidden");
  $("form select#cc").on("change", function(event) {
    console.log('cc change');
    return updateFormBasedOnCc($("form select#cc").val());
  });
  updateFormBasedOnCc($("form select#cc").val());
  $("body").on("click", "section.no-cd-shipments a.cta", function(event) {
    var data, link;
    track('gotoMyParcelAfterNoCDMessage');
    data = window.btoa(JSON.stringify({
      data: {
        shipments: [shipmentData()]
      }
    }));
    link = "https://backoffice.myparcel.nl/shipmentform?preset=" + data;
    return $(this).attr("href", link);
  });
  $("body").on("click", "section.no-cd-shipments a.cancel", function(event) {
    hideNoCDShipments();
    track('changeCCBecauseNoCDSupported');
    return event.preventDefault();
  });
  $('body').on("click", "input", function(event) {
    return track("change_input", {
      name: $(this).attr('id')
    });
  });
  return $("section#shipment_form button.submit").on("click", function(event) {
    pendingShipmentForm();
    event.preventDefault();
    return postShipment();
  });
};

hideShipmentForm = function() {
  return $("section#shipment_form").addClass("hidden");
};

showLoginForm = function() {
  $("section.no-cd-shipments").hide();
  $("section#login_form").removeClass("hidden");
  return $("section#login_form button.submit").on("click", function(event) {
    event.preventDefault();
    return login();
  });
};

pendingShipmentForm = function() {
  $("section#shipment_success").css("opacity", 0.55);
  $("section#shipment_form form").css("opacity", 0.55);
  return $("section.please-wait").show();
};

readyShipmentForm = function() {
  $("section#shipment_success").css("opacity", 1);
  $("section#shipment_form form").css("opacity", 1);
  return $("section.please-wait").hide();
};

noCDShipments = function() {
  $("section#shipment_form form").css("opacity", 0.55);
  return $("section.no-cd-shipments").show();
};

hideNoCDShipments = function() {
  $("section#shipment_form form").css("opacity", 1);
  return $("section.no-cd-shipments").hide();
};

noMatch = function() {
  $("body").on("click", "section.no-match a.cancel", function(event) {
    track('createManualLabel');
    hideNoMatch();
    return event.preventDefault();
  });
  $("section#shipment_form form").css("opacity", 0.55);
  return $("section.no-match").show();
};

hideNoMatch = function() {
  $("section#shipment_form form").css("opacity", 1);
  return $("section.no-match").hide();
};

hideLoginForm = function() {
  return $("section#login_form").addClass("hidden");
};

showShipmentSuccess = function() {
  return $("section#shipment_success").removeClass("hidden");
};

hideShipmentSuccess = function() {
  return $("section#shipment_success").addClass("hidden");
};

track = function(event, context) {
  if (context == null) {
    context = {};
  }
  return chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    return chrome.tabs.sendMessage(tabs[0].id, {
      from: 'popup',
      subject: 'get_info',
      url: tabs[0].url
    }, function(response) {
      if (response) {
        context.url = response.url;
        context.browser = response.browser;
      }
      return chrome.runtime.sendMessage({
        from: 'popup',
        subject: 'track',
        event: event,
        context: context
      });
    });
  });
};

showSettings = function() {
  track('showSettings');
  return chrome.runtime.sendMessage({
    from: 'popup',
    subject: 'getUser'
  }, function(response) {
    var field, fields, i, j, len, len1;
    fields = ['api_key', 'email'];
    for (i = 0, len = fields.length; i < len; i++) {
      field = fields[i];
      $("section#settings input[name=" + field + "]").val(response.user.user[field]);
    }
    fields = ['format', 'package_type'];
    for (j = 0, len1 = fields.length; j < len1; j++) {
      field = fields[j];
      $("section#settings input[name=" + field + "]").prop("checked", false);
      $("section#settings input[name=" + field + "][value='" + response.user.user[field] + "']").prop('checked', true);
    }
    return $("section#settings").removeClass("hidden");
  });
};

saveSettings = function() {
  var field, fields, i, j, len, len1, msg;
  track('saveSettings');
  fields = ['api_key', 'email'];
  msg = {};
  for (i = 0, len = fields.length; i < len; i++) {
    field = fields[i];
    msg[field] = $("section#settings input[name=" + field + "]").val();
  }
  fields = ['format', 'package_type'];
  for (j = 0, len1 = fields.length; j < len1; j++) {
    field = fields[j];
    msg[field] = $("section#settings input[name=" + field + "]:checked").val();
  }
  msg['from'] = 'popup';
  msg['subject'] = 'loginToApi';
  return chrome.runtime.sendMessage(msg, function(response) {
    var callback;
    $("section#settings").css("opacity", 0.55);
    $("section.please-wait").show();
    if (response.status === 'success') {
      track('saveSettingsSuccess');
      callback = function() {
        hideSettings();
        $("section#settings").css("opacity", 1);
        return showShipmentForm();
      };
      return setTimeout(callback, 1000);
    } else {
      track('saveSettingsError');
      callback = function() {
        return $("section#settings").css("opacity", 1);
      };
      return setTimeout(callback, 1000);
    }
  });
};

hideSettings = function() {
  return $("section#settings").addClass("hidden");
};

updateShipmentCounter = function() {
  return chrome.runtime.sendMessage({
    from: 'popup',
    subject: 'getStoredShipments'
  }, function(response) {
    $('button.print-labels span').text(response.data.length);
  });
};

fetchShipmentData = function() {
  pendingShipmentForm();
  return chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      from: 'popup',
      subject: 'get_address',
      url: tabs[0].url
    }, function(response) {
      readyShipmentForm();
      prefillShipmentData(response);
      return updatePlatformMessage(response);
    });
  });
};

updatePlatformMessage = function(address) {
  if (address) {
    return document.getElementById('matched_platform').innerHTML = address.platform;
  }
};

original_address = {};

prefillShipmentData = function(address) {
  var context;
  if (address !== void 0 && address !== false) {
    context = {
      platform: address.platform || 'unknown',
      url: address.url,
      address: address
    };
    track('prefillShipmentData', context);
    $("select#cc").val(address.cc);
    updateFormBasedOnCc(address.cc);
    $("input#company").val(address.company);
    $("input#person").val(address.person);
    if (address.cc === "NL") {
      $("input#postal_code").val(address.postal_code);
      $("input#number").val(address.number);
      $("input#number_suffix").val(address.number_suffix);
      $("input#street").val(address.street);
      $("input#street_additional_info").val(address.street_additional_info);
    } else {
      $("input#postal_code_other").val(address.postal_code);
      $("input#street").val(address.street + " " + address.number + " " + address.number_suffix);
    }
    $("input#street_additional_info").val(address.street_additional_info);
    $("input#city").val(address.city);
    $("section#shipment_form input#email").val(address.email);
    $("input#phone").val(address.phone);
    $("input#note").val(address.note);
    if (address.url) {
      $("input#url").val(address.url);
    }
    original_address = address;
    noMatch = false;
  } else {
    track('openedWithoutData');
    noMatch = true;
  }
  return chrome.runtime.sendMessage({
    from: 'popup',
    subject: 'getUser'
  }, function(response) {
    if (response && response.user && response.user.user && response.user.user.package_type) {
      if (noMatch === true) {
        noMatch();
      }
      $("section#shipment_form input[name=type").prop("checked", false);
      return $("section#shipment_form input[name=type][value='" + response.user.user.package_type + "']").prop('checked', true);
    }
  });
};

updateFormBasedOnCc = function(cc) {
  if (cc === "NL" || cc === void 0 || cc === null) {
    $("div.form-group.nl").show();
    return $("div.form-group.rest").hide();
  } else {
    if (cc === 'AT' || cc === 'BE' || cc === 'BG' || cc === 'CZ' || cc === 'CY' || cc === 'DK' || cc === 'EE' || cc === 'FI' || cc === 'FR' || cc === 'DE' || cc === 'GB' || cc === 'HU' || cc === 'IE' || cc === 'IT' || cc === 'LV' || cc === 'LT' || cc === 'LU' || cc === 'PL' || cc === 'PT' || cc === 'RO' || cc === 'SK' || cc === 'SI' || cc === 'ES' || cc === 'SE' || cc === 'MC' || cc === 'MT' || cc === 'AL' || cc === 'AD' || cc === 'BA' || cc === 'IC' || cc === 'FO' || cc === 'GI' || cc === 'GR' || cc === 'GL' || cc === 'GG' || cc === 'IS' || cc === 'JE' || cc === 'HR' || cc === 'LI' || cc === 'MK' || cc === 'MD' || cc === 'ME' || cc === 'NO' || cc === 'UA' || cc === 'SM' || cc === 'RS' || cc === 'TR' || cc === 'VA' || cc === 'BY' || cc === 'CH') {
      $("div.form-group.nl").hide();
      return $("div.form-group.rest").show();
    } else {
      return noCDShipments();
    }
  }
};

log = function(message) {
  if (chrome.runtime) {
    return chrome.runtime.sendMessage({
      message: message
    });
  } else {
    return console.log(message);
  }
};
