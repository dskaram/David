define([
  "jquery",
  "underscore"
  ],function(
  $,
  _
) {

  var AlarmsWrapper= function() {};
  var port = chrome.runtime.connect({ name: "alarms-channel" });
  var pendingRequests= {};
  port.onMessage.addListener(function(resp) {
    var pendingRequest= pendingRequests[resp.reqId];
    pendingRequest.deferred.resolve(resp[pendingRequest.respKey]);
    delete pendingRequests[resp.reqId];
  });


  var SNOOZE_WEBSITE= "snoozed-website";
  AlarmsWrapper.prototype.alarms= {
    snooze: function(snoozed) {
      port.postMessage(_.extend(snoozed, { reqType: SNOOZE_WEBSITE }));
    }
  };

  return AlarmsWrapper;
});
