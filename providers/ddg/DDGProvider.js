define([
  "underscore",
  "backbone",
  chrome.extension.getURL("/providers") + "/google/SearchProvider.js",
  chrome.extension.getURL("/providers") + "/ddg/DDGCategoryProvider.js",
  "providers/Provider",
	"providers/ProviderEntry"
], function(
  _,
  Backbone,
  SearchProvider,
  DDGCategoryProvider,
  Provider,
	ProviderEntry
) {

  var directResults= function(response) {
    var results= _.filter(response, function(entry) {
      return entry.Text;
    });

    return _.map(results, function(result) {
      return new ProviderEntry({
        label: result.Text,
        imgUrl: result.Icon.URL,
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

    activator: "? ",

    debounced: function() {
      return true;
    },

    icon: function() {
      return "providers/ddg/duckduckgo.png";
    },

    retrieve: _.memoize(function(filter) {
      filter= this.adapter()(filter);
      var result= $.Deferred();

      if (!filter) {
        return result.resolve(new Backbone.Collection());
      }

      var ddgQuery= "https://api.duckduckgo.com/?q=" + filter + "&format=json";

      $.get(ddgQuery,function(j) {},'json')
        .done(function(response) {
          var answerLabel= response.Abstract || response.Heading;
          var first= answerLabel ?
                        new ProviderEntry({
                          label: answerLabel,
                          url: response.AbstractURL,
                          imgUrl: response.Image
                        }) :
                        SearchProvider.entry(filter);

          response= response.RelatedTopics;
          var direct= directResults(response);
          var groups= groupedResults(response);

          result.resolve(new Backbone.Collection([first].concat(direct.concat(groups))));
        });

      return result;
    })

  });
});
