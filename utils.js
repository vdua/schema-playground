const fs = require('fs');
const path = require('path')
exports.toSentenceCase = function(str) {
  var lstr = str.toLowerCase();
  return lstr[0].toUpperCase() + lstr.substring(1);
}

exports.getFileNameAndExtension = function(filePath) {
  var lastSlash = filePath.lastIndexOf("/");
  if (lastSlash > -1) {
    var fileName = filePath.substring(lastSlash + 1);
    var filePath = filePath.substring(0, lastSlash) + "/";
  } else {
    fileName = filePath;
    filePath = "";
  }
  var ext = "";
  var x = fileName.match(/(.+)(?:\.([^.]+))$/);
  if (x) {
    ext = x[2];
    fileName = filePath + x[1];
  } else {
    fileName = filePath + fileName;
  }
  return {
    name: fileName,
    ext: ext
  }
}

exports.getDir = function(store, name) {
  return store + "/" + parseInt(name, 36);
}

exports.getLatestVersion = function(store, snippet) {
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

exports.fileExists = function(filename) {
  return new Promise((resolve, reject) => {
    fs.stat(filename, (err, stats) => {
      if (err) {
        reject({
          msg: "Unable to locate the requested snippet",
          err: err,
          status: 404
        });
      }
      resolve(stats);
    })
  })
}

exports.writeToFile = function(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) {
        console.log(err);
        return reject({
          msg: "Error writing file " + file,
          err: err,
          status: 500
        });
      }
      resolve()
    })
  });
}

exports.readFile = function(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        return reject({
          filename: file,
          err: err,
          status: 500
        });
      }
      resolve(data);
    });
  })
}

exports.join = function(sep) {
  return [].slice.call(arguments, 1).filter(function(e) {
    return e != null
  }).join(sep)
}

var addDirToZip = function (dir, rootDir, zip) {
  var entryName = dir.replace(rootDir+"\\", "");
  zip.addFile(entryName + "/", new Buffer(0));
  var promiseHandler = function (resolve, reject) {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err);
      var promises = []
      files.forEach((file) => {
        var filePath = dir + "/" + file
        if (fs.statSync(filePath).isDirectory()) {
          promises.push(addDirToZip(filePath, rootDir, zip));
        } else {
          entryName = filePath.replace(rootDir+"\\", "");
          var data = fs.readFileSync(filePath);
          zip.addFile(entryName, data, "", 0644 << 16);
        }
      });
      Promise.all(promises).then(resolve).catch(reject);
    })
  }
  return new Promise(promiseHandler);
}

exports.resolvedPromise = function () {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

exports.rejectedPromise = function () {
  return new Promise((resolve, reject) => {
    reject();
  });
}

exports.fileExists = function (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) reject(err);
      resolve(stats);
    })
  })
}

exports.INTEGER_COMPARISON = function(a, b) {
  return a - b;
}

exports.addDirToZip = addDirToZip;
