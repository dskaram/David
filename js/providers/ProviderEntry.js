define([
	"backbone"
], function(
	Backbone
) {

	var openNewBackgroundTab= function(url){
		var a = document.createElement("a");
		a.href = url;
		var evt = document.createEvent("MouseEvents");
		//the tenth parameter of initMouseEvent sets ctrl key
		evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0,
																true, false, false, false, 0, null);
		a.dispatchEvent(evt);
	};

  return Backbone.Model.extend({

  	isProvider: function() {
  		return false;
  	},

		execute: function() {
			var url= this.get("url");
			if (!url) {
				throw new Error("URL needed to attach default behavior.");
			}

			openNewBackgroundTab(url);
		}

  });
});
