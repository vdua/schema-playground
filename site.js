
var Site = function () {

}

Site.prototype.index = function (req, res) {
  res.render('index')
}

exports.site = function (config, cli) {
  return new Site();
}
