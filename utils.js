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
