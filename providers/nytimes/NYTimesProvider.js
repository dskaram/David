define([
  "underscore",
  "backbone",
  "providers/Provider",
	"providers/ProviderEntry",
  chrome.extension.getURL("/providers/importio") + "/ImportIOProvider.js",
], function(
  _,
  Backbone,
  Provider,
	ProviderEntry,
  ImportIOProvider
) {

  var ACTIVATOR= "nyt ";
  var ADAPTER= function(filter) {
    return filter.substring(ACTIVATOR.length);
  };

  return ImportIOProvider.extend({

    feed: function() {
      return "https://api.import.io/store/data/c71652fa-419f-4741-ac7b-ca5b9f2b7162/_query?input/webpage/url=http%3A%2F%2Fwww.nytimes.com%2F&_user=ff23be13-95ef-41f9-91c5-a19320a8ca52"
    },

    entries: function(response) {
      return response.results
                .filter(function(result) { return result.heading; })
                .map(function(result) {
                  return new ProviderEntry({
                    label: result.heading,
                    url: result.url.length ? result.url[0] : result.url,
                    imgUrl: result.img
                  });
                });
    },

    adapter: function() {
      return ADAPTER;
    },

    accepts: function(filter) {
      return filter.indexOf(ACTIVATOR) === 0;
    },

    icon: function() {
      return "providers/nytimes/nyt.png";
    }

  });
});
