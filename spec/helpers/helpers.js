const marked = require("marked");
const fs = require('fs')
exports.customMatchers = {
  toHaveKeys: function(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        if (typeof actual !== "object") {
          return {
            message: "invalid keys check on a non object",
            pass: false
          }
        }
        if (Object.keys(actual).length === expected) {
          return {
            pass: true
          }
        }
        return {
          pass: false,
          message: "expected object to have " + expected +
            " keys but found " + Object.keys(actual).length
        }
      }
    }
  },
  equalsFileContents: function(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        var expectedData = fs.readFileSync(expected, "utf-8");
        if (actual === expectedData) {
          return {
            pass: true
          }
        }
        return {
          pass: false,
          message: "expected " + actual + " to equal " + expectedData
        }
      }
    }
  },
  equalsMarkedHTML: function(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        var expectedData = marked(fs.readFileSync(expected, "utf-8"));
        if (actual === expectedData) {
          return {
            pass: true
          }
        }
        return {
          pass: false,
          message: "expected " + actual + " to equal " + expectedData
        }
      }
    }
  },
  fileCount: function(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        try {
          var files = fs.readdirSync(actual);
          if (files.length == expected) {
            return {
              pass: true
            }
          }
          return {
            pass: false,
            message: `expected ${expected} files in ${actual} but found ${files.length}`
          }
        } catch (e) {
          return {
            pass: false,
            message: e
          }
        }
      }
    }
  },
  fileExists: function(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        try {
          var stat = fs.statSync(actual)
          if (stat != null) {
            return {
              pass: true
            }
          }
        } catch (e) {
          return {
            pass: false,
            message: "file ${actual} doesn't exists"
          }
        }
      }
    }
  }
}
