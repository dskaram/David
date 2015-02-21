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

    defaults: {
      label: "Bookmarks"
    },

    icon: function() {
      return "";
    },

    retrieve: function(filter) {
      var result= $.Deferred();

      chrome.bookmarks.getChildren("0", function() {
        debugger
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
    }

  });
});
