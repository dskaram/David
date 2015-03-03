define([
  "underscore",
  "backbone",
  "providers/Provider",
  "providers/ProviderEntry",
  chrome.extension.getURL("/providers/google") + "/IdentityManager.js",
], function(
  _,
  Backbone,
  Provider,
  ProviderEntry,
  IdentityManager
) {

  var identityManager= new IdentityManager();
  var ACTIVATOR= "-> ";
  var ADAPTER= function(filter) {
    return filter.substring(ACTIVATOR.length);
  };

  var body= function() {
    return "Check out this page: " + document.title + ": " + document.URL;
  }

  var subject= function() {
    return document.title || "This looks interesting!";
  }

  var asRfc= function() {
    var email = [];
    email.push("From: \"David Karam\" <dskaram@gmail.com>");
    email.push("To: dskaram@gmail.com");
    email.push('Content-type: text/html;charset=iso-8859-1');
    email.push('MIME-Version: 1.0');
    email.push("Subject: " + subject());
    email.push("");
    email.push(body());

    var base64EncodedEmail= btoa(email.join("\r\n").trim());
    return base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');
  }

  var SharePageEntry= ProviderEntry.extend({

    execute: function() {
      var self= this;
      var gmailApi= $.Deferred();
      var target= this.get("target");
      gapi.client.load('gmail', 'v1').then(gmailApi.resolve);

      $.when(identityManager.mail.compose(), gmailApi)
        .done(function(tokenMail ,tokenContacts) {
          if (tokenMail.token) {
            var requestEmail = gapi.client.gmail.users.messages.send({
                userId: "me",
                resource: {
                    raw: asRfc()
                }
            });
            requestEmail.then(function() {
              // mail delivered - some useful user feedback here
            });
          } else {
            ProviderEntry.prototype.execute.apply(self);
          }
        });
    }
  });


  return Provider.extend({

    adapter: function() {
      return ADAPTER;
    },

    accepts: function(filter) {
      return filter.indexOf(ACTIVATOR) === 0;
    },

    retrieve: function(filter) {
      var target= this.adapter()(filter) || "";
      var result= $.Deferred();

      identityManager.contacts.search().done(function(tokenContacts) {
        $.getJSON('https://www.google.com/m8/feeds/contacts/default/full/?access_token=' +
        tokenContacts.token + "&v=3.0&alt=json&q=" + target + "&callback=?", function(result){
            // contacts here
        });
      });

      return $.Deferred().resolve(new Backbone.Collection([
          new SharePageEntry({
            label: "Share this page" + (target ? " with " + target : ""),
            url: "mailto:" + target + "?subject=" + subject() + "&body=" + body()
          })
        ])).promise();
    }
  });
});
