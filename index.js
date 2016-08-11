const express = require('express');
const bodyParser = require('body-parser')
const cli = require('./lib/cli.js')
const config = require('./lib/config.js')
const presenterRouter = require('./lib/routers/presenterRouter.js')
const morgan = require('morgan')
const fs = require('fs');

const app = express();
var arguments = cli(process.argv);
var appConfig = config(arguments.config);
var views = ["views"]
if (appConfig.templatePath) {
  views.unshift(appConfig.templatePath)
}
// set views
app.set('views', views)
app.set('view engine', 'pug');

// set request logger
var accessLogStream = fs.createWriteStream(arguments.config + '/access.log', {
  flags: 'a'
})
app.use(morgan(':method :url  - :status :response-time ms', {
  stream: accessLogStream
}));

// set static files
app.use(express.static('www'))
if (appConfig.resources) {
  app.use(appConfig.resourcesRoot, express.static(appConfig.resources))
}
app.use(bodyParser.urlencoded());
app.use("/presenter", presenterRouter(appConfig.presenters))

app.use(function(err, req, res, next) {
  console.error(err);
  if (err.err) {
    console.error(err.err.stack);
  }
  res.status(err.status).send(err.msg);
});
app.listen(appConfig.port, function() {
  console.log('Example app listening on port ' + appConfig.port);
});
