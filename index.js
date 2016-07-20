const express = require('express');
const bodyParser = require('body-parser')
const cli = require('./cli.js').process(process.argv)
const config = require('./config.js').loadConfig(cli.config)
const site = require('./site.js').site(config, cli)
const snippet = require('./snippet.js').snippet(config, cli);
var app = express();
console.log(config);
var configPath = (cli.config || ".");
console.log(configPath)
var root = config.root + "/"

app.use(express.static('www'))
if (config.resources) {
  app.use(root, express.static(configPath + "/" + config.resources))
}
app.use(bodyParser.urlencoded());
app.set('views', configPath + "/" + config.views.path)
app.set('view engine', 'pug');
app.get(root, (req, res) => {
  return site.index(req, res);
});
app.get(root + 'list', snippet.list.bind(snippet));
app.route(root + ':snippet').get(snippet.load.bind(snippet)).post(snippet.save.bind(snippet))
app.route(root + ':snippet/:version').get(snippet.load.bind(snippet)).post(snippet.save.bind(snippet))

app.use(function(err, req, res, next) {
  console.error(err);
  if (err.err) {
    console.error(err.err.stack);
  }
  res.status(err.status).send(err.msg);
});
app.listen(config.port, function () {
  console.log('Example app listening on port ' + config.port);
});
