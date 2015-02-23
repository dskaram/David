define([
	"jquery",
	"backbone",
	"util/Bindings",
	"util/ListBindings",
	"util/Property",
  "view/QuickActionView",
  "view/Selection",
  "view/Navigation"
], function(
	$,
	Backbone,
	Bindings,
	ListBindings,
	Property,
	QuickActionView,
	Selection,
	Navigation
) {

	var USER_TYPED_INTERVAL= 350;	// msec
	var LayerViewModel= Backbone.Model.extend({
		defaults: {
			entries: new Backbone.Collection(),
			selection: 0,
			searchTerm: "",
			providerIcon: "",
			searchAdapter: _.identity
		}
	});

	var QuickAction= Backbone.Model.extend({

		initialize: function(viewModel, layers, view) {
			this._bindViewEvents(viewModel, layers, view);
			this._baseUrl= "/";
			this._viewModel= viewModel;

			var self= this;
			var providers= this._providers= new Backbone.Collection();
			ListBindings.bindWithAdapter(providers, layers, function(provider) {
				var layer= new LayerViewModel();

				layer.set("searchAdapter", provider.adapter());
				var debounceSearch= provider.debounced() ? _.debounce : _.identity;
				layer.on("change:searchTerm", debounceSearch.call(_, function(model, searchTerm) {
					var providerIcon= provider.icon(searchTerm);
					layer.set("providerIcon", providerIcon ? self._baseUrl + providerIcon : "");

					provider
							.retrieve(searchTerm)
							.done(_.bind(function(entries) {
								layer.set("entries", entries);
							}, this));
				}, USER_TYPED_INTERVAL));

				layer.on("change:entries", function(model, entries) {
					var originalSelection= layer.get("selection");
					layer.set("selection", entries.length > originalSelection ? originalSelection : 0);
				});

				return layer;
			});

			var shiftLayers= function() {
				layers.each(function(layer, index) {
					layer.set("shown", index === layers.length - 1);
				});
			};
			providers.on("add", _.debounce(shiftLayers, 10));	// render first
			providers.on("remove", shiftLayers);

			var updateBreadcrumbs= function() {
				var result= [];
				layers.each(function(layer, index) {
					if (index === 0) return;
					result.push(providers.at(index).get("label"));
				});

				viewModel.set("breadcrumb", result);
			};
			providers.on("add", updateBreadcrumbs);
			providers.on("remove", updateBreadcrumbs);

			var updateResults= function(model) {
				var filter= layers.active().get("searchTerm");
				layers.active().trigger("change:searchTerm", layers.active(), filter);	// term didn't change, but we still want to update
			};
			providers.on("add", updateResults);
			providers.on("remove", updateResults);
		},

		baseUrl: function(baseUrl) {
			this._baseUrl= baseUrl;
			return this;
		},

		open: function(open) {
			this._open= open;
			return this;
		},

		provider: function(defaultProvider) {
			this._providers.add(defaultProvider);
			return this;
		},

		bind: function() {
			if (this._providers.length === 0) throw new Error("Cannot bind without a default provider.");

			if (this._open) {
				Bindings.bind(this._open, this._viewModel, "open");
			}
		},

		_bindViewEvents: function(viewModel, layers, view) {

			view.on(view.SELECTION, _.bind(function(selection) {
				var currentSelection= layers.active().get("selection");
				var numEntries= layers.active().get("entries").length;

				switch(selection) {
			        case Selection.DOWN:
			        	layers.active().set("selection", currentSelection === numEntries - 1 ? 0 : currentSelection + 1);
						break;
			        case Selection.UP:
			         	layers.active().set("selection", currentSelection === 0 ? numEntries - 1 : currentSelection - 1);
              			break;
					default:
			         	layers.active().set("selection", typeof selection === "number" ? selection : 0);
              	}

			}, this));

			view.on(view.NAVIGATION, _.bind(function(direction) {
				var currentSelection= layers.active().get("selection");
				var entries= layers.active().get("entries");
				var entry= entries.at(currentSelection);

				switch(direction) {
			         case Navigation.EXECUTE:
			         	if (entry.isProvider()) {
				         	this._providers.add(entry);
			         	} else {
									entry.execute();
								}
          			break;
			         case Navigation.ROLLBACK:
			         	direction= 1;
					default:
			         	while (direction > 0 && this._providers.length > 1) {
				         	this._providers.remove(this._providers.last());
				         	direction--;
				        }
        }
			}, this));

			view.on(view.KEY, _.bind(function(key) {
				layers.active().set("searchTerm", layers.active().get("searchTerm") + key);
			}, this));

			view.on(view.BACKSPACE, _.bind(function() {
				var prev= layers.active().get("searchTerm");
				if (prev) {
					layers.active().set("searchTerm", prev.substr(0, prev.length - 1));
				}
			}, this));
		}
	});

	QuickAction.create= function(el) {
		el= el || $("<div></div>");

		var layers= new (Backbone.Collection.extend({
			active: function() {
				return this.last();
			}
		}))();
		var viewModel= new Backbone.Model({
			breadcrumb: [],
			open: false
		});
		var view= new QuickActionView({
			layers: layers,
			viewModel: viewModel
		});
		view.render();

		el.append(view.$el);
		view.focus();

		return new QuickAction(viewModel, layers, view);
	};

	return QuickAction;
});
