const yaml = require('yamljs');
const utils = require('./utils.js')
const path = require('path')

var convertToRelative = function(relativeTo) {
  return function(val) {
    if (!val.startsWith("/")) {
      val = path.resolve(relativeTo + "/" + val);
    }
    return val;
  }
}

module.exports = function(configPath) {
  if (!configPath.startsWith("/")) {
    configPath = path.resolve("./" + configPath);
  }
  var configFile = configPath + "/config.yaml";
  var config = yaml.load(configFile);
  var pathConvertor = convertToRelative(configPath)
  utils.parseObject(config, {
    templatePath: pathConvertor,
    store: pathConvertor,
    resources: pathConvertor
  });
  return config;
}
