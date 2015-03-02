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
    "util/Property",
    "util/Keys",
    "providers/Provider",
    "providers/matching/MatchingProvider",
    "QuickAction",
    providersBaseUrl + "/google/GoogleAPIWrapper.js",
    providersBaseUrl + "/chrome/ChromeProvider.js",
    providersBaseUrl + "/ddg/DDGProvider.js",
    providersBaseUrl + "/mail/SharePageProvider.js",
    providersBaseUrl + "/feedzilla/FeedZillaCategoryProvider.js",
    providersBaseUrl + "/nytimes/NYTimesProvider.js"
  ],
  function($, _, B,
          Property,
          Keys,
          Provider,
          MatchingProvider,
          QuickAction,
          GoogleAPIWrapper,
          ChromeProvider,
          DDGProvider,
          SharePageProvider,
          FeedZillaCategoryProvider,
          NYTimesProvider
) {
    $(function() {

      var apiWrapper= new GoogleAPIWrapper();
      apiWrapper.load();

      var body= $("body");
      var matchingProvider= new MatchingProvider();
      var quickActionsPlaceholder= $("<div id='quick-actions-placeholder'></div>");
      var quickActionsMarker= $("<div id='quickactions-marker'>↓</div>");
      open= new Property(false);
      QuickAction
        .create(quickActionsPlaceholder)
        .baseUrl(chrome.extension.getURL(""))
        .open(open)
        .provider(matchingProvider
                        .add(new DDGProvider())
                        .add(new FeedZillaCategoryProvider())
                        .add(new SharePageProvider())
                        .add(new NYTimesProvider())
                        .add(new ChromeProvider())
                  )
        .bind();

      open.changed(function(open) {
        quickActionsPlaceholder.toggleClass("quickactions-placeholder-shown", open);
      });

      var port = chrome.runtime.connect({ name: "commands-channel" });
      var TOGGLE_REQ= "toggle-open";
      port.onMessage.addListener(function(req) {
        open.set(!open.get());
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

      var smoothOut= false;
      body.mousemove(_.throttle(function(e) {
        if (smoothOut) return;
        quickActionsPlaceholder.toggleClass("quickactions-marker-shown", !open.get() && e.clientY < 75);
      }, 350));
      quickActionsMarker.click(function() {
        smoothOut= true;
        quickActionsPlaceholder.removeClass("quickactions-marker-shown");
        setTimeout(function() {
          open.set(true);
          smoothOut= false;
        }, 100);
      });

      body.append(quickActionsPlaceholder);
      quickActionsPlaceholder.append(quickActionsMarker);

      window.addEventListener("message", function(event) {
        if (event.source !== window) return;

        if (event.data.type && (event.data.type == "ADD_PROVIDER")) {
          matchingProvider.add(event.provider);
        }
      }, false);
    });
  }
);
