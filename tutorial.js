const utils = require('./utils')
const mkdirp = require('mkdirp');
const _ = require('underscore');

var Tutorial = function(config, cli) {
  this.config = config;
  this.cli = cli;
}

var _createTutorial = function(config, snippetName, tutName, order) {
  var snippetDir = utils.getDir(config.store, snippetName);
  var tutFile = utils.getDir(config.tutStore, tutName);
  var obj = {};
  var promiseHandler = function(resolve, reject) {
    utils.fileExists(snippetDir).then((stats) => {
      utils.getLatestVersion(config.store, snippetName).then((version) => {
        obj.snippet = snippetName;
        if (order == "*") {
          obj.order = _.range(1, version + 1);
        } else {
          obj.order = order.filter((v) => {
            return v > 0 && v <= version;
          });
        }
        utils.writeToFile(tutFile, JSON.stringify(obj)).then(
          resolve).catch(reject)
      }).catch(reject)
    }).catch(reject)
  };
  return new Promise(promiseHandler);
}

var _saveTutorialData = function(store, tutFile, snippetName, order) {
  return new Promise((resolve, reject) => {
    var obj = {};
    if (typeof order === "string" && order !== "*") {
      order = JSON.parse(order);
    }
    utils.getLatestVersion(store, snippetName).then((version) => {
      obj.snippet = snippetName;
      if (order == "*") {
        obj.order = _.range(1, version + 1);
      } else {
        obj.order = order.filter((v) => {
          return v > 0 && v <= version;
        });
      }
      utils.writeToFile(tutFile, JSON.stringify(obj))
        .then(resolve)
        .catch(reject)
    }).catch(reject)
  })
}

var _updateTutorial = function(config, snippetName, tutName, order) {
  var snippetDir = utils.getDir(config.store, snippetName);
  var tutFile = utils.getDir(config.tutStore, tutName);
  var obj = {};
  var promiseHandler = function(resolve, reject) {
    Promise.all([utils.fileExists(snippetDir), utils.readFile(tutFile)])
      .then((result) => {
        var tutData = JSON.parse(result[1]);
        if (snippetName == tutData.snippet) {
          _saveTutorialData(config.store, tutFile, snippetName, order)
            .then(resolve)
            .catch(reject)
        } else {
          reject({
            err: "You don't have access to update the tutorial",
            msg: "You don't have access to update the tutorial",
            status: "403"
          })
        }
      })
      .catch(reject)
  };
  return new Promise(promiseHandler);
}


Tutorial.prototype.save = function(req, res, next) {
  var tutName = req.params.tutname;
  var self = this;
  if (tutName == null) {
    tutName = (new Date().getTime()).toString(36);
    _createTutorial(this.config, req.body.snippet, tutName, "*")
      .then(() => {
        res.redirect(self.config.root + "/tutorial/" + tutName + "/edit");
      })
      .catch(next);
  } else {
    _updateTutorial(this.config, req.body.snippet, tutName, req.body.order)
      .then(() => {
        res.redirect(self.config.root + "/tutorial/" + tutName + "/edit");
      })
      .catch(next)
  }
}

Tutorial.prototype.edit = function(req, res, next) {
  var tutName = req.params.tutname;
  var self = this;
  if (tutName != null) {
    var tutFile = utils.getDir(this.config.tutStore, tutName);
    utils.readFile(tutFile).then((data) => {
      var _data = JSON.parse(data);
      utils.getLatestVersion(self.config.store, _data.snippet)
        .then((version) => {
          _data.availableSnippets = _.difference(_.range(1, version +
            1), _data.order);
          res.render('edit-tutorial', _data);
        })
        .catch(next);
    }).catch(next);
  } else {
    next({
      err: "couldn't find what you are looking for",
      msg: "couldn't find what you are looking for",
      status: 400
    })
  }
};

Tutorial.prototype.load = function(req, res, next) {
  res.send("Hello World");
}

exports.tutorial = function(config, cli) {
  return new Tutorial(config, cli);
}
