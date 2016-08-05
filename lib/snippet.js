const fs = require('fs');
const mkdirp = require('mkdirp');
const _ = require('underscore')
const marked = require('marked')
const utils = require('../utils.js')
const AdmZip = require('adm-zip');
const path = require('path');
var Snippet = function({store, fileMap}) {
  this.store = store;
  this.fileMap = fileMap;
}

Snippet.prototype.queryLatestVersion = function (snippetName) {
  var self = this;
  var promiseHandler = function(resolve, reject) {
    fs.readdir(utils.getDir(self.store, snippetName), (err, files) => {
      if (err) return reject({
        err: err,
        message: "snippet doesn't exist",
        status: 404
      });
      if (files.length == 0) {
        resolve(0)
      }
      var x = files.map((f) => {
        return +f
      }).sort(utils.INTEGER_COMPARISON)[files.length - 1]
      resolve(x);
    });
  }
  return new Promise(promiseHandler);
}

Snippet.prototype._loadData = function(fileMap) {
  return Promise.all(fileMap.map((fm) => {
      return new Promise((resolve, reject) => {
        utils.readFile(fm.path)
        .then((data) => {
          resolve(data)
        }).catch(() => resolve())
      })
    }));
}

Snippet.prototype._getFileMap = function(snippetName, version=1) {
  var dir = utils.getDir(this.store, snippetName),
      fileMap = this.fileMap;
  return Object.keys(fileMap).map((key) => {
    return {
      name: key,
      path: path.resolve([dir, version, fileMap[key]].join("/"))
    }
  }).concat(
    Object.keys(fileMap).map((key) => {
      var d = utils.getFileNameAndExtension(fileMap[key]);
      return {
        name: key + "Config",
        path: path.resolve([dir, version, d.name + "Config.json"].join("/"))
      }
    })
  )
}

Snippet.prototype.loadSnippet = function(snippetName, version=1) {
  var dir = utils.getDir(this.store, snippetName);
  var self = this;
  return new Promise((resolve, reject) => {
    fs.stat(dir + "/" + version, (err, stats) => {
      if (err) reject({
        msg: "Unable to locate the requested snippet",
        err: err,
        status: 404
      });
      var fileMap = self._getFileMap(snippetName, version);
      self._loadData(fileMap).then((data) => {
        var result = {}
        data.forEach((d, index) => {
          var fm  = fileMap[index];
          result[fm.name] = d;
          var match = fm.path.match(/\.([^.]+)$/);
          if (match != null && match.length == 2) {
            var ext = match[1];
            if (ext == "md" || ext == "markdown") {
              result["html" + utils.toSentenceCase(fm.name)] = marked(d);
            }
          }
        });
        resolve({
          data : result,
          url: snippetName + "/" + version
        })
      })
      .catch((err) => {
          err.msg = "unable to read " + err.filename +
            " for snippet"
          reject(err);
        })
    });
  })
}

Snippet.prototype._updateSnippet = function (snippetName, data, version) {
  if(typeof snippetName !== "string" || typeof data !== "object" ||
    typeof version !== "number") {
    throw "invalid arguments passed";
  }
  var shouldBeVersion = 1
  var promiseHandler = function (resolve, reject) {
    this.queryLatestVersion(snippetName).then((latestVersion) => {
      if (version === 0) {
        s
      }
    }).catch(reject)
  }
};

Snippet.prototype.saveSnippet = function (snippetName, data, version=1) {
  var dir = utils.getDir(this.store, snippetName);
  var self = this;
  var promiseHandler = function (resolve, reject) {
    utils.fileExists(dir).then(() => {
      self._updateSnippet(snippetName, data, version).then(resolve).catch(reject);
    }).catch(() => {
      mkdirp.sync(dir);
      self._updateSnippet(snippetName, data, version).then(resolve).catch(reject);
    })
  }
  return new Promise(promiseHandler);
  this.queryLatestVersion(snippetName).then((version))

  console.log("directory created" + dir);
  var fileMap = this._getFileMap(snippetName, version)

  return _saveFiles(_resolvedFileMap(dir, this.config.fileNames, 1), data)
};

exports.newSnippet = function ({store, fileMap}) {
  return new Snippet({store, fileMap})
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
  var readOnly = !!req.query.readOnly
  if (!version) {
    _getLatestVersion(this.store, req.params.snippet)
      .then((version) => {
        var redirect = utils.join("/", this.config.root, req.params.snippet,
          version);
        redirect = utils.join(".", redirect, req.params.ext);
        if (readOnly) {
          redirect = redirect + "?readOnly=true";
        }
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
              snippetUrl: self.config.root + "/" + result.url,
              readOnly: readOnly
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

Snippet.prototype.export = function (req, res, next) {
  var self = this;
  var zip = new AdmZip();
  var snippetName = req.params.snippet;
  var dir = utils.getDir(this.store, snippetName);
  utils.addDirToZip(path.resolve(dir), path.resolve(dir, ".."), zip)
    .then(() => {
      zip.toBuffer(function (buffer) {
        res.attachment(snippetName + ".zip");
        res.send(buffer);
      });
    })
}
