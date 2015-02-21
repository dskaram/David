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
    "providers/Provider",
    "providers/matching/MatchingProvider",
    "QuickAction",
    providersBaseUrl + "/chrome/ChromeProvider.js",
    providersBaseUrl + "/ddg/DDGProvider.js",
    providersBaseUrl + "/feedzilla/FeedZillaCategoryProvider.js",
    providersBaseUrl + "/nytimes/NYTimesProvider.js"
  ],
  function($, _, B, SIV,
          Property,
          Keys,
          Provider,
          MatchingProvider,
          QuickAction,
          ChromeProvider,
          DDGProvider,
          FeedZillaCategoryProvider,
          NYTimesProvider
) {
    $(function() {

      var body= $("body");
      var matchingProvider= new MatchingProvider();
      var quickActionsPlaceholder= $("<div id='quick-actions-placeholder'></div>");
      open= new Property(false);
      QuickAction
        .create(quickActionsPlaceholder)
        .baseUrl(chrome.extension.getURL(""))
        .open(open)
        .provider(matchingProvider
                        .add(new DDGProvider())
                        .add(new FeedZillaCategoryProvider())
                        .add(new NYTimesProvider())
                        .add(new ChromeProvider())
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

      var port = chrome.runtime.connect({name: "providers-channel"});
      port.postMessage({type : "req-providers-bookmarks"});
      port.onMessage.addListener(function() {
        console.log(arguments)
      });

      window.addEventListener("message", function(event) {
        if (event.source !== window) return;

        if (event.data.type && (event.data.type == "ADD_PROVIDER")) {
          matchingProvider.add(event.provider);
        }
      }, false);
    });
  }
);
