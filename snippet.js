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

var _getLatestVersion = function (store, snippet, callback) {
  var store = store
  var id = parseInt(snippet, 36);
  fs.readdir("/Users/vdua/work/ajvplayground/data/1468431141274", (err, files) => {
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

Snippet.prototype.load = function (req, res) {
  this._loadSnippet(req.params.snippet, req.params.version || 1, (data) => {
    res.render("index", data);
  });
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
