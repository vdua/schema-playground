(function() {
  $(function() {
    $(".edit").click(function(e) {
      $("#slide").addClass("hidden");
      $("#edit-slide").removeClass("hidden");
      e.preventDefault();
    });
  });

  var slideshow = null;

  window.createSlideShow = function(evnt, session) {
    var val = session.getValue().replace(/\r\n/g, "\n");
    if (!slideshow) {
      $("#slide-preview").empty();
      slideshow = remark.create({
        source: val,
        container: document.getElementById("slide-preview")
      });
    } else {
      var slides = session.getDocument().getLines(1, evnt.start.row)
        .filter(function(l) {
          return l.match(/^--(-)?$/);
        }).length;
      var currentSlide = slideshow.getCurrentSlideIndex();
      if (currentSlide > slides) {
        slideshow.gotoSlide(slides + 1);
      }
      slideshow.loadFromString(val);
      if (slides !== currentSlide) {
        console.log("goto slide " + slides);
        slideshow.gotoSlide(slides + 1)
      }
    }
  }
}())
