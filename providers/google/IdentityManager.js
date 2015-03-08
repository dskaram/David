define([
  "jquery",
  "underscore"
  ],function(
  $,
  _
) {

  var IdentityManager= function() {};
  var port = chrome.runtime.connect({ name: "identity-channel" });
  port.onMessage.addListener(function(identity) {
    IdentityManager.session= identity;

    gapi.auth.setToken({
      access_token: identity.token,
      state: identity.scope.join(" ")
    });
  });

  IdentityManager.prototype.load= function() {
    port.postMessage({});
  }

  return IdentityManager;
});
