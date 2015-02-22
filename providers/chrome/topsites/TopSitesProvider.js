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

  var match= function(filter, topSite) {
    filter= filter.toLowerCase();
    return topSite.title.toLowerCase().indexOf(filter) !== -1  || topSite.url.toLowerCase().indexOf(filter) !== -1;
  }

  return Provider.extend({

    defaults: {
      label: "Top Sites"
    },

    initialize: function(wrapper) {
      this._wrapper= wrapper;
    },

    icon: function() {
      return "";
    },

    retrieve: function(filter) {
      var result= $.Deferred();

      this._wrapper.topSites.get()
      .done(function(topSites) {
        result.resolve(new Backbone.Collection(
                              topSites
                                .filter(function(topSite) {
                                  return match(filter, topSite);
                                })
                                .map(function(entry) {
                                  return new ProviderEntry({
                                    label: entry.title,
                                    url: entry.url
                                  });
                                })
                            ));
      })
      .fail(result.reject);

      return result;
    }
  });
});
