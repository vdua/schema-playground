(function () {
  var ajv = new Ajv();
  $(function () {
    var schemaEditor = ace.edit("schema-editor");
    schemaEditor.setTheme("ace/theme/monokai");
    schemaEditor.getSession().setMode("ace/mode/json");
    var dataEditor = ace.edit("data-editor");
    dataEditor.setTheme("ace/theme/monokai");
    dataEditor.getSession().setMode("ace/mode/json");
    $("#validate").click(function (e) {
      var schema = JSON.parse(schemaEditor.getValue())
      var data = JSON.parse(dataEditor.getValue())
      var results = ajv.validate(schema, data);
      console.log(results);
    })
  })
}())
