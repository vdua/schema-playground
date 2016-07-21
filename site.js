
var Site = function (config) {
  this.config = config;
}

Site.prototype.index = function (req, res) {
  res.render(this.config.views.index, {snippetUrl : this.config.root + "/new", snippet : {}})
}

exports.site = function (config, cli) {
  return new Site(config);
}
