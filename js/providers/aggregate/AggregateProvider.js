define([
  "underscore",
  "backbone",
  "providers/Provider"
], function(
  _,
  Backbone,
  Provider
) {

  var AggregateProvider= Provider.extend({

    initialize: function() {
      Provider.prototype.initialize.apply(this, arguments);

      this._providers= new Backbone.Collection();
    },

    add: function(provider) {
      this._providers.add(provider);
      return this;
    },

    debounced: function() {
      return this._providers.any(function(provider) { return provider.debounced(); });
    },

    retrieve: function(filter) {
      var result= $.Deferred();
      // $.when expects separate arguments
      $.when.apply($, this._providers.map(function(provider) { return provider.retrieve(filter); }))
        .done(function() {
          var entries= new Backbone.Collection();

          var providerResults= Array.prototype.slice.call(arguments);
          providerResults.forEach(function(providerResult) {
            entries.add(providerResult.models);
          });

          result.resolve(entries);
        })
        .fail(result.reject);

      return result;
    }
  });

  return AggregateProvider;
});
