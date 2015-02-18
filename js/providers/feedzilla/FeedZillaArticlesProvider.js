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

  return Provider.extend({

    debounced: function() {
      return true;
    },

    icon: function() {
      return "js/providers/feedzilla/feedzilla.png";
    },

    retrieve: _.memoize(function(filter) {
      var result= $.Deferred();
      var category= this.get("categoryId");
      var fzQuery= !filter ?
                      "//api.feedzilla.com/v1/categories/" + category + "/articles.json" :
                      "//api.feedzilla.com/v1/categories/" + category + "/articles/search.json?q=" + filter;

      $.get(fzQuery,function(j) {},'jsonp')
        .done(function(response) {
          result.resolve(new Backbone.Collection(
                              _.map(response.articles, function(result) {
                                return new ProviderEntry({
                                  label: result.title,
                                  url: result.url
                                });
                              })
                            )
                          );
            })
          .fail(result.reject);

      return result;
    }, function(filter) {
      return this.get("categoryId") + ":" + filter;
    })

  });
});
