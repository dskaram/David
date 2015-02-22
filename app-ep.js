chrome.runtime.onConnect.addListener(function(port) {
  var BOOKMARKS_REQ= "req-providers-bookmarks";

  if(port.name !== "providers-channel") {
    throw new Error("Unknown channel name");
  }

  port.onMessage.addListener(function(req) {
    if (req.reqType === BOOKMARKS_REQ) {
      chrome.bookmarks.getChildren(req.bookmarksId, function(bookmarks) {
        port.postMessage({
          reqId: req.reqId,
          bookmarks: bookmarks
        });
      });
    }
  });
});
