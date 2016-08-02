(function() {

  var _getSnippet = function(snippetName, version) {
    var url = "/" + snippetName + "/" + version + ".json";
    return $.ajax(url);
  }

  var _load = function(snippet, version) {
    _getSnippet(snippet, version).then(
      function(data) {
        Snippets.setSnippet(data);
      });
  }

  var _createTutorial = function(data) {
    var tutorial = {
      snippet: data.snippet,
      order: data.order,
      current: -1,
      load: function() {
        if (this.current > -1 && this.current < this.order.length) {
          _load(this.snippet, this.order[this.current]);
        }
        if (this.current === this.order.length - 1) {
          this.nextBtns.hide();
        } else {
          this.nextBtns.show();
        }
        if (this.current === 0) {
          this.prevBtns.hide();
        } else {
          this.prevBtns.show();
        }
      },
      next: function() {
        this.current++;
        this.load();
      },
      prev: function() {
        this.current--;
        this.load();
      },
      goto: function (page) {
        if (isNaN(page)) {
          page = 0;
        }
        if (page >= this.order.length) {
          page = this.order.length - 1;
        }
        if (page < 0) {
          page = 0;
        }
        this.current = page;
        this.load();
      },
      nextBtns: $("[data-tutorial-next]"),
      prevBtns: $("[data-tutorial-prev]")
    };
    tutorial.nextBtns.on("click.tutorial", function(e) {
      tutorial.next();
    });

    tutorial.prevBtns.on("click.tutorial", function(e) {
      tutorial.prev();
    });
    var page = +(utils.getQueryValue("p"))
    tutorial.goto(page);
  }

  $(function() {
    var tutorial = $("[data-tutorial]").eq(0).attr("data-tutorial");
    _createTutorial(JSON.parse(tutorial));
  })
}())
