define([], function(){

	return {

		bind: function(property, model, prop) {
			model.set(prop, property.get());
			property.changed(function(propValue) {
				model.set(prop, propValue);
			});
		}

	};
});
