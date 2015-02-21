define([
  "underscore",
  "backbone",
  "providers/Provider",
  chrome.extension.getURL("/providers") + "/chrome/BookmarksProvider.js"
], function(
  _,
  Backbone,
  Provider,
  BookmarksProvider
) {

  return Provider.extend({

    icon: function() {
      return "";
    },

    accepts: function() {
      return true;
    },

    retrieve: function(filter) {
      return $.Deferred()
                .resolve(new Backbone.Collection([
                    new BookmarksProvider()
                  ]));
    }
  });
});
