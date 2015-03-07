define([
  "jquery",
  "underscore"
  ],function(
  $,
  _
) {

  var ChromeWrapper= function() {};
  var port = chrome.runtime.connect({ name: "providers-channel" });
  var pendingRequests= {};
  port.onMessage.addListener(function(resp) {
    var pendingRequest= pendingRequests[resp.reqId];
    pendingRequest.deferred.resolve(resp[pendingRequest.respKey]);
    delete pendingRequests[resp.reqId];
  });


  var BOOKMARKS_REQ= "req-providers-bookmarks";
  var BOOKMARKS_SEARCH= "search-providers-bookmarks";
  ChromeWrapper.prototype.bookmarks= {
    search: function(searchTerm) {
      var result= $.Deferred();
      var requestId= _.uniqueId(BOOKMARKS_SEARCH);
      pendingRequests[requestId]= {
        respKey: "bookmarks",
        deferred: result
      };

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
      pendingRequests[requestId]= {
        respKey: "bookmarks",
        deferred: result
      };

      port.postMessage({
        reqId: requestId,
        reqType: BOOKMARKS_REQ,
        bookmarksId: bookmarksId
      });

      return result;
    }
  };

  var TOP_SITES_REQ= "req-providers-topsites";
  ChromeWrapper.prototype.topSites= {
    get: function() {
      var result= $.Deferred();
      var requestId= _.uniqueId(TOP_SITES_REQ);
      pendingRequests[requestId]= {
        respKey: "topSites",
        deferred: result
      };

      port.postMessage({
        reqId: requestId,
        reqType: TOP_SITES_REQ
      });

      return result;
    }
  };

  var HISTORY_SEARCH= "search-providers-history";
  ChromeWrapper.prototype.history= {
    search: function(query) {
      var result= $.Deferred();
      var requestId= _.uniqueId(HISTORY_SEARCH);
      pendingRequests[requestId]= {
        respKey: "historyEntries",
        deferred: result
      };

      port.postMessage({
        reqId: requestId,
        reqType: HISTORY_SEARCH,
        query: query
      });

      return result;
    }
  };

  var DOWNLOAD_OPEN= "open-providers-download";
  var DOWNLOADS_SEARCH= "search-providers-downloads";
  ChromeWrapper.prototype.downloads= {
    open: function(downloadId) {
      port.postMessage({
        reqType: DOWNLOAD_OPEN,
        downloadId: downloadId
      });

      return $.Deferred().resolve();
    },
    search: function(query) {
      var result= $.Deferred();
      var requestId= _.uniqueId(DOWNLOADS_SEARCH);
      pendingRequests[requestId]= {
        respKey: "downloads",
        deferred: result
      };

      port.postMessage({
        reqId: requestId,
        reqType: DOWNLOADS_SEARCH,
        query: query
      });

      return result;
    }
  };

  var TAB_OPEN= "open-providers-tab";
  ChromeWrapper.prototype.tabs= {
    open: function(url) {
      port.postMessage({
        reqType: TAB_OPEN,
        url: url
      });

      return $.Deferred().resolve().promise();
    }
  };

  return ChromeWrapper;
});
