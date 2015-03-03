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
  var ACTIVATOR= "> ";
  var ADAPTER= function(filter) {
    return filter.substring(ACTIVATOR.length);
  };

  var adaptContacts= function(entries) {
    return entries
            .filter(function(entry) {
              return entry.gd$name && entry.gd$email;
            })
            .map(function(entry) {
              var fullName= entry.gd$name.gd$fullName.$t;
              var email= entry.gd$email.filter(function(email) { return email.primary === "true" });
              email= (email.length > 0 ? email[0] : entry.gd$email[0]).address;

              return new SharePageEntry({
                to: email,
                label: "Share with " + fullName + "(" + email + ")",
                url: "mailto:" + email + "?subject=" + subject() + "&body=" + body()
              })
            });
  };

  var body= function() {
    return "Check out this page: " + document.title + ": " + document.URL;
  }

  var subject= function() {
    return document.title || "This looks interesting!";
  }

  var asRfc= function(to) {
    var email = [];
    email.push("From: \"David Karam\" <dskaram@gmail.com>");
    email.push("To: " + to);
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
      var to= this.get("to");
      gapi.client.load('gmail', 'v1').then(gmailApi.resolve);

      $.when(identityManager.mail.compose(), gmailApi)
        .done(function(tokenMail ,tokenContacts) {
          if (tokenMail.token) {
            var requestEmail = gapi.client.gmail.users.messages.send({
                userId: "me",
                resource: {
                    raw: asRfc(to)
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
      filter= this.adapter()(filter) || "";
      var result= $.Deferred();

      identityManager.contacts.search().done(function(tokenContacts) {
        $.getJSON('https://www.google.com/m8/feeds/contacts/default/full/?access_token=' +
        tokenContacts.token + "&v=3.0&alt=json&q=" + filter + "&callback=?", function(response){
            result.resolve(new Backbone.Collection(adaptContacts(response.feed.entry)));
        });
      });

      return result.promise();
    }
  });
});
