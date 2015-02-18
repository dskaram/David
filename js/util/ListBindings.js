define([], function(){

	return {

		bindWithAdapter: function(source, sink, adapter) {
			source.on("add", function(added) {
				sink.add(adapter(added));
			});

			source.on("remove", function(removed, collection, options) {
				sink.remove(sink.at(options.index));
			});
		}

	};
});
