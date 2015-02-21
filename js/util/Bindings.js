define([
	"backbone",
	"util/Property"
	], function(
		Backbone,
		Property
){

	var bindProperty= function(property, model, prop) {
		model.set(prop, property.get());
		property.changed(function(propValue) {
			model.set(prop, propValue);
		});
	};

	var bindHandler= function(model, prop, handler) {
		handler.call(this, model, model.get(prop));
		model.on("change:" + prop, handler);
	};

	return {

		bind: function() {
			if (arguments[0] instanceof Property && arguments[1] instanceof Backbone.Model && typeof arguments[2] === "string") {
				return bindProperty.apply(this, arguments);
			} else if (arguments[0] instanceof Backbone.Model && typeof arguments[1] === "string" && typeof arguments[2] === "function") {
				return bindHandler.apply(this, arguments);
			} else {
				throw new Error("Unsupported function signature");
			}
		}

	};
});
