exports.toSentenceCase = function(str) {
  var lstr = str.toLowerCase();
  return lstr[0].toUpperCase() + lstr.substring(1);
}
