var log;

log = function(message) {
  chrome.runtime.sendMessage({
    message: message
  });
};

chrome.runtime.onMessage.addListener(function(msg, sender, response) {
  var matcher;
  matcher = new Matcher(window.location.href);
  if (msg.from === 'popup' && msg.subject === 'get_address') {
    matcher.source.address(function(address) {
      return response(address);
    });
  }
  if (msg.from === 'popup' && msg.subject === 'get_info') {
    return response({
      url: window.location.href,
      browser: navigator.userAgent
    });
  }
});
