define([
	"jquery",
	"underscore",
	"backbone",
	"providers/ProviderEntry"
], function(
	$,
	_,
	Backbone,
	ProviderEntry
) {
	var Provider= ProviderEntry.extend({

		isProvider: function() {
			return true;
		},

		adapter: function() {
			return _.identity;
		},

		debounced: function() {
			return false;
		},

		accepts: function(filter) {
			throw new Error("Must override accepts");
		},

		icon: function() {
			return "";
		},

		retrieve: function(filter) {
			throw new Error("Must override retrieve");
		}
	});


	var DefaultProvider= Provider.extend({
		accepts: function(filter) {
			return true;
		},

		retrieve: function(filter) {
			return $.Deferred().resolve(new Backbone.Collection());
		}
	});


	Provider.default= function() {
		return new DefaultProvider();
	}

	return Provider;

});
