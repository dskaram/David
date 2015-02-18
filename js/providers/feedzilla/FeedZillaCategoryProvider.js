define([
  "underscore",
  "backbone",
  "providers/Provider",
	"providers/ProviderEntry",
  "providers/feedzilla/FeedZillaArticlesProvider"
], function(
  _,
  Backbone,
  Provider,
	ProviderEntry,
  FeedZillaArticlesProvider
) {

  var ACTIVATOR= "fz ";
  var ADAPTER= function(filter) {
    return filter.substring(ACTIVATOR.length);
  };

  var categories= _.memoize(function() {
    var result= $.Deferred();
    var fzQuery= "//api.feedzilla.com/v1/categories.json";
    $.get(fzQuery,function(j) {},'jsonp')
      .done(function(response) {
        result.resolve(new Backbone.Collection(
                            response
                              .map(function(result) {
                                return new FeedZillaArticlesProvider({
                                  label: result.display_category_name || result.english_category_name,
                                  categoryId: result.category_id
                                })
                              })
                          ));

      })
      .fail(result.reject);

    return result;
  });

  return Provider.extend({

    adapter: function() {
      return ADAPTER;
    },

    accepts: function(filter) {
      return filter.indexOf(ACTIVATOR) === 0;
    },

    icon: function() {
      return "js/providers/feedzilla/feedzilla.png";
    },

    retrieve: function(filter) {
      filter= ADAPTER(filter);
      var result= $.Deferred();
      categories(ACTIVATOR)
        .done(function(allCategories) {
          result.resolve(new Backbone.Collection(
                              allCategories
                                .filter(function(result) {
                                  return result.get("label").toLowerCase().indexOf(filter.toLowerCase()) !== -1;
                                })
                            )
                          );
        })
        .fail(result.reject);

      return result;
    }

  });
});
