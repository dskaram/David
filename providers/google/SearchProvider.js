define([
  "jquery",
  "underscore",
  "providers/Provider",
  "providers/ProviderEntry"
], function(
  $,
  _,
  Provider,
  ProviderEntry
) {

  var DEFAULT_SEARCH= "https://www.google.com/search?q=";

  var SearchProvider= Provider.extend({});

  SearchProvider.entry= function(filter) {
    return new ProviderEntry({
          label: "Search for \"" + filter + "\"",
          url: DEFAULT_SEARCH + filter
      });
  };

  return SearchProvider;
});
