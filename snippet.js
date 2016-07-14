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
            {})
            resolve(reduced)
      })
      .catch((err) => {
        reject(err);
      })
  })
}

var _saveFiles = function (fileMap, data, callback) {
  var j, i = fileMap.length;
  var callfn = function () {
    i--;
    if (i == 0) {
      callback();
    }
  }
  fileMap.forEach((fm) => {
    if (data[fm.name] !== undefined) {
      fs.writeFile(fm.path, data[fm.name], (err, data) => {
        if (err) throw err;
        callfn();
      })
    } else {
      callfn();
    }
  });
}

var _getSnippetDir = function (store, snippet, version) {
  version = version || 1;
  var store = store
  var id = parseInt(snippet, 36);
  return store + "/" + id + "/" + version
}

var _getLatestVersion = function (store, snippet, callback) {
  var store = store
  var id = parseInt(snippet, 36);
  fs.readdir(store + "/" + id, (err, files) => {
    if (err) throw err;
    var x = files.map( (f) => { return +f}).sort()[files.length - 1]
    callback(x);
  })
}

var _resolvedFileMap = function (dir, fileMap) {
  return Object.keys(fileMap).map((key) => {
    return {
      name : key,
      path : dir + "/" + fileMap[key]
    }
  });
}

Snippet.prototype._loadSnippet = function (snippet, version) {
  var dir = _getSnippetDir(this.config.store, snippet, version);
  var self = this;
  return new Promise((resolve, reject) => {
    fs.stat(dir, (err, stats) => {
      if (err) reject({
        msg : "Unable to locate the requested snippet",
        err : err,
        status : 404
      });
      var map = _resolvedFileMap(dir, self.config.fileNames);
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
  _saveFiles(_resolvedFileMap(dir, this.config.fileNames), data, callback)
}

Snippet.prototype._updateSnippet = function (snippet, version, data, callback) {
  _getLatestVersion(this.config.store, snippet, (latest) => {
    if (version <= latest) {
      version = latest + 1;
      dir = _getSnippetDir(this.config.store, snippet, version);
      mkdirp.sync(dir);
      console.log("directory created" + dir);
      _saveFiles(_resolvedFileMap(dir, this.config.fileNames), data, () => {
          callback(version);
      })
    } else {
      callback(version)
    }
  })
}

Snippet.prototype.load = function (req, res, next) {
  this._loadSnippet(req.params.snippet, req.params.version || 1)
    .then( (data) => {
      res.render("index", data);
    })
    .catch((err) => { next(err) });
}

Snippet.prototype.save = function (req, res) {
  var snippetName = req.params.snippet;
  var snippet;
  if (snippetName == "new") {
    var time = new Date().getTime();
    snippet = time.toString(36);
    var data = _.extend({}, req.body);
    this._createSnippet(snippet, data, () => {
      res.redirect("/"+snippet);
    });
  } else {
    var version = req.params.version || 1;
    var data = _.extend({}, req.body);
    this._updateSnippet(snippetName, version, data, (version) => {
      res.redirect("/" + snippetName + "/" + version);
    });
  }
}

exports.snippet = function (config, cli) {
  return new Snippet(config, cli);
}
