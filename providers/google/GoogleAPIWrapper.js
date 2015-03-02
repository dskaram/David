define([
  "underscore"
  ], function(
    _
  ) {
    var ApiWrapper= function() {};

    gapiloaded= function() {
      gapi.client.setApiKey('AIzaSyCy2e9oyRTMHqLZPyDwGosdJa65mAK2Cnk');
    };

    _.extend(ApiWrapper.prototype, {
      load: function() {
        if (typeof gapi !== 'undefined') {
          return this.init();
        }

        var self = this;
        require(['https://apis.google.com/js/client.js?onload=gapiloaded'], function() {});
      }
    });

    return ApiWrapper;
});
