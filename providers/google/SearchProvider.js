define([
  "jquery",
  "underscore",
  "backbone",
  "providers/Provider",
  "providers/ProviderEntry"
], function(
  $,
  _,
  Backbone,
  Provider,
  ProviderEntry
) {

  var DEFAULT_SEARCH= "https://www.google.com/search?q=";

  var SearchProvider= Provider.extend({
    retrieve: function(filter) {
      return $.Deferred().resolve(new Backbone.Collection([ SearchProvider.entry(filter) ])).promise();
    }
  });

  SearchProvider.entry= function(filter) {
    return new ProviderEntry({
          label: "Search for \"" + filter + "\"",
          url: DEFAULT_SEARCH + filter
      });
  };

  return SearchProvider;
});
