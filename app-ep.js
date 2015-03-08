var ASK_DAVID= "ASK_DAVID_CONTEXT_MENU";

chrome.runtime.onInstalled.addListener(function() {
  chrome.identity.getAuthToken({ 'interactive': true }, function(token) {});

  chrome.contextMenus.create({
    id: ASK_DAVID,
    title: "Ask David about '%s'",
    contexts: ["selection"]
  });
});


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

  var TAB_OPEN= "open-providers-tab";
  handlers[TAB_OPEN]= function(req) {
    chrome.tabs.create({
      url: req.url,
      active: false
    });
  };


  port.onMessage.addListener(function(req) {
    handlers[req.reqType](req);
  });
});


chrome.notifications.onButtonClicked.addListener(function(notificationId) {
  chrome.alarms.create(notificationId, {
    delayInMinutes: 5
  });

  chrome.notifications.clear(notificationId, function() {});
});

chrome.notifications.onClicked.addListener(function(notificationId) {
    var snoozed= JSON.parse(notificationId).url;
    chrome.windows.getAll(function(windows) {
      if (windows.length === 0) {
        chrome.windows.create({
          url: snoozed,
          focused: true
        });
      } else {
        chrome.tabs.create({
          url: snoozed,
          active: true
        });
      }
    });

    chrome.notifications.clear(notificationId, function() {});
});


chrome.alarms.onAlarm.addListener(function(alarm) {
    var snoozed= JSON.parse(alarm.name);
    chrome.notifications.create(alarm.name, {
      type: "basic",
      iconUrl: "notification.png",
      title: "Remember me?",
      message: snoozed.title,
      contextMessage: snoozed.url,
      isClickable: true,
      buttons: [{ title: "Snooze 5" }]
    }, function() {});
});


chrome.runtime.onConnect.addListener(function(port) {
  if(port.name !== "alarms-channel") {
    return;
  }

  var handlers= {};

  var SNOOZE_WEBSITE= "snoozed-website";
  handlers[SNOOZE_WEBSITE]= function(snoozed) {
    delete snoozed.reqType;
    chrome.alarms.create(JSON.stringify(snoozed), {
      delayInMinutes: snoozed.delayInMinutes
    });

    setTimeout(function() {
      chrome.tabs.query({ active: true,  currentWindow: true }, function(tabs) {
        chrome.tabs.remove(tabs[0].id, function() {});
      });
    }, 2000);
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
        reqType: TOGGLE_REQ,
        selection: ""
      });
    }
  });

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === ASK_DAVID) {
      port.postMessage({
        reqType: TOGGLE_REQ,
        selection: info.selectionText
      });
    }
  });
});



chrome.runtime.onConnect.addListener(function(port) {
  if(port.name !== "identity-channel") {
    return;
  }

  port.onMessage.addListener(function() {
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
      port.postMessage({
        token: token,
        scope: ["https://www.googleapis.com/auth/gmail.compose",
                "https://www.googleapis.com/auth/contacts.readonly",
                "https://www.googleapis.com/auth/urlshortener"]
      });
    });
  });
});
