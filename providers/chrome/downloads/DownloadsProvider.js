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

  var DownloadEntry= ProviderEntry.extend({

    initialize: function(attrs, wrapper) {
      ProviderEntry.prototype.initialize.apply(this, arguments);
      this._wrapper= wrapper;
    },

    execute: function() {
      return this._wrapper.downloads.open(this.get("id"));
    }
  });


  var BookmarksProvider= Provider.extend({

    defaults: {
      label: "Downloads"
    },

    initialize: function(wrapper) {
      this._wrapper= wrapper;
    },

    icon: function() {
      return "";
    },

    retrieve: function(filter) {
      var result= $.Deferred();
      var self= this;

      this._wrapper.downloads.search({
        query: [ filter ],
        exists: true
      })
      .done(function(downloads) {
        result.resolve(new Backbone.Collection(
                              downloads
                                .filter(function(download) { return !download.error; })
                                .map(function(download) {
                                  var label= download.filename.split("/");
                                  return new DownloadEntry({
                                    id: download.id,
                                    label: label[label.length - 1],
                                    url: download.filename
                                  }, self._wrapper);
                                })
                            ));
      })
      .fail(result.reject);

      return result;
    }
  });

  return BookmarksProvider;
});
