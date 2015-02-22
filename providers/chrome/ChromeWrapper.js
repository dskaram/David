define([
  "jquery",
  "underscore"
  ],function(
  $,
  _
) {

  var BOOKMARKS_REQ= "req-providers-bookmarks";

  var ChromeWrapper= function() {};
  var port = chrome.runtime.connect({ name: "providers-channel" });
  var pendingRequests= {};
  port.onMessage.addListener(function(resp) {
    pendingRequests[resp.reqId].resolve(resp.bookmarks);
    delete pendingRequests[resp.reqId];
  });

  ChromeWrapper.prototype.bookmarks= function(bookmarksId) {
    var result= $.Deferred();
    var requestId= _.uniqueId(BOOKMARKS_REQ);
    pendingRequests[requestId]= result;

    port.postMessage({
      reqId: requestId,
      reqType: BOOKMARKS_REQ,
      bookmarksId: bookmarksId
    });

    return result;
  };

  return ChromeWrapper;
});
