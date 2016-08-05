(function() {

  var _getSnippet = function(snippetName, version) {
    var url = "/" + snippetName + "/" + version + ".json";
    return $.ajax(url);
  }

  var _load = function(snippet, version) {
    return _getSnippet(snippet, version).then(
      function(data) {
        Snippets.setSnippet(data);
        setTimeout(
          function () {
            $(document).trigger("snippetload")
          }, 100)
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
          history.pushState({current : this.current}, null, "?p="+this.current);
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
        }
      },
      next: function() {
        if (this.current < this.order.length - 1) {
          this.current++;
          this.load();
        }
      },
      prev: function() {
        if (this.current > 0) {
          this.current--;
          this.load();
        }
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
        if (this.current == page) {
          return;
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

    window.onpopstate = function (e) {
      if (e.state) {
        var page = e.state.current
      } else {
        page = 0;
      }
      tutorial.goto(page);
    }

    $(document).on("keyup.next", null, "ctrl+right", function() {
      tutorial.next();
    }).on("keyup.prev", null, "ctrl+left", function() {
      tutorial.prev();
    })
  }

  $(function() {
    var tutorial = $("[data-tutorial]").eq(0).attr("data-tutorial");
    _createTutorial(JSON.parse(tutorial));
  })
}())
