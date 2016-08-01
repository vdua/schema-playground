(function() {
  _sortables = [];

  var integerComparison = function(a, b) {
    return a - b;
  }

  var moveItem = function(element, from, dest) {
    element.off();
    var sortable = _sortables[dest];
    $(sortable.el).append(element);
    var arr = sortable.toArray().sort(integerComparison);
    sortable.sort(arr);
  }

  var parseInt10 = (function(x) {
    return function(n) {
      return parseInt(n, x);
    }
  }(10))

  $(function() {
    $("[data-sortable]").each(function() {
      var sort = Sortable.create(this, {
        group: $(this).attr("data-sortable"),
        ghostClass: "ghost",
        handle: ".handle",
        animation: 150
      });
      _sortables.push(sort);
      $(this).attr("data-sortable-id", _sortables.length - 1);
    }).on("click.preview", "[data-iframe-previewer]", function(e) {
      $("iframe").attr("src", $(this).attr("href") + "?readOnly=true");
      e.preventDefault();
    }).on("click.move", "[data-move]", function(e) {
      var $el = $(this);
      var from = +($(e.originalEvent.currentTarget).attr(
        'data-sortable-id'));
      var to = 1 - from;
      moveItem($el.parents("[data-id]").eq(0), from, to)
    })
  });

  var tutorial = {
    getData: function() {
      return {
        snippet: $("[data-snippetname]").attr("data-snippetname"),
        order: tutorial.getSnippetOrder()
      }
    },
    getSnippetOrder: function() {
      var sortable = _sortables[$("#used-snippets").attr(
        "data-sortable-id")];
      return sortable.toArray().map(parseInt10);
    }
  };

  window.tutorial = tutorial;
}())
