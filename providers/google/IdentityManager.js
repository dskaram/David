define([
  "jquery",
  "underscore"
  ],function(
  $,
  _
) {

  var IdentityManager= function() {};
  var port = chrome.runtime.connect({ name: "identity-channel" });
  port.onMessage.addListener(function(token) {
    gapi.auth.setToken({
      access_token: token.token,
      state: token.scope.join(" ")
    });
  });

  IdentityManager.prototype.load= function() {
    port.postMessage({});
  }

  return IdentityManager;
});
