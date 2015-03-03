define([
  "jquery",
  "underscore",
  chrome.extension.getURL("/providers/google") + "/IdentityManager.js",
  ], function(
    $,
    _,
    IdentityManager
  ) {

    var identityManager= new IdentityManager();
    var ApiWrapper= function() {};

    var asRfc= function(to, subject, body) {
      var email = [];
      email.push("From: \"David Karam\" <dskaram@gmail.com>");
      email.push("To: " + to);
      email.push('Content-type: text/html;charset=iso-8859-1');
      email.push('MIME-Version: 1.0');
      email.push("Subject: " + subject);
      email.push("");
      email.push(body);

      var base64EncodedEmail= btoa(email.join("\r\n").trim());
      return base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');
    }

    gapiloaded= function() {
      gapi.client.setApiKey('AIzaSyCy2e9oyRTMHqLZPyDwGosdJa65mAK2Cnk');
    };

    _.extend(ApiWrapper.prototype, {
      load: function() {
        if (typeof gapi !== 'undefined') {
          return gapiloaded();
        }

        var self = this;
        require(['https://apis.google.com/js/client.js?onload=gapiloaded'], function() {});
      },

      url: {
        shorten: function(longUrl) {
          var result= $.Deferred();

          gapi.client.load('urlshortener', 'v1').then(function() {
            gapi.client.urlshortener.url.insert({
              longUrl: longUrl
            })
            .then(function(response) {
              result.resolve(response.result.id);
            }, result.reject);
          });

          return result.promise();
        }
      },

      contacts: {
        search: function(searchTerm) {
          var result= $.Deferred();

          identityManager.contacts.search()
            .done(function(tokenContacts) {
              $.getJSON('https://www.google.com/m8/feeds/contacts/default/full/?access_token=' + tokenContacts.token + "&v=3.0&alt=json&q=" + searchTerm + "&callback=?")
                .done(function(response){
                    result.resolve(response.feed.entry);
                });
            });

          return result.promise();
        }
      },

      mail: {
        send: function(to, subject, body) {
          var result= $.Deferred();

          var gmailApi= $.Deferred();
          gapi.client.load('gmail', 'v1').then(gmailApi.resolve);

          $.when(identityManager.mail.compose(), gmailApi)
            .done(function(tokenMail) {
              if (tokenMail.token) {
                var requestEmail = gapi.client.gmail.users.messages.send({
                    userId: "me",
                    resource: {
                        raw: asRfc(to, subject, body)
                    }
                });
                requestEmail.then(function() {
                  result.resolve();
                });
              } else {
                result.reject("Did not receive mail token");
              }
            })
            .fail(result.reject);

          return result.promise();
        }
      }
    });

    return ApiWrapper;
});
