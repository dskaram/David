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

  var SharePageEntry= ProviderEntry.extend({

    execute: function() {
      var gmailApi= $.Deferred();
      gapi.client.load('gmail', 'v1').then(gmailApi.resolve);

      $.when(identityManager.mail.compose(), gmailApi)
        .done(function(token) {
          debugger
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
      return $.Deferred().resolve(new Backbone.Collection([
          new SharePageEntry({
            label: "Share this page" + (target ? " with " + target : ""),
            url: "mailto:" + target + "?subject=" + subject() + "&body=" + body()
          })
        ])).promise();
    }
  });
});
