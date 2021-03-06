const express = require('express');
const bodyParser = require('body-parser')
const cli = require('./cli.js').process(process.argv)
const config = require('./config.js').loadConfig(cli.config)
const site = require('./site.js').site(config, cli)
const snippet = require('./snippet.js').snippet(config, cli);
const tutorial = require('./tutorial.js').tutorial(config, cli);
const morgan = require('morgan')
const fs = require('fs');
var app = express();
console.log(config);
var configPath = (cli.config || ".");
var root = config.root + "/"
var accessLogStream = fs.createWriteStream(configPath + '/access.log', {
  flags: 'a'
})
app.use(morgan(':method :url  - :status :response-time ms', {
  stream: accessLogStream
}));
app.use(express.static('www'))
if (config.static) {
  console.log(config.static);
  app.use(config.static.root, express.static(configPath + "/" + config.static.path))
}
app.use(bodyParser.urlencoded());
var views = ["views"]
if (config.views.path) {
  views.unshift(configPath + "/" + config.views.path)
}
app.set('views', views)
app.set('view engine', 'pug');
app.get(root, (req, res) => {
  return site.index(req, res);
});
app.get(root + 'list', snippet.list.bind(snippet));

app.post(root + "tutorial", tutorial.save.bind(tutorial));
app.route(root + "tutorial/:tutname/edit")
  .get(tutorial.edit.bind(tutorial))
  .post(tutorial.save.bind(tutorial))
app.get(root + "tutorial/:tutname", tutorial.load.bind(tutorial));
app.route(root + ':snippet/zip').get(snippet.export.bind(snippet))
app.route(root + ':snippet.:ext?').get(snippet.load.bind(snippet)).post(
  snippet.save.bind(
    snippet))
app.route(root + ':snippet/:version.:ext?').get(snippet.load.bind(snippet)).post(
  snippet.save.bind(snippet))
app.use(function(err, req, res, next) {
  console.error(err);
  if (err.err) {
    console.error(err.err.stack);
  }
  res.status(err.status).send(err.msg);
});
app.listen(config.port, function() {
  console.log('Example app listening on port ' + config.port);
});
