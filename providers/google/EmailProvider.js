define([
  "underscore",
  "backbone",
  "providers/Provider",
  "providers/ProviderEntry",
  chrome.extension.getURL("/providers") + "/google/GoogleAPIWrapper.js"
], function(
  _,
  Backbone,
  Provider,
  ProviderEntry,
  GoogleAPIWrapper
) {

  return Provider.extend({

    initialize: function() {
      this._googleWrapper= new GoogleAPIWrapper();
    },

    icon: function() {
      return "";
    },

    accepts: function() {
      return true;
    },

    retrieve: _.memoize(function(filter) {
      var result= $.Deferred();

      if (filter) {

      } else {
        this._googleWrapper.mail.unread().done(function(response) {
          response= response.result;
          var threads= _.groupBy(response, function(r) { return r.result.threadId; });

          var list= _.map(threads, function(messages, threadId) {
            var lastMessage= messages[messages.length - 1];
            var subject= _.filter(lastMessage.result.payload.headers, function(entry) { return entry.name === "Subject"; });
            var from= _.filter(lastMessage.result.payload.headers, function(entry) { return entry.name === "From"; })[0].value;
            from= from.substring(0, from.indexOf("<") - 1);
            var label= subject[0] ? subject[0].value : lastMessage.result.snippet;

            return new ProviderEntry({
              label: from + " " + label + (messages.length > 1 ? " - (" + messages.length + ")" : ""),
              url: "https://mail.google.com/mail/u/0/#inbox/" + threadId
            });
          });

          result.resolve(new Backbone.Collection(list));
        });
      }

      return result.promise();
    })
  });
});
