(function () {
   _editors = {};

  window.editors = {
    getData : function (el) {
      if (el) {
        return _editors[el].getValue();
      }
      return Object.keys(_editors).reduce(function (reduction, curr) {
        reduction[curr] = _editors[curr].getValue();
        return reduction;
      }, {});
    }
  }

  var createEditor = function ($el) {
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

  $(function () {
    $("[data-editor]").each(function () {
      createEditor($(this));
    });
  });

}())
