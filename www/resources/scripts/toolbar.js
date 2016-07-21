(function () {

  var toolbarControls = {
    new : function (e) {
      window.location.href="/";
    },

    save : function (e) {
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
  };

  $(function () {
    $("[data-tool]").click(function (e) {
      var fn = $(this).attr("data-tool");
      toolbarControls[fn](e);
    });
  });

}())
