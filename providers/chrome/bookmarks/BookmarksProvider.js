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

  var BookmarksProvider= Provider.extend({

    defaults: {
      label: "Bookmarks"
    },

    initialize: function(attrs, opts) {
      this._id= opts.id || "0";
      this._wrapper= opts.wrapper;
    },

    icon: function() {
      return "";
    },

    retrieve: function(filter) {
      var result= $.Deferred();
      var wrapper= this._wrapper;

      this._wrapper.bookmarks(this._id)
                  .done(function(bookmarks) {
                    var mapped= bookmarks.map(function(bookmark) {
                      return bookmark.url ?
                                  new ProviderEntry({ label: bookmark.title, url: bookmark.url }) :
                                  new BookmarksProvider({ label: bookmark.title, parentId: bookmark.parentId },
                                                        { id: bookmark.id, wrapper: wrapper }
                                                       );
                    });
                    result.resolve(new Backbone.Collection(mapped));
                  })
                  .fail(result.reject);

      return result;
    }
  });

  return BookmarksProvider;
});
