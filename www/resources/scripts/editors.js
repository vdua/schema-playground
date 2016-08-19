(function() {
  _editors = {};
  _snippetCache = {};
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

  var addSnippet = function(snippetFile, editor) {
    if (!_snippetCache[snippetFile]) {
      _snippetCache[snippetFile] = true;
      ace.config.loadModule('ace/ext/language_tools', function() {
        var snippetManager = ace.require("ace/snippets").snippetManager;
        editor.setOption("enableSnippets", true)
        editor.setOption("enableBasicAutocompletion", true)
        $.ajax(snippetFile).then(function(data) {
          _snippetCache[snippetFile] = data;
          snippetManager.register(snippetManager.parseSnippetFile(
            data))
        }).fail(function() {
          console.error("unable to load snippt " + snippetFile);
        })
      });
    }
  }

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
    },
    createEditor: function($el, name) {
      var mode = $el.attr("data-mode") || "json";
      var theme = $el.attr("data-theme") || "monokai";
      var editor = ace.edit($el[0]);
      editor.setTheme("ace/theme/" + theme);
      editor.getSession().setMode("ace/mode/" + mode);
      editor.getSession().setTabSize(2);
      editor.getSession().setUseSoftTabs(true);
      editor.getSession().setUseWrapMode(true);
      if ($el[0].hasAttribute("data-readOnly")) {
        editor.setReadOnly(true);
      }
      var snippet = $el.attr("data-editor-snippets");
      if (snippet) {
        addSnippet(snippet, editor)
      }
      var data = $el.attr("data-content");
      if (data) {
        editor.setValue(data);
        editor.gotoLine(1);
      }
      var config = $el.attr("data-config");
      if (config) {
        _loadConfig(editor, JSON.parse(config));
      }
      if (name) {
        _editors[name] = editor;
      }
      _createEditorMutation($el[0], editor)
      var attrs = $el.data();
      Object.keys(attrs).forEach(function(attr) {
        var match = attr.match(/^on((?:Editor)?[A-Z][a-z]+)/);
        if (match) {
          var evnt = match[1].toLowerCase();
          if (evnt.startsWith("editor")) {
            evnt = evnt.substring(6) //"editor".length
            editor.on(evnt, window[attrs[attr]])
          } else {
            editor.getSession().on(evnt, window[attrs[attr]]);
          }
        }
      })
      return editor;
    }
  }

  var _createEditorMutation = function(target, editor) {
    var editorMutation = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.attributeName == "data-content") {
          editor.setValue(target.getAttribute("data-content"));
          editor.gotoLine(1);
        }
        if (m.attributeName == "data-config") {
          try {
            var val = target.getAttribute("data-config");
            var config = JSON.parse(val)
            _loadConfig(editor, config);
          } catch (e) {
            console.log(e)
          }
        }
      });
    });
    editorMutation.observe(target, {
      attributes: true
    });
  };

}())
