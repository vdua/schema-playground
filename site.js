
var Site = function (config) {
  this.config = config;
}

Site.prototype.index = function (req, res) {
  res.render(this.config.views.index)
}

exports.site = function (config, cli) {
  return new Site(config);
}
