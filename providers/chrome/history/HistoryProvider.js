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
      label: "History"
    },

    initialize: function(wrapper) {
      this._wrapper= wrapper;
    },

    debounced: function() {
      return true;
    },

    icon: function() {
      return "";
    },

    retrieve: function(filter) {
      var result= $.Deferred();

      this._wrapper.history.search({
        text: filter
      })
      .done(function(historyEntries) {
        result.resolve(new Backbone.Collection(
                              historyEntries
                                .filter(function(entry) { return entry.title || entry.url })
                                .map(function(entry) {
                                  return new ProviderEntry({
                                    label: entry.title || entry.url,
                                    url: entry.url || ""
                                  });
                                })
                            ));
      })
      .fail(result.reject);

      return result;
    }
  });
});
