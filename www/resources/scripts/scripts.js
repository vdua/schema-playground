(function () {
  var ajv = new Ajv({
    allErrors : true
  });

  var existingData = false;

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
    var url = existingData ? "" : "/" + snippetName + (version ? "/" + version : "")
    submitData(url, {
      schema : schemaEditor.getValue(),
      data : dataEditor.getValue(),
      form : formEditor.getValue()
    });
  }

  var createEditor = function (id) {
    var editor = ace.edit(id);
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/json");
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
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

  var validate = function () {
    var schema = JSON.parse(schemaEditor.getValue())
    var data = JSON.parse(dataEditor.getValue())
    var result = ajv.validate(schema, data);
    console.log(result);
    if (!result) {
      console.log(ajv.errors)
    }
  }

  $(function () {
    schemaEditor = createEditor("schema-editor");
    dataEditor = createEditor("data-editor");
    formEditor = createEditor("form-editor")
    var schema = $("#container").attr("data-schema");
    if (schema !== undefined) {
      existingData = true;
      schemaEditor.setValue(schema)
    }
    schema = $("#container").attr("data-data");
    if (schema !== undefined) {
      existingData = true;
      dataEditor.setValue(schema)
    }
    schema = $("#container").attr("data-form");
    if (schema !== undefined) {
      existingData = true;
      formEditor.setValue(schema)
    }

    $("#validate").click(function (e) {
      validate();
    });

    $("#save").click(function (e) {
      save();
    });

    $("#new").click(function (e) {
      window.location.href="/";
    })
  })
}())
