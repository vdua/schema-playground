(function() {
  $(function() {
    $(".edit").click(function(e) {
      $("#slide").addClass("hidden");
      $("#edit-slide").removeClass("hidden");
      e.preventDefault();
    });
    $('a#preview-nav').on('shown.bs.tab', function(e) {
      var html = marked(editors.getData("slide"));
      $("#slide-preview").html(html);
    });
  })
}())
