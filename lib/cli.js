const program = require('commander');

const options = [
  ['-c, --config <file>', "path of the config file"]
]

module.exports = function(args) {
  program
    .version('0.0.1')
    .usage("[options]")
  options.forEach((option) => {
    console.log(option);
    program.option.apply(program, option)
  });
  program.parse(args);
  return program;
}
