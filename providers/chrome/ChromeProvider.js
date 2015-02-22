define([
  "underscore",
  "backbone",
  "providers/Provider",
  chrome.extension.getURL("/providers") + "/chrome/ChromeWrapper.js",
  chrome.extension.getURL("/providers") + "/chrome/bookmarks/BookmarksProvider.js",
  chrome.extension.getURL("/providers") + "/chrome/history/HistoryProvider.js",
  chrome.extension.getURL("/providers") + "/chrome/downloads/DownloadsProvider.js"
], function(
  _,
  Backbone,
  Provider,
  ChromeWrapper,
  BookmarksProvider,
  HistoryProvider,
  DownloadsProvider
) {

  return Provider.extend({

    initialize: function() {
      this._wrapper= new ChromeWrapper();
    },

    icon: function() {
      return "";
    },

    accepts: function() {
      return true;
    },

    retrieve: function(filter) {
      return $.Deferred()
                .resolve(new Backbone.Collection([
                    new BookmarksProvider({}, { wrapper: this._wrapper }),
                    new HistoryProvider(this._wrapper),
                    new DownloadsProvider(this._wrapper)
                  ]));
    }
  });
});
