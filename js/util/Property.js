define([
  "underscore",
  "backbone",
], function(
  _,
  Backbone
) {

  var CHANGED= "changed";
  var Property= function(value) {
    this._value= value;
    this._events= _.extend({}, Backbone.Events);
  };

  _.extend(Property.prototype, {
    set: function(value) {
      if (this._value !== value) {
        this._value= value;
        this._events.trigger(CHANGED, value);
      }
    },
    get: function() {
      return this._value;
    },
    changed: function(listener) {
      this._events.on(CHANGED, listener);
    }
  });


  return Property;
});
