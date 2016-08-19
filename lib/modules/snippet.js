const fs = require('fs');
const mkdirp = require('mkdirp');
const _ = require('underscore')
const marked = require('marked')
const utils = require('../utils.js')
const AdmZip = require('adm-zip');
const path = require('path');
var Snippet = function({
  store, data, defaults
}) {
  this.store = store;
  this.data = data;
  this.defaults = defaults;
}

Snippet.prototype.queryLatestVersion = function(snippetName) {
  var self = this;
  var promiseHandler = function(resolve, reject) {
    fs.readdir(utils.getDir(self.store, snippetName), (err, files) => {
      if (err) return reject({
        err: err,
        msg: "snippet doesn't exist",
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

Snippet.prototype._getFileMap = function(snippetName, version = 1) {
  var dir = utils.getDir(this.store, snippetName),
    fileMap = this.data;
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
        path: path.resolve([dir, version, d.name + "Config.json"].join(
          "/"))
      }
    })
  )
}

Snippet.prototype.loadSnippet = function(snippetName, version = 1) {
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
            var fm = fileMap[index];
            result[fm.name] = d;
            var match = fm.path.match(/\.([^.]+)$/);
            if (match != null && match.length == 2) {
              var ext = match[1];
              if (ext == "md" || ext == "markdown") {
                result["html" + utils.toSentenceCase(fm.name)] =
                  marked(d);
              }
            }
          });
          if (self.defaults) {
            Object.keys(self.data).forEach(function (key) {
              if (result[key] === undefined && self.defaults.hasOwnProperty(key)) {
                result[key] = self.defaults[key];
              }
            })
          }
          resolve({
            data: result,
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

Snippet.prototype.newSnippet = function () {
  var self = this;
  return new Promise((resolve, reject) => {
    var slide = _.extend({}, self.defaults);
    resolve({
      data: slide
    })
  });
};

Snippet.prototype._updateSnippet = function(snippetName, data) {
  if (typeof snippetName !== "string" || typeof data !== "object") {
    throw "invalid arguments passed";
  }
  var self = this;
  var promiseHandler = function(resolve, reject) {
    self.queryLatestVersion(snippetName).then((latestVersion) => {
      var version = latestVersion + 1;
      mkdirp.sync(utils.getDir(self.store, snippetName) + "/" + version);
      var fileMap = self._getFileMap(snippetName, version);
      Promise.all(fileMap.map((fm) => {
        if (data[fm.name] == null || typeof data[fm.name] !==
          "string" || data[fm.name].length === 0) {
          return utils.resolvedPromise()
        } else {
          return utils.writeToFile(fm.path, data[fm.name])
        }
      })).then(() => {
        resolve(version)
      }).catch((err) => {
        reject({
          err: err,
          msg: "unable to update the " + snippetName,
          status: 500
        })
      });
    }).catch((err) => {
      reject({
        err: err,
        msg: `unable to find the latest version of ${snippetName}`,
        status: 500
      })
    })
  }
  return new Promise(promiseHandler);
};

Snippet.prototype.saveSnippet = function(snippetName, data) {
  var dir = utils.getDir(this.store, snippetName);
  var self = this;
  var promiseHandler = function(resolve, reject) {
    utils.fileExists(dir).then(() => {
      self._updateSnippet(snippetName, data).then(resolve).catch(
        reject);
    }).catch(() => {
      mkdirp.sync(dir);
      self._updateSnippet(snippetName, data).then(resolve).catch(
        reject);
    })
  }
  return new Promise(promiseHandler);
};

Snippet.prototype.listSnippets = function() {
  var self = this;
  return new Promise((resolve, reject) => {
    fs.readdir(self.store, (err, files) => {
      if (err) {
        reject({
          err: err,
          msg: "no snippets exist",
          status: 404
        });
      }
      resolve(files.map((file) => {
        return (+file).toString(36)
      }))
    })
  })
  return new Promise(promiseHandler);
};

Snippet.prototype.export = function(snippetName) {
  return new Promise((resolve, reject) => {
    var dir = utils.getDir(this.store, snippetName);
    utils.addDirToZip(path.resolve(dir), path.resolve(dir, ".."), zip)
      .then(() => {
        zip.toBuffer(function(buffer) {
          resolve(buffer);
        });
      })
      .catch(reject)
  })
};

exports.newSnippet = function({
  store, data, defaults
}) {
  return new Snippet({
    store, data, defaults
  })
}
