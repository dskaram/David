define([
  "jquery",
  "underscore"
  ],function(
  $,
  _
) {

  var BOOKMARKS_REQ= "req-providers-bookmarks";
  var BOOKMARKS_SEARCH= "search-providers-bookmarks";

  var ChromeWrapper= function() {};
  var port = chrome.runtime.connect({ name: "providers-channel" });
  var pendingRequests= {};
  port.onMessage.addListener(function(resp) {
    pendingRequests[resp.reqId].resolve(resp.bookmarks);
    delete pendingRequests[resp.reqId];
  });

  ChromeWrapper.prototype.bookmarks= {
    search: function(searchTerm) {
      var result= $.Deferred();
      var requestId= _.uniqueId(BOOKMARKS_SEARCH);
      pendingRequests[requestId]= result;

      port.postMessage({
        reqId: requestId,
        reqType: BOOKMARKS_SEARCH,
        searchTerm: searchTerm
      });

      return result;
    },
    children: function(bookmarksId) {
      var result= $.Deferred();
      var requestId= _.uniqueId(BOOKMARKS_REQ);
      pendingRequests[requestId]= result;

      port.postMessage({
        reqId: requestId,
        reqType: BOOKMARKS_REQ,
        bookmarksId: bookmarksId
      });

      return result;
    }
  };

  return ChromeWrapper;
});
