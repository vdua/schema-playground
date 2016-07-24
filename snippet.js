const fs = require('fs');
const mkdirp = require('mkdirp');
const _ = require('underscore')
const marked = require('marked')
const utils = require('./utils.js')
var Snippet = function(config, cli) {
  this.config = config;
  this.cli = cli;
  this.store = config.store
}

var readFile = function(fm, fail) {
  return new Promise((resolve, reject) => {
    var result = {}
    fs.readFile(fm.path, "utf8", (err, data) => {
      if (err) {
        if (!fail) return resolve();
        return reject({
          filename: fm.name,
          err: err,
          status: 500
        });
      }
      result[fm.name] = data;
      var match = fm.path.match(/\.([^.]+)$/);
      if (match != null && match.length == 2) {
        var ext = match[1];
        if (ext == "md" || ext == "markdown") {
          result["html" + utils.toSentenceCase(fm.name)] = marked(
            data);
        }
      }
      resolve(result);
    });
  })
}

var _loadFiles = function(fileMap) {
  return new Promise((resolve, reject) => {
    Promise.all(fileMap.map((fm) => {
        return readFile(fm, false)
      }))
      .then(
        (values) => {
          var reduced = values.reduce(
            (prev, curr) => {
              return _.extend(prev, curr)
            }, {});
          resolve(reduced)
        })
      .catch((err) => {
        reject(err);
      })
  })
}

var saveFile = function(fm, data) {
  var handler = function(resolve, reject) {
    if (data === undefined) {
      return resolve();
    }
    fs.writeFile(fm.path, data, (err, data) => {
      if (err) return reject({
        err: err,
        filename: fm.name,
        status: 500
      });
      resolve();
    })
  }
  return new Promise(handler)
}

var _saveFiles = function(fileMap, data, callback) {
  return Promise.all(
    fileMap.map((fm) => {
      return saveFile(fm, data[fm.name]);
    })
  )
}

var _getSnippetDir = function(store, snippet) {
  var store = store
  var id = parseInt(snippet, 36);
  return store + "/" + id;
}

var _getLatestVersion = function(store, snippet) {
  var store = store
  var id = parseInt(snippet, 36);
  var promiseHandler = function(resolve, reject) {
    fs.readdir(store + "/" + id, (err, files) => {
      if (err) return reject({
        err: err,
        message: "snippet doesn't exist",
        status: 404
      });
      var compare = function(a, b) {
        return a - b;
      }
      var x = files.map((f) => {
        return +f
      }).sort(compare)[files.length - 1]
      resolve(x);
    })
  }
  return new Promise(promiseHandler);
}

var _resolvedFileMap = function(dir, fileMap, version) {
  version = version || 1
  var files = Object.keys(fileMap).map((key) => {
    var path
    if (key.match(/^!?\^/)) {
      path = dir + "/" + fileMap[key];
    } else {
      path = dir + "/" + version + "/" + fileMap[key];
    }
    return {
      name: key,
      path: path
    }
  });
  var configs = Object.keys(fileMap).map((key) => {
    var fileName = fileMap
    var d = utils.getFileNameAndExtension(fileMap[key]);
    return {
      name: key + "Config",
      path: dir + "/" + version + "/" + d.name + "Config.json"
    }
  });
  return files.concat(configs);
}

Snippet.prototype._loadSnippet = function(snippet, version) {
  var dir = _getSnippetDir(this.store, snippet);
  var self = this;
  return new Promise((resolve, reject) => {
    fs.stat(dir + "/" + version, (err, stats) => {
      if (err) reject({
        msg: "Unable to locate the requested snippet",
        err: err,
        status: 404
      });
      var map = _resolvedFileMap(dir, self.config.fileNames, version);
      _loadFiles(map).then((val) => {
          resolve({
            data: val,
            url: snippet + "/" + version
          });
        })
        .catch((err) => {
          err.msg = "unable to read " + err.filename +
            " for snippet"
          reject(err);
        })
    });
  })
}

Snippet.prototype._createSnippet = function(snippet, data, callback) {
  var dir = _getSnippetDir(this.store, snippet);
  mkdirp.sync(dir + "/" + 1);
  console.log("directory created" + dir);
  return _saveFiles(_resolvedFileMap(dir, this.config.fileNames, 1), data)
}

Snippet.prototype._updateSnippet = function(snippet, version, data) {
  var self = this;
  var promiseHandler = function(resolve, reject) {
    _getLatestVersion(self.config.store, snippet)
      .then((latest) => {
        if (version > latest) {
          return resolve(version)
        }
        version = latest + 1;
        dir = _getSnippetDir(self.config.store, snippet);
        mkdirp.sync(dir + "/" + version);
        console.log("directory created" + dir);
        _saveFiles(_resolvedFileMap(dir, self.config.fileNames, version),
            data)
          .then(() => {
            resolve(version);
          })
          .catch((err) => {
            err.message = "unable to save " + err.filename +
              " of snippet";
            reject(err);
          })
      })
      .catch((err) => {
        reject(err)
      })
  }
  return new Promise(promiseHandler);
}

Snippet.prototype.load = function(req, res, next) {
  var version = req.params.version;
  var self = this;
  if (!version) {
    _getLatestVersion(this.store, req.params.snippet)
      .then((version) => {
        var redirect = utils.join("/", this.config.root, req.params.snippet,
          version);
        redirect = utils.join(".", redirect, req.params.ext);
        res.redirect(redirect);
      }).catch(next);
  } else {
    this._loadSnippet(req.params.snippet, version)
      .then((result) => {
        switch (req.params.ext) {
          case "json":
            res.send(result.data);
            break;
          default:
            res.render(this.config.views.index, {
              snippet: result.data,
              snippetName: req.params.snippet,
              snippetUrl: self.config.root + "/" + result.url
            });
        }
      })
      .catch(next);
  }
}

Snippet.prototype.save = function(req, res, next) {
  var snippetName = req.params.snippet;
  var snippet;
  var self = this;
  if (snippetName == "new") {
    var time = new Date().getTime();
    snippet = time.toString(36);
    var data = _.extend({}, req.body);
    this._createSnippet(snippet, data)
      .then(() => {
        res.redirect(self.config.root + "/" + snippet);
      })
      .catch(next)
  } else {
    var version = req.params.version || 1;
    console.log(version + " update request " + snippetName);
    var data = _.extend({}, req.body);
    this._updateSnippet(snippetName, version, data)
      .then((version) => {
        res.redirect(self.config.root + "/" + snippetName + "/" + version);
      })
      .catch(next);
  }
}

Snippet.prototype.list = function(req, res, next) {
  var self = this;
  fs.readdir(this.store, (err, files) => {
    if (err) {
      return next({
        err: err,
        msg: "no data exist",
        status: 404
      });
    }
    var f = files.map((file) => {
      return self.config.root + "/" + (+file).toString(36)
    });
    res.render(this.config.views.list, {
      snippets: f
    })
  })
}

exports.snippet = function(config, cli) {
  return new Snippet(config, cli);
}
