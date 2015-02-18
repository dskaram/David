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

  var ACTIVATOR= "nyt ";
  var ADAPTER= function(filter) {
    return filter.substring(ACTIVATOR.length);
  };

  var API_KEY= "9291baaa0739ee49a814e81549255348:13:65897916";

  return Provider.extend({

    debounced: function() {
      return true;
    },

    adapter: function() {
      return ADAPTER;
    },

    accepts: function(filter) {
      return filter.indexOf(ACTIVATOR) === 0;
    },

    icon: function() {
      return "js/providers/nytimes/nyt.png";
    },

    retrieve: _.memoize(function(filter) {
      filter= ADAPTER(filter);
      var result= $.Deferred();

      var nytQuery= "//api.nytimes.com/svc/search/v2/articlesearch.json?&sort=newest&api-key=" + API_KEY;

      if (filter) {
        nytQuery+= "&q=" + filter;
      }


      $.get(nytQuery,function(j) {},'json')
        .done(function(response) {
          result.resolve(new Backbone.Collection(
                              _.map(response.response.docs, function(result) {
                                return new ProviderEntry({
                                  label: result.headline.main,
                                  url: result.web_url
                                });
                              })
                            )
                          );
            });

      return result;
    })

  });
});
