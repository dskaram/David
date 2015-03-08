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

  var PHOTO_REL= "http://schemas.google.com/contacts/2008/rel#photo";
  var UNKNOWN_AVATAR=   chrome.extension.getURL("/providers/page") + "/unknown.png";

  var adaptContacts= function(entries, tokenContacts, wrapper) {
    return entries
          .filter(function(entry) {
            return entry.gd$name && entry.gd$email;
          })
          .map(function(entry) {
            var fullName= entry.gd$name.gd$fullName.$t;
            var email= entry.gd$email.filter(function(email) { return email.primary === "true" });
            var imgLink= entry.link.filter(function(link) { return link.gd$etag && link.rel === PHOTO_REL; });
            var imgUrl= imgLink.length > 0 ? imgLink[0].href + "&access_token=" +tokenContacts : UNKNOWN_AVATAR;
            email= (email.length > 0 ? email[0] : entry.gd$email[0]).address;

            return new SharePageEntry({
              to: email,
              imgUrl: imgUrl,
              label: "Share with " + fullName + " (" + email + ")"
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

    activator: "> ",

    initialize: function(wrapper) {
      Provider.prototype.initialize.apply(this, arguments);

      this._wrapper= wrapper;
    },

    retrieve: function(filter) {
      filter= this.adapter()(filter) || "";
      var result= $.Deferred();
      var wrapper= this._wrapper;

      wrapper.contacts.search(filter)
      .done(function(results, tokenContacts) {
        result.resolve(new Backbone.Collection(adaptContacts(results, tokenContacts, wrapper)));
      });

      return result.promise();
    }
  });
});
