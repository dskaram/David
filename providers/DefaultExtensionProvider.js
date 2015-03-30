define([
  "underscore",
  "backbone",
  "providers/Provider",
  "providers/ProviderEntry",
  "providers/aggregate/AggregateProvider",
  chrome.extension.getURL("/providers") + "/google/SearchProvider.js",
  chrome.extension.getURL("/providers") + "/google/EmailProvider.js",
  chrome.extension.getURL("/providers") + "/nytimes/NYTimesProvider.js",
  chrome.extension.getURL("/providers") + "/todo/NoteToSelfProvider.js",
  chrome.extension.getURL("/providers") + "/chrome/ChromeWrapper.js",
  chrome.extension.getURL("/providers") + "/chrome/bookmarks/BookmarksProvider.js",
  chrome.extension.getURL("/providers") + "/chrome/history/HistoryProvider.js",
  chrome.extension.getURL("/providers") + "/chrome/topsites/TopSitesProvider.js",
  chrome.extension.getURL("/providers") + "/chrome/downloads/DownloadsProvider.js"
], function(
  _,
  Backbone,
  Provider,
  ProviderEntry,
  AggregateProvider,
  SearchProvider,
  EmailProvider,
  NYTimesProvider,
  NoteToSelfProvider,
  ChromeWrapper,
  BookmarksProvider,
  HistoryProvider,
  TopSitesProvider,
  DownloadsProvider
) {

  return Provider.extend({

    initialize: function(apiWrapper) {
      var chromeWrapper= new ChromeWrapper();
      this._chromeProviders= [
          new BookmarksProvider({}, { wrapper: chromeWrapper }),
          new HistoryProvider(chromeWrapper),
          new TopSitesProvider(chromeWrapper),
          new DownloadsProvider(chromeWrapper)
      ];

      this._defaultProvider= new AggregateProvider()
                                      .add(new EmailProvider())
                                      .add(new NYTimesProvider());

      this._aggregateProvider= new AggregateProvider()
                                      .add(new SearchProvider())
                                      .add(new NoteToSelfProvider({}, apiWrapper))
                                      .add(this._chromeProviders);
    },

    icon: function() {
      return "";
    },

    accepts: function() {
      return true;
    },

    retrieve: function(filter) {
          return filter ?
                  this._aggregateProvider.retrieve(filter) :
                  this._defaultProvider.retrieve(filter);
    }
  });
});
