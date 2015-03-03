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

  var TOP_SITES_REQ= "req-providers-topsites";
  handlers[TOP_SITES_REQ]= function(req) {
    chrome.topSites.get(function(topSites) {
      port.postMessage({
        reqId: req.reqId,
        topSites: topSites
      });
    });
  };

  var HISTORY_SEARCH= "search-providers-history";
  handlers[HISTORY_SEARCH]= function(req) {
    chrome.history.search(req.query, function(historyEntries) {
      port.postMessage({
        reqId: req.reqId,
        historyEntries: historyEntries
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



chrome.runtime.onConnect.addListener(function(port) {
  if(port.name !== "identity-channel") {
    return;
  }

  var handlers= {};

  var AUTH_TOKEN_COMPOSE_MAIL= "auth-token-compose-mail";
  handlers[AUTH_TOKEN_COMPOSE_MAIL]= function(req) {
    var scopes= ["https://www.googleapis.com/auth/gmail.compose"];
    chrome.identity.getAuthToken({
        interactive: true,
        scopes: scopes
      }, function(token) {
        port.postMessage({
          reqId: req.reqId,
          token: {
            token: token,
            scope: scopes
          }
        });
      });
  };

  port.onMessage.addListener(function(req) {
    handlers[req.reqType](req);
  });
});
