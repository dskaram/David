define([
  "underscore",
  "backbone",
  "moment",
  "providers/Provider",
  "providers/ProviderEntry",
  chrome.extension.getURL("/providers") + "/google/AlarmsWrapper.js",
], function(
  _,
  Backbone,
  moment,
  Provider,
  ProviderEntry,
  AlarmsWrapper
) {

  var wrapper= new AlarmsWrapper();
  var MSECS_PER_MINUTE= 1000 * 60;

  var SnoozePageEntry= ProviderEntry.extend({
    execute: function() {
      wrapper.alarms.snooze(this.attributes);
    }
  });

  var snoozedSite= function(momentDelay) {
    var now= moment();
    var delayInMinutes= Math.ceil(momentDelay.diff(now) / MSECS_PER_MINUTE);

    return {
      label: "Remind me " + momentDelay.fromNow(),
      title: document.title,
      url: document.URL,
      delayInMinutes: delayInMinutes
    };
  };

  return Provider.extend({

    activator: "zz ",

    retrieve: function(filter) {
      var test= moment().add(1, "minutes");
      var saturday= moment().day(6); // Saturday
      var twoHours= moment().add(2, "hours");
      var fourHours= moment().add(4, "hours");
      var tonight= moment().hour(20);
      var tomorrow= moment().add(1, "day");

      var snoozeOptions= [
        new SnoozePageEntry(snoozedSite(test)),
        new SnoozePageEntry(snoozedSite(twoHours)),
        new SnoozePageEntry(snoozedSite(fourHours)),
        new SnoozePageEntry(snoozedSite(tonight)),
        new SnoozePageEntry(snoozedSite(saturday))
      ];

      return $.Deferred().resolve(new Backbone.Collection(snoozeOptions)).promise();
    }
  });
});
