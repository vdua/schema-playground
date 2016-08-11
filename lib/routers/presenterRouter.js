var express = require('express');
var snippet = require('../modules/snippet.js')
const _ = require("underscore");

const presenters = {}
const presenterTemplates = {}
const presenterRouter = function(config) {
  Object.keys(config).forEach((configName) => {
    presenterTemplates[configName] = config[configName].templates;
    presenters[configName] = snippet.newSnippet(config[configName]);
  });
  var router = express.Router();

  router.param("presenter", function(req, res, next, id) {
    if (presenters.hasOwnProperty(id)) {
      req.presenter = presenters[id];
      next();
    } else {
      next({
        err: new Error("invalid presenter"),
        msg: "invalid presenter",
        status: 404
      })
    }
  });

  router.get("/:presenter/:presentation?(.:version)?(.:extension)?",
    function(req, res, next) {
      var presenter = req.presenter;
      var p = req.params.presenter;
      var pname = req.params.presentation;
      var readOnly = !!req.query.readOnly;
      if (pname == null) {
        res.render(presenterTemplates[p].index, {
          presenter: req.params.presenter,
          presentation: pname || "",
          readOnly: readOnly
        })
      } else {
        var version = req.params.version
        var extension = req.params.extension || "html"
        if (!version) {
          presenter.queryLatestVersion(pname).then((version) => {
            var url =
              `/presenter/${p}/${pname}.${version}.${extension}`;
            if (readOnly) {
              url += "?readOnly=true"
            }
            res.redirect(url);
          }).catch(next)
        } else {
          presenter.loadSnippet(pname, version).then((result) => {
            switch (extension) {
              case "json":
                res.send(result.data);
                break;
              case "html":
                var obj = {
                  readOnly: readOnly,
                  presenter: p,
                  presentation: pname
                }
                if (Object.keys(result.data).length) {
                  obj.slide = result.data
                }
                res.render(presenterTemplates[p].index, obj)
            }

          }).catch(next)
        }
      }
    })

  router.post("/:presenter/:presentation?", function(req, res, next) {
    var presenter = req.presenter;
    var pname = req.params.presentation;
    if (pname == null) {
      var time = new Date().getTime();
      pname = time.toString(36);
    }
    var data = _.extend({}, req.body);
    presenter.saveSnippet(pname, data).then((version) => {
      res.redirect(
        `/presenter/${req.params.presenter}/${pname}.${version}`)
    })
  })

  return router
}

module.exports = presenterRouter;
