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

		activator: "",

		isProvider: function() {
			return true;
		},

		debounced: function() {
			return false;
		},

		adapter: function() {
			return _.bind(function(filter) { return filter.substring(this.activator.length) }, this);
		},

		accepts: function(filter) {
			return filter.indexOf(this.activator) === 0;
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
