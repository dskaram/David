chrome.runtime.onConnect.addListener(function(port) {
  if(port.name !== "providers-channel") {
    throw new Error("Unknown channel name");
  }

  var handlers= {};

  var BOOKMARKS_REQ= "req-providers-bookmarks";
  handlers[BOOKMARKS_REQ]= function(req) {
    chrome.bookmarks.getChildren(req.bookmarksId, function(bookmarks) {
      port.postMessage({
        reqId: req.reqId,
        bookmarks: bookmarks
      });
    });
  };

  var BOOKMARKS_SEARCH= "search-providers-bookmarks";
  handlers[BOOKMARKS_SEARCH]= function(req) {
    chrome.bookmarks.search(req.searchTerm, function(bookmarks) {
      port.postMessage({
        reqId: req.reqId,
        bookmarks: bookmarks
      });
    });
  };

  port.onMessage.addListener(function(req) {
    handlers[req.reqType](req);
  });
});
