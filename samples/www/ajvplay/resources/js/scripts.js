(function () {
  var ajv, options = {},
    createAjv = function (data) {
      try {
        options = JSON.parse(data);
        ajv = new Ajv(options.ajvOptions);
        $("#errors").empty();
      } catch(e) {
        var container = $("#errors").empty();
        utils.showError(e, container, true);
        console.error(e);
      }
      if (ajv == null) {
        ajv = new Ajv();
      }
    }
  window.setOptions = function (evnt, session) {
    createAjv(session.getValue());
  }

  window.validate = function (evnt, editor) {
    var container = $("#errors").empty();
    if (!ajv) {
      createAjv(editors.getData("ajvoptions"))
    }
    try {
      var schema = JSON.parse(editors.getData("schema"));
      var data = editors.getData("data");
      if (data) {
        data = JSON.parse(data);
        var validator = ajv.compile(schema);
        var isValid = validator(data);
        if (isValid) {
          utils.showSuccess("Validation Successful", container, true)
        } else {
          validator.errors.forEach(function (err) {
            utils.showError(err.dataPath + " " + err.message + " as per the constraint " + err.schemaPath, container, true);
          })
        }
      }
    } catch (e) {
      utils.showError(e, container, true);
    }
  }

  $(function () {
    $("#validate").click(function () {
      validate();
    })
  })
}())
