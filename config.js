const yaml = require('yamljs');

var Config = function (configFile) {
  this.config = yaml.load(configFile);
}

Config.prototype = {
  get port() {
    return this.config.port
  },

  get store() {
    return this.config.data.startsWith("/") ? this.config.data
            : __dirname + "/" + this.config.data
  },

  get fileNames() {
    return this.config.fileNames
  },

  get root() {
    return this.config.root ? "/" + this.config.root : ""
  },

  get views() {
    return this.config.views || {
      path : "views",
      index : "index",
      list : "list"
    }
  },

  get static() {
    return this.config.static;
  }
}

exports.loadConfig = function (path) {
  path = path || "."
  var file = path + "/" + "config.yaml";
  return new Config(file);
}
