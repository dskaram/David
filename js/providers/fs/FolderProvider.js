define([
  "underscore",
  "backbone",
  "providers/ddg/DDGCategoryProvider",
  "providers/Provider",
	"providers/ProviderEntry"
], function(
  _,
  Backbone,
  DDGCategoryProvider,
  Provider,
	ProviderEntry
) {

  var FolderProvider= Provider.extend({

    initialize: function(model, path) {
      Provider.prototype.initialize.apply(this, arguments);

      this._path= path || "/explore";
    },

    accepts: function() {
      return true;
    },

    icon: function() {
      return "js/providers/fs/files.png";
    },

    retrieve: function(filter) {
      var path= this._path;
      var result= $.Deferred();

      $.get(this._path)
        .done(function(response) {
          var files= response.map(function(file) {
            return file.isDirectory ?
                        new FolderProvider({ label: file.label }, path + "/" + file.label) :
                        new ProviderEntry({
                          label: file.label,
                          url: path + "/" + file.label
                        });
          }).filter(function(file) {
            return file.get("label").toLowerCase().indexOf(filter.toLowerCase()) !== -1;
          });

          result.resolve(new Backbone.Collection(files));
        });

      return result;
    }
  });

  return FolderProvider;
});
