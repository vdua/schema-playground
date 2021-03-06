(function() {

  var _submitData = function(url, data, method) {
    method = method || "POST";
    var $form = $("<form>").attr({
      "action": url,
      "method": method
    });
    if (typeof data === "object" && data != null) {
      var inputs = Object.keys(data).map(function(k) {
        var val = data[k];
        if (typeof val === "object") {
          val = JSON.stringify(val);
        }
        return $('<input type="hidden"/>').attr({
          name: k,
          value: val
        });
      })
      $form.append(inputs).appendTo("body")[0].submit();
    }
  }

  var toolbarControls = {
    new: function(e) {
      window.location.href = "/";
    },

    save: function(e) {
      var $el = $(e.target);
      var url = $el.attr("data-url")
      var scr = $el.attr("data-data");
      var data = eval(scr);
      _submitData(url, data, "POST")
    },

    tutorial: function(e) {
      var $el = $(e.target);
      var url = "/tutorial";
      var data = {
        snippet: $el.attr("data-snippet"),
        order: "*"
      }
      _submitData(url, data);
    }
  };

  $(function() {
    $("[data-tool]").click(function(e) {
      var fn = $(this).attr("data-tool");
      toolbarControls[fn](e);
    });
  });

}())
