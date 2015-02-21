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

var providersBaseUrl= chrome.extension.getURL("/providers");

require(
  ["jquery",
    "underscore",
    "backbone",
    "util/ScrollIntoView",
    "util/Property",
    "util/Keys",
    "providers/matching/MatchingProvider",
    "QuickAction",
    providersBaseUrl + "/ddg/DDGProvider.js",
    providersBaseUrl + "/feedzilla/FeedZillaCategoryProvider.js",
    providersBaseUrl + "/nytimes/NYTimesProvider.js"
  ],
  function($, _, B, SIV,
          Property,
          Keys,
          MatchingProvider,
          QuickAction,
          DDGProvider,
          FeedZillaCategoryProvider,
          NYTimesProvider
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
                  )
        .bind();
      open.changed(function(open) {
        quickActionsPlaceholder.toggleClass("shown", open);
      });
      body.keyup(function(e) {
          if (e.ctrlKey && e.which === Keys.SPACE) {
            Keys.stopEvent(e);
            open.set(!open.get());
          } else if (e.which === Keys.ESCAPE) {
            Keys.stopEvent(e);
            open.set(false);
          }
      });
      body.append(quickActionsPlaceholder);
    });
  }
);
