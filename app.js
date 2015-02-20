require.config({
  baseUrl: chrome.extension.getURL("/js"),
  paths: {
    'jquery': 'lib/jquery',
    'underscore': 'lib/underscore',
    'backbone': 'lib/backbone',
    'doTCompiler': "lib/doTCompiler",
    'text':  'lib/text',
    'doT': 'lib/doT'
  },
  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ["underscore", "jquery"],
      exports: 'Backbone'
    }
  }
});

require(
  ["jquery",
    "underscore",
    "backbone",
    "util/ScrollIntoView",
    "util/Property",
    "providers/matching/MatchingProvider",
    "providers/ddg/DDGProvider",
    "providers/feedzilla/FeedZillaCategoryProvider",
    "providers/fs/FolderProvider",
    "providers/nytimes/NYTimesProvider",
    "QuickAction"
  ],
  function($, _, B, SIV,
          Property,
          MatchingProvider,
          DDGProvider,
          FeedZillaCategoryProvider,
          FolderProvider,
          NYTimesProvider,
          QuickAction
  ) {
    $(function() {
      var body= $("body");
      var quickActionsPlaceholder= $("<div id='quick-actions-placeholder'></div>");
      open= new Property(false);
      QuickAction
        .create(quickActionsPlaceholder)
        .baseUrl(chrome.extension.getURL(""))
        .open(open)
        .provider(new MatchingProvider()
                        .add(new DDGProvider())
                        .add(new FeedZillaCategoryProvider())
                        .add(new NYTimesProvider())
                        .add(new FolderProvider())
                  )
        .bind();
      open.changed(function(open) {
        quickActionsPlaceholder.toggleClass("shown", open);
      });
      body.keyup(function(e) {
          if (e.ctrlKey && e.which === 32) {
            e.preventDefault();
            e.stopPropagation();

            open.set(!open.get());
          }
      });
      body.append(quickActionsPlaceholder);
    });
  }
);
