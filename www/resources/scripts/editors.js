(function() {
  _editors = {};

  var AceRange = ace.require('ace/range').Range;

  var _getCodeFolding = function(editor) {
    var len = editor.session.doc.getLength();
    if (len > 0) {
      var range = new AceRange(1, 1, len, 1);
      var folds = editor.session.getFoldsInRange(range).map(function(fold) {
        return {
          s: [fold.start.row, fold.start.column],
          e: [fold.end.row, fold.end.column]
        }
      });
      return JSON.stringify(folds);
    }
  }

  window.editors = {
    getData: function(el) {
      if (el) {
        return _editors[el].getValue();
      }
      var result = Object.keys(_editors).reduce(function(reduction, curr) {
        reduction[curr] = _editors[curr].getValue();
        reduction[curr + "Config"] = {
          folds: _getCodeFolding(_editors[curr])
        };
        return reduction;
      }, {});

      return result;
    }
  }

  var createEditor = function($el) {
    var mode = $el.attr("data-mode") || "json";
    var theme = $el.attr("data-theme") || "monokai";
    var editor = ace.edit($el[0]);
    editor.setTheme("ace/theme/" + theme);
    editor.getSession().setMode("ace/mode/" + mode);
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    var data = $el.attr("data-content");
    if (data) {
      editor.setValue(data);
    }
    _editors[$el.attr("data-editor")] = editor;
  };

  $(function() {
    $("[data-editor]").each(function() {
      createEditor($(this));
    });
  });

}())
