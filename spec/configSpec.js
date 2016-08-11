var config = require("../lib/config.js")
var path = require("path")
describe("config test suite", function() {
  it("config1 test", function() {
    var expected = {
      port: 8082,
      templatePath: path.resolve("spec/collateral/config1/views"),
      presenters: {
        p1: {
          store: path.resolve("spec/collateral/config1/data"),
          templates: {
            index: "index",
            tutorial: "tutorial"
          },
          data: {
            x: "x",
            y: "y",
            z: "z"
          }
        }
      }
    };
    var actual = config("spec/collateral/config1");
    expect(actual).toEqual(expected);
  })
})
