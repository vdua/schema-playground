(function () {
  var createBootstrapAlert = function (msg, type, dismiss) {
    var alrt  = $("<div></div>").attr({
      "class" : "alert" + (dismiss ? " alert-dismissible" : "") + " alert-" + type,
      "role" : "alert"
    }).text(msg)
    if (dismiss) {
      var btn = $("<button/>").attr({
        type :"button",
        "class": "close",
        "data-dismiss" :"alert",
        "aria-label" : "Close"
      }).append('<span aria-hidden="true">&times;</span>');
      alrt.append(btn);
    }
    return alrt;
  }
  window.utils = {
    copyObject : function (src, dest, exceptions) {
      var isException = function (prop) {
        if (typeof exceptions == "function") {
          return exceptions(prop);
        } else if (exceptions instanceof Array) {
          return exceptions.indexOf(prop) > -1
        } else if (exceptions instanceof RegExp) {
          return exceptions.test(prop);
        } else if (typeof exceptions == "string") {
          return prop === exceptions
        }
        return false;
      };

      Object.keys(src).forEach(function (p) {
        if (!isException(p)) {
          if (typeof src[p] == "object") {
            if (src[p] instanceof Array) {
              dest[p] = [];
              src[p].forEach(function (s, index) {
                if (typeof s == "object") {
                  dest[p][index] = utils.copyObject(s, {}, exceptions);
                } else {
                  dest[p][index] = s
                }
              });
            } else {
              dest[p] = utils.copyObject(src[p], {}, exceptions)
            }
          } else {
            dest[p] = src[p]
          }
        }
      });
      return dest;
    },

    getQueryValue : function (q) {
      var regex = new RegExp("[?&]"+q+"=([^&]*)");
      var match = window.location.search.match(regex);
      if (match && match.length == 2) {
        return match[1];
      }
    },

    showError : function (msg, container, dismiss) {
      var alrt = createBootstrapAlert(msg, "danger", dismiss);
      container.append(alrt);
    },

    showSuccess : function (msg, container, dismiss) {
      var alrt = createBootstrapAlert(msg, "success", dismiss);
      container.append(alrt);
    }
  }
}())
