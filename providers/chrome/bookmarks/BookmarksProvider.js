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

    debounced: function() {
      return true;
    },

    icon: function() {
      return "";
    },

    adapt: function(bookmarks) {
      return bookmarks.map(function(bookmark) {
        return bookmark.url ?
                    new ProviderEntry({ label: bookmark.title, url: bookmark.url }) :
                    new BookmarksProvider({ label: bookmark.title, parentId: bookmark.parentId },
                                          { id: bookmark.id, wrapper: this._wrapper }
                                         );
      }, this);
    },

    retrieve: function(filter) {
      var result= $.Deferred();
      var self= this;

      var bookmarksPromise= filter ?
                              this._wrapper.bookmarks.search(filter) :
                              this._wrapper.bookmarks.children(this._id);

      bookmarksPromise
        .done(function(bookmarks) {
          result.resolve(new Backbone.Collection(self.adapt(bookmarks)));
        })
        .fail(result.reject);

      return result;
    }
  });

  return BookmarksProvider;
});
