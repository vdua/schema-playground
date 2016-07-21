const fs = require('fs');
const mkdirp = require('mkdirp');
const _ = require('underscore')
var Snippet = function (config, cli) {
  this.config = config;
  this.cli = cli;
}

var readFile = function (fm, fail) {
  return new Promise((resolve, reject) => {
    var result = {}
    fs.readFile(fm.path, "utf8", (err, data) => {
      if (err) {
        if (!fail) return resolve();
        return reject({
          filename : fm.name,
          err : err,
          status : 500
        });
      }
      result[fm.name] = data;
      resolve(result);
    });
  })
}

var _loadFiles = function (fileMap) {
  return new Promise( (resolve, reject) => {
    Promise.all(fileMap.map((fm) => {
          return readFile(fm, false)
        }))
      .then(
        (values) => {
          var reduced = values.reduce(
                          (prev, curr) => {
                            return _.extend(prev,curr)
                          },
                          {});
          resolve(reduced)
        })
      .catch((err) => {
        reject(err);
      })
  })
}

var saveFile = function (fm, data) {
  var handler = function (resolve, reject) {
    if (data === undefined) {
      return resolve();
    }
    fs.writeFile(fm.path, data, (err, data) => {
      if (err) return reject({
        err : err,
        filename : fm.name,
        status : 500
      });
      resolve();
    })
  }
  return new Promise(handler)
}

var _saveFiles = function (fileMap, data, callback) {
  return Promise.all(
    fileMap.map((fm) => {
      return saveFile(fm, data[fm.name]);
    })
  )
}

var _getSnippetDir = function (store, snippet) {
  var store = store
  var id = parseInt(snippet, 36);
  return store + "/" + id;
}

var _getLatestVersion = function (store, snippet) {
  var store = store
  var id = parseInt(snippet, 36);
  var promiseHandler = function (resolve, reject) {
    fs.readdir(store + "/" + id, (err, files) => {
      if (err) return reject({
        err :err,
        message : "snippet doesn't exist",
        status : 404
      });
      var compare = function (a,b) { return a - b;}
      var x = files.map( (f) => { return +f}).sort(compare)[files.length - 1]
      resolve(x);
    })
  }
  return new Promise(promiseHandler);
}

var _resolvedFileMap = function (dir, fileMap, version) {
  version = version || 1
  return Object.keys(fileMap).map((key) => {
    var path
    if (key.match(/^!?\^/)) {
      path = dir + "/" + fileMap[key];
    } else {
      path = dir + "/" + version + "/" + fileMap[key];
    }
    return {
      name : key,
      path : path
    }
  });
}

Snippet.prototype._loadSnippet = function (snippet, version) {
  var dir = _getSnippetDir(this.config.store, snippet);
  var self = this;
  return new Promise((resolve, reject) => {
    fs.stat(dir + "/" + version, (err, stats) => {
      if (err) reject({
        msg : "Unable to locate the requested snippet",
        err : err,
        status : 404
      });
      var map = _resolvedFileMap(dir, self.config.fileNames, version);
      _loadFiles(map).then((val) => {
          resolve(val);
        })
        .catch((err) => {
          err.msg = "unable to read " + err.filename + " for snippet"
          reject(err);
        })
    });
  })
}

Snippet.prototype._createSnippet = function (snippet, data, callback) {
  var dir = _getSnippetDir(this.config.store, snippet);
  mkdirp.sync(dir);
  console.log("directory created" + dir);
  return _saveFiles(_resolvedFileMap(dir, this.config.fileNames, 1), data)
}

Snippet.prototype._updateSnippet = function (snippet, version, data) {
  var self = this;
  var promiseHandler = function (resolve, reject) {
    _getLatestVersion(self.config.store, snippet)
    .then((latest) => {
      if (version > latest) {
        return resolve(version)
      }
      version = latest + 1;
      dir = _getSnippetDir(self.config.store, snippet);
      mkdirp.sync(dir);
      console.log("directory created" + dir);
      _saveFiles(_resolvedFileMap(dir, self.config.fileNames, version), data)
      .then(() => {
        resolve(version);
      })
      .catch((err) => {
        err.message = "unable to save " + err.filename + " of snippet";
        reject(err);
      })
    })
    .catch((err) => {
      reject(err)
    })
  }
  return new Promise(promiseHandler);
}

Snippet.prototype.load = function (req, res, next) {
  var version = req.params.version
  if (!version) {
    _getLatestVersion(this.config.store, req.params.snippet)
    .then((version) => {
      res.redirect(this.config.root + "/" + req.params.snippet + "/" + version)
    }).catch(next);
  } else {
    this._loadSnippet(req.params.snippet, version)
      .then( (data) => {
        res.render(this.config.views.index, data);
      })
      .catch(next);
  }
}

Snippet.prototype.save = function (req, res, next) {
  var snippetName = req.params.snippet;
  var snippet;
  var self = this;
  if (snippetName == "new") {
    var time = new Date().getTime();
    snippet = time.toString(36);
    var data = _.extend({}, req.body);
    this._createSnippet(snippet, data)
        .then( () => {
            res.redirect(this.config.root + "/"+snippet);
          })
        .catch(next)
  } else {
    var version = req.params.version || 1;
    console.log(version + " update request " + snippetName);
    var data = _.extend({}, req.body);
    this._updateSnippet(snippetName, version, data)
        .then((version) => {
            res.redirect(this.config.root + "/" + snippetName + "/" + version);
          })
        .catch(next);
  }
}

Snippet.prototype.list = function (req, res, next) {
  console.log('here');
  fs.readdir(this.config.store, (err, files) => {
    if (err) {
      return next({
        err : err,
        msg : "no data exist",
        status : 404
      });
    }
    console.log(files);
    var f = files.map((file) => {return (+file).toString(36)});
    console.log(f);
    res.render(this.config.views.list, {snippets : f})
  })
}

exports.snippet = function (config, cli) {
  return new Snippet(config, cli);
}
