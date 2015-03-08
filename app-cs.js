require.config({
  baseUrl: chrome.extension.getURL("/js"),
  paths: {
    'jquery': 'lib/jquery',
    'underscore': 'lib/underscore',
    'backbone': 'lib/backbone',
    'doTCompiler': "lib/doTCompiler",
    'moment':  chrome.extension.getURL("/extension-lib") + '/moment.min',
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
    "providers/ProviderEntry",
    "providers/matching/MatchingProvider",
    "QuickAction",
    providersBaseUrl + "/google/GoogleAPIWrapper.js",
    providersBaseUrl + "/chrome/ChromeProvider.js",
    providersBaseUrl + "/chrome/ChromeWrapper.js",
    providersBaseUrl + "/ddg/DDGProvider.js",
    providersBaseUrl + "/page/SharePageProvider.js",
    providersBaseUrl + "/page/SnoozePageProvider.js",
    providersBaseUrl + "/nytimes/NYTimesProvider.js"
  ],
  function($, _, B,
          Property,
          Keys,
          Provider,
          ProviderEntry,
          MatchingProvider,
          QuickAction,
          GoogleAPIWrapper,
          ChromeProvider,
          ChromeWrapper,
          DDGProvider,
          SharePageProvider,
          SnoozePageProvider,
          NYTimesProvider
) {
    $(function() {

      var apiWrapper= new GoogleAPIWrapper();
      apiWrapper.load();

      var chromeWrapper= new ChromeWrapper();
      ProviderEntry.prototype.execute= function() {
        return chromeWrapper.tabs.open(this.get("url"));
      };

      var body= $("body");
      var matchingProvider= new MatchingProvider();
      var quickActionsPlaceholder= $("<div id='quick-actions-placeholder'></div>");
      var quickActionsMarker= $("<div id='quickactions-marker'>↓</div>");
      var open= new Property(false);
      var search= new Property("");

      QuickAction
        .create(quickActionsPlaceholder)
        .baseUrl(chrome.extension.getURL(""))
        .search(search)
        .open(open)
        .provider(matchingProvider
                        .add(new DDGProvider())
                        .add(new SharePageProvider(apiWrapper))
                        .add(new SnoozePageProvider(apiWrapper))
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
        search.set(DDGProvider.prototype.activator + req.selection);
        open.set(!open.get());
      });

      body.keyup(function(e) {
          if (e.which === Keys.ESCAPE) {
            Keys.stopEvent(e);
            search.set("");
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
