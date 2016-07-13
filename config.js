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
  }
}

exports.loadConfig = function (file) {
  var file = file || "config.yaml";
  return new Config(file);
}
