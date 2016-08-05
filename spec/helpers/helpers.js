const marked = require("marked");
const fs = require('fs')
exports.customMatchers = {
  toHaveKeys : function (util, customEqualityTesters) {
    return {
      compare : function (actual, expected) {
        if (typeof actual !== "object") {
          return {
            message : "invalid keys check on a non object",
            pass : false
          }
        }
        if (Object.keys(actual).length === expected) {
          return {
            pass : true
          }
        }
        return {
          pass : false,
          message :"expected object to have " + expected +
            " keys but found " + Object.keys(actual).length
        }
      }
    }
  },
  equalsFileContents : function (util, customEqualityTesters) {
    return {
      compare : function (actual, expected) {
        var expectedData = fs.readFileSync(expected, "utf-8");
        if (actual === expectedData) {
          return {
            pass : true
          }
        }
        return {
          pass : false,
          message : "expected " + actual + " to equal " + expectedData
        }
      }
    }
  },
  equalsMarkedHTML : function (util, customEqualityTesters) {
    return {
      compare : function (actual, expected) {
        var expectedData = marked(fs.readFileSync(expected, "utf-8"));
        if (actual === expectedData) {
          return {
            pass : true
          }
        }
        return {
          pass : false,
          message : "expected " + actual + " to equal " + expectedData
        }
      }
    }
  }
}
