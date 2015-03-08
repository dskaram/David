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

  var API_KEY= encodeURIComponent("nrPriitZJYEuyXma83sq5dkO+RHFWmFQhkBwgRh2h6xk16KSEyjjcJXMp/8brcNEeuWS+1Sn5tP9SqN478rxAA==");

  return Provider.extend({

    adapter: function() {
      return _.identity;
    },

    debounced: function() {
      return true;
    },

    entries: function(data) {
      throw new Error("Must be implemented by subclasses.");
    },

    feed: function() {
      throw new Error("Must be implemented by subclasses.");
    },

    retrieve: _.memoize(function(filter) {
      filter= this.adapter()(filter);

      var result= $.Deferred();
      var self= this;
      var query= this.feed() + "&_apikey=" + API_KEY;

      $.get(query, function(j) {},'json')
        .done(function(response) {
          result.resolve(new Backbone.Collection(self.entries(response)));
        });

      return result.promise();
    })

  });
});
