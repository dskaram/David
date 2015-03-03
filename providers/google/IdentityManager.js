define([
  "jquery",
  "underscore"
  ],function(
  $,
  _
) {

  var IdentityManager= function() {};
  var port = chrome.runtime.connect({ name: "identity-channel" });
  var pendingRequests= {};
  port.onMessage.addListener(function(resp) {
    var pendingRequest= pendingRequests[resp.reqId];
    pendingRequest.deferred.resolve(resp[pendingRequest.respKey]);
    delete pendingRequests[resp.reqId];
  });


  var AUTH_TOKEN_COMPOSE_MAIL= "auth-token-compose-mail";
  IdentityManager.prototype.mail= {
    compose: function() {
      var result= $.Deferred();
      var requestId= _.uniqueId(AUTH_TOKEN_COMPOSE_MAIL);
      pendingRequests[requestId]= {
        respKey: "token",
        deferred: result
      };

      port.postMessage({
        reqId: requestId,
        reqType: AUTH_TOKEN_COMPOSE_MAIL
      });

      result.done(function(token) {
        if (token.token) {
          gapi.auth.setToken({
            access_token: token.token,
            state: token.scope.join(" ")
          });
        }
      });

      return result.promise();
    }
  };

  var AUTH_TOKEN_CONTACTS_SEARCH= "auth-token-contacts-search";
  IdentityManager.prototype.contacts= {
    search: function(searchTerm) {
      var result= $.Deferred();
      var requestId= _.uniqueId(AUTH_TOKEN_CONTACTS_SEARCH);
      pendingRequests[requestId]= {
        respKey: "token",
        deferred: result
      };

      port.postMessage({
        reqId: requestId,
        searchTerm: searchTerm,
        reqType: AUTH_TOKEN_CONTACTS_SEARCH
      });

      return result.promise();
    }
  };

  return IdentityManager;
});
