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
      if (folds.length == 0) {
        return null;
      }
      return folds;
    }
  };

  var _getEditorConfig = function(editor) {
    var folds = _getCodeFolding(editor);
    if (folds == null) {
      return null;
    }
    return {
      folds: folds
    }
  };

  var _loadConfig = function(editor, config) {
    if (config.folds) {
      config.folds.forEach(function(fold) {
        var range = new AceRange(fold.s[0], fold.s[1], fold.e[0], fold.e[
          1]);
        editor.session.addFold("...", range);
      })
    }
  }

  window.editors = {
    getData: function(el) {
      if (el) {
        return _editors[el].getValue();
      }
      var result = Object.keys(_editors).reduce(function(reduction, curr) {
        reduction[curr] = _editors[curr].getValue();
        var config = _getEditorConfig(_editors[curr]);
        if (config != null) {
          reduction[curr + "Config"] = JSON.stringify(config);
        }
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
    if ($el[0].hasAttribute("data-readOnly")) {
      editor.setReadOnly(true);
    }
    var data = $el.attr("data-content");
    if (data) {
      editor.setValue(data);
    }
    var config = $el.attr("data-config");
    if (config) {
      _loadConfig(editor, JSON.parse(config));
    }
    _editors[$el.attr("data-editor")] = editor;
  };

  $(function() {
    $("[data-editor]").each(function() {
      createEditor($(this));
    });
  });

}())
