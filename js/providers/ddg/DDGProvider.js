define([
  "underscore",
  "backbone",
  "providers/ddg/DDGCategoryProvider",
  "providers/Provider",
	"providers/ProviderEntry"
], function(
  _,
  Backbone,
  DDGCategoryProvider,
  Provider,
	ProviderEntry
) {

  var ACTIVATOR= "? ";
  var ADAPTER= function(filter) {
    return filter.substring(ACTIVATOR.length);
  };

  var directResults= function(response) {
    var results= _.filter(response, function(entry) {
      return entry.Text;
    });

    return _.map(results, function(result) {
      return new ProviderEntry({
        label: result.Text,
        url: result.FirstURL
      });
    });
  };

  var groupedResults= function(response) {
    var results= _.filter(response, function(entry) {
      return entry.Name;
    });

    return _.map(results, function(result) {
      return new DDGCategoryProvider({ label: result.Name }, result.Topics);
    });
  };

  return Provider.extend({

    debounced: function() {
      return true;
    },

    adapter: function() {
      return ADAPTER;
    },

    icon: function() {
      return "js/providers/ddg/duckduckgo.png";
    },

    accepts: function(filter) {
      return filter.indexOf(ACTIVATOR) === 0;
    },

    retrieve: _.memoize(function(filter) {
      filter= ADAPTER(filter);
      var result= $.Deferred();

      if (!filter) {
        return result.resolve(new Backbone.Collection());
      }

      var ddgQuery= "//api.duckduckgo.com/?q=" + filter + "&format=json";

      $.get(ddgQuery,function(j) {},'jsonp')
        .done(function(response) {
          response= response.RelatedTopics;
          var direct= directResults(response);
          var groups= groupedResults(response);

          result.resolve(new Backbone.Collection(direct.concat(groups)));
        });

      return result;
    })

  });
});
