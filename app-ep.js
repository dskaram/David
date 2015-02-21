chrome.runtime.onConnect.addListener(function(port) {
  if(port.name !== "providers-channel") {
    throw new Error("Unknown channel name");
  }

  port.onMessage.addListener(function(req) {
    if (req.type === "req-providers-bookmarks") {
      chrome.bookmarks.getChildren("0", function() {
        debugger
        port.postMessage({bookmarks: arguments });
      });
    }
  });
});
