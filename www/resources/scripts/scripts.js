(function () {
  var ajv = new Ajv();

  var existingData = {};

  var submitData = function (url, data) {
    var $form = $("<form>").attr({
      "action" : url,
      "method" : "POST"
    });
    var inputs = Object.keys(data).map(function (k) {
      return $('<input type="hidden"/>').attr({
        name : k,
        value : data[k]
      });
    })
    $form.append(inputs).appendTo("body")[0].submit();
  }

  var save = function () {
    var snippetName = existingData.snippetName || "new"
    var version = existingData.version || 0
    var url = "/" + snippetName + (version ? "/" + version : "")
    submitData(url, {
      schema : schemaEditor.getValue(),
      data : dataEditor.getValue()
    });
  }

  var createEditor = function (id) {
    var editor = ace.edit(id);
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/json");
    editor.commands.addCommand({
      name: 'myCommand',
      bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
      exec: function(editor) {
        save();
      },
      readOnly: false
    });
    return editor;
  }
  var schemaEditor, dataEditor;

  $(function () {

    schemaEditor = createEditor("schema-editor");
    dataEditor = createEditor("data-editor");
    var schema = $("#container").attr("data-schema");
    if (schema !== undefined) {
      schemaEditor.setValue(schema)
    }
    schema = $("#container").attr("data-data");
    if (schema !== undefined) {
      dataEditor.setValue(schema)
    }

    $("#validate").click(function (e) {
      var schema = JSON.parse(schemaEditor.getValue())
      var data = JSON.parse(dataEditor.getValue())
      var results = ajv.validate(schema, data);
      console.log(results);
    })
  })
}())
