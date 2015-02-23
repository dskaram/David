define([
  "underscore",
  "backbone",
  "util/Bindings",
  "util/Keys",
  "view/Matcher",
  "view/Selection",
  "view/Navigation",
  "doT!view/templates/QuickActionView",
  "doT!view/templates/QuickActionList",
  "doT!view/templates/Breadcrumbs"
  ], function(
    _,
    Backbone,
    Bindings,
    Keys,
    Matcher,
    Selection,
    Navigation,
    QuickActionViewTemplate,
    QuickActionListTemplate,
    Breadcrumbs
  ) {

  var TRANSITION_END= "transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd";

  return Backbone.View.extend({

    KEY: "key-pressed",
    BACKSPACE: "backspace-pressed",
    SELECTION: "selection-pressed",
    NAVIGATION: "navigation-pressed",

    className: "quick-actions-main-container",

    events: {
      "keydown .quick-actions-search-group input": "_onKeyDown",
      "keypress .quick-actions-search-group input": "_onKeyPress",
      "mousemove .quick-actions-listEntry": "_onMouseMove",
      "click": "focus",
      "click .quick-actions-listEntry": "_onClick",
      "click .quick-actions-breadcrumb li:not(.active)": "_targetBreadcrumb",
      "click .quick-actions-breadcrumb .initial": "_targetBreadcrumb"
    },

    initialize: function(options) {
      this.layers= options.layers;
      this.viewModel= options.viewModel;
    },

    render: function() {
      this.$el.html(QuickActionViewTemplate({}));

      this.inputBox= this.$el.find(".quick-actions-search-group input");
      this.providerPlaceholder= this.$el.find(".quick-actions-search-group .quick-actions-search-group-addon");
      this.listView= this.$el.find(".quick-actions-list-view");

      this._bindViewModel();

      this.on(this.NAVIGATION, _.bind(function(direction) {
        if (direction === Navigation.EXECUTE) {
          var activeLayer= this.layers.active();
          var currentSelection= activeLayer.get("selection");
          var entry= activeLayer.get("entries").at(currentSelection);

          if (!entry.isProvider()) {
            var selectedNode= this.listView.children().eq(this.layers.length - 1).children().eq(currentSelection);
            selectedNode.addClass("quickactions-tap-effect");
            setTimeout(function() {
              selectedNode.removeClass("quickactions-tap-effect");
            }, 100);
          }
        }
      }, this));


      return this;
    },

    focus: function() {
      this.inputBox.focus();
    },

    _bindViewModel: function() {
      var self= this;

      Bindings.bind(this.viewModel, "breadcrumb", function(model, breadcrumbs) {
        var node= self.$el.find(".quick-actions-breadcrumb");
        node.html(Breadcrumbs(breadcrumbs));
        node.children().last().addClass("quick-actions-active");
      });

      Bindings.bind(this.viewModel, "open", function(model, open) {
        self.$el.toggleClass("quick-actions-closed", !open);
        if (open) self.focus();
      });

      this.layers.on("add", function(layer, collection, options) {
        var layerIndex= options.index;
        var layerContainer= $("<ul class='quick-actions-listEntries'></ul>");
        self.listView.append(layerContainer);

        layer.on("change:searchTerm", function(model, searchTerm) {
          self.inputBox.val(searchTerm);
        });

        layer.on("change:providerIcon", function(model, providerIcon) {
          self.providerPlaceholder.css("background-image", "url(" + providerIcon + ")");
        });

        layer.on("change:shown", function(model, shown) {
          var translation= -1 * (self.layers.length - 1 - layerIndex) * 100;
          layerContainer.css("transform", "translateX(" + translation + "%)");
        });

        layer.on("change:selection", function(model, index) {
          var entries= layerContainer.find(".quick-actions-listEntry");
          var selectedElement= entries.eq(index);

          entries.removeClass("quick-actions-selected");
          selectedElement.addClass("quick-actions-selected");
          selectedElement.scrollIntoViewIfNeeded();
        });

        layer.on("change:entries", function(model, entries) {
          var selection= model.get("selection");
          var filter= model.get("searchTerm");
          var adapter= model.get("searchAdapter");

          var content= QuickActionListTemplate({
                entries: entries.map(function(entry) {
                          return {
                            label: Matcher.highlight(entry.get("label"), adapter(filter)),
                            isProvider: entry.isProvider()
                          };
                        }),
                selection: selection
          });

          layerContainer.html(content);
        });
      });

      var pendingRemoval= []; // user might be navigating faster than the transform animation
      this.layers.on("remove", function() {
        var entries= self.listView.children();
        var removed= entries.eq(entries.length - pendingRemoval.length - 1);
        pendingRemoval.push(removed);

        removed.on(TRANSITION_END, function() {
          removed.remove();
          pendingRemoval = _.reject(pendingRemoval, function(el) { return el === removed; });

        });
        removed.css("transform", "translateX(" + 100 + "%)");
          // destroy all listeners
      });
    },

    _onKeyDown: function(e) {
      switch(e.which) {
          case Keys.BACKSPACE:
              Keys.stopEvent(e);
              this.trigger(this.BACKSPACE);
              break;
          case Keys.UP_ARROW:
              Keys.stopEvent(e);
              this.trigger(this.SELECTION, Selection.UP);
              break;
          case Keys.DOWN_ARROW:
              Keys.stopEvent(e);
              this.trigger(this.SELECTION, Selection.DOWN);
              break;
          case Keys.ENTER:
            Keys.stopEvent(e);
            this.trigger(this.NAVIGATION, Navigation.EXECUTE);
            break;
          case Keys.RIGHT_ARROW:
            Keys.stopEvent(e);
            var activeLayer= this.layers.active();
            var isProvider= activeLayer.get("entries").at(activeLayer.get("selection")).isProvider();
            if (isProvider) {
              this.trigger(this.NAVIGATION, Navigation.EXECUTE);
            }
            break;
          case Keys.LEFT_ARROW:
              Keys.stopEvent(e);
              this.trigger(this.NAVIGATION, Navigation.ROLLBACK);
              break;
      }
    },

  	_onClick: function(e) {
      // do not stop propagation. parent needs to refocus
  		this.trigger(this.NAVIGATION, Navigation.EXECUTE);
  	},

    _targetBreadcrumb: function(e) {
      // do not stop propagation. parent needs to refocus
      this.layers.length > 1 && this.trigger(this.NAVIGATION, this.layers.length - $(e.target).parent().index() - 1);
    },

  	_onMouseMove: function(e) {
  		Keys.stopEvent(e);
      if (e.target.tagName.toLowerCase() !== "li") return;

  		this.trigger(this.SELECTION, $(e.target).index());
  	},

    _onKeyPress: function(e) {
      Keys.stopEvent(e);
      this.trigger(this.KEY, String.fromCharCode(e.which));
    }
  });
});
