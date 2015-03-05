define([
  "underscore",
  "backbone",
  "providers/Provider",
  "providers/ProviderEntry"
], function(
  _,
  Backbone,
  Provider,
  ProviderEntry
) {

  var ACTIVATOR= "> ";
  var ADAPTER= function(filter) {
    return filter.substring(ACTIVATOR.length);
  };

  var adaptContacts= function(entries, wrapper) {
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
              label: "Share with " + fullName + "(" + email + ")"
            }, wrapper)
          });
  };

  var body= function(url) {
    return "Check out this page: " + document.title + ": " + url;
  }

  var subject= function() {
    return document.title || "This looks interesting!";
  }

  var SharePageEntry= ProviderEntry.extend({

    initialize: function(attrs, wrapper) {
      ProviderEntry.prototype.initialize.apply(this, arguments);

      this._wrapper= wrapper;
    },

    execute: function() {
      var self= this;
      var to= this.get("to");
      var wrapper= this._wrapper;

      this._wrapper.url.shorten(document.URL)
      .done(function(shortUrl) {
        wrapper.mail.send(to, subject(), body(shortUrl))
        .done(function() {
          console.log("sent user email");
        });
      });
    }
  });


  return Provider.extend({

    initialize: function(wrapper) {
      Provider.prototype.initialize.apply(this, arguments);

      this._wrapper= wrapper;
    },

    adapter: function() {
      return ADAPTER;
    },

    accepts: function(filter) {
      return filter.indexOf(ACTIVATOR) === 0;
    },

    retrieve: function(filter) {
      filter= this.adapter()(filter) || "";
      var result= $.Deferred();
      var wrapper= this._wrapper;

      wrapper.contacts.search(filter)
      .done(function(results) {
        result.resolve(new Backbone.Collection(adaptContacts(results, wrapper)));
      });

      return result.promise();
    }
  });
});
