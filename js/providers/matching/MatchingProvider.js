define([
  "underscore",
  "backbone",
  "providers/Provider"
], function(
  _,
  Backbone,
  Provider
) {

  var MatchingProvider= Provider.extend({

    initialize: function(model, path) {
      Provider.prototype.initialize.apply(this, arguments);

      this._providers= new Backbone.Collection();
    },

    matches: function(filter) {
      return this._providers.filter(function(provider) {
        return provider.accepts(filter);
      });
    },

    adapter: function() {
      return _.bind(function(filter) {
        return this.matches(filter)[0].adapter()(filter);
      }, this);
    },

    add: function(provider) {
      this._providers.add(provider);
      return this;
    },

    debounced: function() {
      return this._providers.any(function(provider) { return provider.debounced() });
    },

    icon: function(filter) {
      return this.matches(filter)[0].icon();
    },

    retrieve: function(filter) {
      return this.matches(filter)[0].retrieve(filter);
    }
  });

  return MatchingProvider;
});
