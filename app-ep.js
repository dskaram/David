chrome.runtime.onConnect.addListener(function(port) {
  if(port.name !== "providers-channel") {
    return;
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

  var DOWNLOADS_SEARCH= "search-providers-downloads";
  handlers[DOWNLOADS_SEARCH]= function(req) {
    chrome.downloads.search(req.query, function(downloads) {
      port.postMessage({
        reqId: req.reqId,
        downloads: downloads
      });
    });
  };

  var DOWNLOAD_OPEN= "open-providers-download";
  handlers[DOWNLOAD_OPEN]= function(req) {
    chrome.downloads.open(req.downloadId);
  };

  port.onMessage.addListener(function(req) {
    handlers[req.reqType](req);
  });
});



chrome.runtime.onConnect.addListener(function(port) {
  if(port.name !== "commands-channel") {
    return;
  }

  var TOGGLE_REQ= "toggle-open";
  chrome.commands.onCommand.addListener(function(command) {
    if (command === TOGGLE_REQ) {
      port.postMessage({
        reqType: TOGGLE_REQ
      });
    }
  });
});
