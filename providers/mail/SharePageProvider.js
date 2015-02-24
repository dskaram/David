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
          new ProviderEntry({
            label: "Share this page" + (target ? " with " + target : ""),
            url: "mailto:" + target + "?subject=" + subject() + "&body=" + body()
          })
        ])).promise();
    }
  });
});
