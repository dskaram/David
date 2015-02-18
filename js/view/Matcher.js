define([
  "doT!view/templates/HighlightedText"
  ], function(
    HighlightedText
) {

  return {
      highlight: function(label, filter) {
          var regEx= new RegExp(filter, "ig");
          return filter ?
                    label.replace(regEx, function(match) {
                      return HighlightedText({ match : match });
                    }) : label;
      }
  }

});
