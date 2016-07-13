const fs = require('fs');
const mkdirp = require('mkdirp');
const _ = require('underscore')
var Snippet = function (config, cli) {
  this.config = config;
  this.cli = cli;
}

var _loadFiles = function (fileMap, callback) {
  var j, i = fileMap.length;
  result = {}
  var callfn = function () {
    i--;
    if (i == 0) {
      callback(result);
    }
  }
  fileMap.forEach((fm) => {
    fs.stat(fm.path, (err, data) => {
      if (err) {
        callfn();
      } else {
        fs.readFile(fm.path, "utf8", (err, data) => {
          if (err) throw err;
          result[fm.name] = data;
          callfn();
        });
      }
    })
  });
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

var _resolvedFileMap = function (dir, fileMap) {
  console.log(fileMap);
  return Object.keys(fileMap).map((key) => {
    return {
      name : key,
      path : dir + "/" + fileMap[key]
    }
  });
}

Snippet.prototype._loadSnippet = function (snippet, version, callback) {
  var dir = _getSnippetDir(this.config.store, snippet, version);
  var self = this;
  fs.stat(dir, (err, stats) => {
    if (err) throw err;
    _loadFiles(_resolvedFileMap(dir, self.config.fileNames), callback)
  })
}

Snippet.prototype._createSnippet = function (snippet, data, callback) {
  var dir = _getSnippetDir(this.config.store, snippet);
  mkdirp.sync(dir);
  console.log("directory created" + dir);
  _saveFiles(_resolvedFileMap(dir, this.config.fileNames), data, callback)
}

Snippet.prototype.index = function (req, res) {
  this._loadSnippet(req.params.snippet, 1, (data) => {
    console.log(data);
    res.render("index", data);
  });
}

Snippet.prototype.version = function (req, res) {
  this._getSnippet(req.params.snippet, req.params.version, res);
}

Snippet.prototype.save = function (req, res) {
  var snippetName = req.params.snippet;
  if (snippetName == "new") {
    var time = new Date().getTime();
    var snippet = time.toString(36);
    console.log("saving");
    console.log(req.body);
    var data = _.extend({}, req.params, req.body);
    console.log(data);
    this._createSnippet(snippet, data, () => {
      res.redirect("/"+snippet);
    });
  }
}

exports.snippet = function (config, cli) {
  return new Snippet(config, cli);
}
