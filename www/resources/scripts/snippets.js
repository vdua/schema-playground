(function() {
  var _snippets = {}

  var Snippets = {
    setSnippet: function(data) {
      Object.keys(_snippets).forEach(function(snip) {
        var s = _snippets[snip]
        s.$el.attr("data-content", data[snip]);
        if (data[snip + "Config"]) {
          s.$el.attr("data-config", data[snip + "Config"]);
        }
      });
    },
    getData: function(data) {
      var data = editors.getData();
      Object.keys(_snippets).forEach(function(sn) {
        var snip = _snippets[sn]
        if (snip.type === "contenteditable") {
          data[sn] = snip.$el.text();
        }
      });
      return data;
    }
  };

  window.Snippets = Snippets;

  var _createSnippetElement = function($el) {
    var target = $el[0];
    var snippetName = $el.attr("data-snippet-el");
    var snippet = {
      $el: $el
    };
    if (target.hasAttribute("data-editor")) {
      snippet.type = "editor";
    }
    if (target.hasAttribute("data-content-editable")) {
      snippet.type = "contenteditable"
      $el.on("keydown", function(evnt) {
        var keyCode = evnt.key || evnt.keyCode || evnt.which;
        if (keyCode === "Enter" || keyCode === 13) {
          evnt.preventDefault();
        }
      })
    }
    if (snippetName) {
      _snippets[snippetName] = snippet;
    }
    if (snippet.type == "editor") {
      editors.createEditor($el, snippetName);
    } else {
      var content = $el.attr("data-content");
      if (content) {
        $el.html(content);
      }
      _createMutation(target);
    }
  }

  var _createMutation = function(target) {
    var mutation = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.attributeName == "data-content") {
          $(target).html(target.getAttribute("data-content"));
        }
      });
    });
    mutation.observe(target, {
      attributes: true
    });
  };

  $(function() {
    $("[data-snippet-el]").each(function() {
      _createSnippetElement($(this));
    });
    var str = $("[data-snippet]").attr("data-snippet")
    if (str) {
      try {
        var json = JSON.parse(str);
        Snippets.setSnippet(json);
      } catch (e) {
        console.error(e);
      }
    }
  });
}())
