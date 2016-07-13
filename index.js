const express = require('express');
const bodyParser = require('body-parser')
const cli = require('./cli.js').process(process.argv)
const config = require('./config.js').loadConfig(cli.config)
const site = require('./site.js').site(config, cli)
const snippet = require('./snippet.js').snippet(config, cli);
var app = express();
console.log(config);

app.use(express.static('www'))
app.use(bodyParser.urlencoded());
app.set('views', './views')
app.set('view engine', 'pug');

app.get('/', site.index);
app.route('/:snippet').get(snippet.index.bind(snippet)).post(snippet.save.bind(snippet))
app.get('/:snippet/:version', snippet.version.bind(snippet)).post(snippet.save.bind(snippet))

app.listen(config.port, function () {
  console.log('Example app listening on port ' + config.port);
});
