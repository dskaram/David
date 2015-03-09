define([
  "jquery",
  "underscore",
  "backbone",
  "providers/Provider",
  "providers/ProviderEntry",
  chrome.extension.getURL("/providers/google") + "/IdentityManager.js",
], function(
  $,
  _,
  Backbone,
  Provider,
  ProviderEntry,
  IdentityManager
) {

  var SharePageEntry= ProviderEntry.extend({

    initialize: function(attrs, wrapper) {
      ProviderEntry.prototype.initialize.apply(this, arguments);
      this._wrapper= wrapper;
    },

    execute: function() {
      var result= $.Deferred();
      var to= IdentityManager.session.userEmail;
      var note= this.get("note");

      this._wrapper.mail.send(to, note, note)
      .done(function() {
        result.resolve();
      }).fail(result.reject);

      return result.promise();
    }
  });


  return Provider.extend({

    initialize: function(attrs, wrapper) {
      Provider.prototype.initialize.apply(this, arguments);
      this._wrapper= wrapper;
    },

    retrieve: function(filter) {
      return $.Deferred().resolve(new Backbone.Collection([
        new SharePageEntry({
          label: "Note to self: " + filter,
          note: filter
        }, this._wrapper)
      ])).promise();
    }
  });
});
