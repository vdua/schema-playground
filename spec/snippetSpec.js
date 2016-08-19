const snippet = require("../lib/modules/snippet.js");
const path = require("path");
const fs = require('fs');
const helpers = require('./helpers/helpers.js')
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
describe("Snippet Suite", function() {
  var oneFileSnippet, multiFileSnippet, markdownFileSnippet,
    writableSnippet, txtFileSnippet, defaultContentSnippet;

  beforeEach(function() {
    oneFileSnippet = snippet.newSnippet({
      store: path.resolve("spec/collateral/data1"),
      data: {
        "form": "form.json"
      }
    });
    defaultContentSnippet = snippet.newSnippet({
      store: path.resolve("spec/collateral/data1"),
      data: {
        "form": "form.json",
        "test" : "test.json"
      },
      defaults : {
        "test" : '"This is the default content"'
      }
    });
    multiFileSnippet = snippet.newSnippet({
      store: path.resolve("spec/collateral/data2"),
      data: {
        "form": "form.json",
        "test": "test.json"
      }
    });
    markdownFileSnippet = snippet.newSnippet({
      store: path.resolve("spec/collateral/data3"),
      data: {
        "form": "form.json",
        "test": "test.json",
        "description": "description.md"
      }
    });
    txtFileSnippet = snippet.newSnippet({
      store: path.resolve("spec/collateral/data4"),
      data: {
        "schema": "schema.json",
        "test": "test.json",
        "title": "title.txt"
      }
    });
    writableSnippet = snippet.newSnippet({
      store: path.resolve("tmp"),
      data: {
        "form": "form.json",
        "test": "test.json",
        "description": "description.md"
      }
    })
    jasmine.addMatchers(helpers.customMatchers);
  })
  it("test 1", function() {
    expect(oneFileSnippet.store).toEqual(path.resolve(
      "spec/collateral/data1"));
    expect(oneFileSnippet.data.form).toEqual("form.json")
  });

  it("queryLatestVersion test 1", function(done) {
    var directory = 150;
    var snippetName = directory.toString(36)
    oneFileSnippet.queryLatestVersion(snippetName).then((version) => {
      expect(version).toEqual(3)
      done();
    }).catch((err) => {
      expect(err).toBeUndefined();
      done();
    })
  });

  it("queryLatestVersion test 2", function(done) {
    var directory = 147;
    var snippetName = directory.toString(36)
    oneFileSnippet.queryLatestVersion(snippetName).then((version) => {
      expect(version).toEqual(0);
      done();
    }).catch((err) => {
      expect(err).toBeUndefined();
      done();
    })
  })

  it("queryLatestVersion test 3", function(done) {
    var directory = 151;
    var snippetName = directory.toString(36)
    oneFileSnippet.queryLatestVersion(snippetName).then((version) => {
      expect(version).toEqual(1)
      done();
    }).catch((err) => {
      expect(err).toBeUndefined();
      done();
    })
  })

  // default version number
  it("_getFileMap test 1", function() {
    var directory = 150;
    var snippetName = directory.toString(36)
    var fileMap = oneFileSnippet._getFileMap(snippetName)
    expect(fileMap.length).toEqual(2);
    expect(fileMap[0]).toEqual({
      name: "form",
      path: path.resolve("spec/collateral/data1/150/1/form.json")
    });
    expect(fileMap[1]).toEqual({
      name: "formConfig",
      path: path.resolve(
        "spec/collateral/data1/150/1/formConfig.json")
    })
  });

  // passing version number
  it("_getFileMap test 2", function() {
    var directory = 150;
    var snippetName = directory.toString(36)
    var fileMap = oneFileSnippet._getFileMap(snippetName, 2)
    expect(fileMap.length).toEqual(2);
    expect(fileMap[0]).toEqual({
      name: "form",
      path: path.resolve("spec/collateral/data1/150/2/form.json")
    });
    expect(fileMap[1]).toEqual({
      name: "formConfig",
      path: path.resolve(
        "spec/collateral/data1/150/2/formConfig.json")
    })
  });

  // extra files are ignored
  it("_getFileMap test 3", function() {
    var directory = 151;
    var snippetName = directory.toString(36)
    var fileMap = oneFileSnippet._getFileMap(snippetName, 2)
    expect(fileMap.length).toEqual(2);
    expect(fileMap[0]).toEqual({
      name: "form",
      path: path.resolve("spec/collateral/data1/151/2/form.json")
    });
    expect(fileMap[1]).toEqual({
      name: "formConfig",
      path: path.resolve(
        "spec/collateral/data1/151/2/formConfig.json")
    })
  });

  // multi file snippet
  it("_getFileMap test 4", function() {
    var directory = 151;
    var snippetName = directory.toString(36)
    var fileMap = multiFileSnippet._getFileMap(snippetName, 1)
    expect(fileMap.length).toEqual(4);
    expect(fileMap[0]).toEqual({
      name: "form",
      path: path.resolve("spec/collateral/data2/151/1/form.json")
    });
    expect(fileMap[1]).toEqual({
      name: "test",
      path: path.resolve("spec/collateral/data2/151/1/test.json")
    });
    expect(fileMap[2]).toEqual({
      name: "formConfig",
      path: path.resolve(
        "spec/collateral/data2/151/1/formConfig.json")
    })
    expect(fileMap[3]).toEqual({
      name: "testConfig",
      path: path.resolve(
        "spec/collateral/data2/151/1/testConfig.json")
    })
  });

  //single file spec
  it("_loadData test 1", function(done) {
    var directory = 150;
    var snippetName = directory.toString(36)
    var fileMap = oneFileSnippet._getFileMap(snippetName, 1);
    oneFileSnippet._loadData(fileMap).then((values) => {
      expect(values.length).toEqual(2);
      var data = fs.readFileSync(path.resolve(
        "spec/collateral/data1/150/1/form.json"), 'utf-8')
      expect(values[0]).toEqual(data);
      expect(values[1]).toBeUndefined()
      done();
    }).catch((err) => {
      console.log(err);
    })
  })

  //single file spec no file exists
  it("_loadData test 2", function(done) {
    var directory = 150;
    var snippetName = directory.toString(36)
    var fileMap = oneFileSnippet._getFileMap(snippetName, 4);
    oneFileSnippet._loadData(fileMap).then((values) => {
      expect(values.length).toEqual(2);
      expect(values[0]).toBeUndefined();
      expect(values[1]).toBeUndefined()
      done();
    }).catch((err) => {
      console.error(err);
    })
  })

  //single file spec extra file
  it("_loadData test 3", function(done) {
    var directory = 151;
    var snippetName = directory.toString(36)
    var fileMap = oneFileSnippet._getFileMap(snippetName);
    oneFileSnippet._loadData(fileMap).then((values) => {
      expect(values.length).toEqual(2);
      expect(values[0]).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data1/151/1/form.json")).toString())
      expect(values[1]).toBeUndefined();
      done();
    }).catch((err) => {
      console.error(err);
    })
  })

  //single file spec with Config
  it("_loadData test 4", function(done) {
    var directory = 150;
    var snippetName = directory.toString(36)
    var fileMap = oneFileSnippet._getFileMap(snippetName, 3);
    oneFileSnippet._loadData(fileMap).then((values) => {
      expect(values.length).toEqual(2);
      expect(values[0]).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data1/150/3/form.json")).toString())
      expect(values[1]).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data1/150/3/formConfig.json")).toString())
      done();
    }).catch((err) => {
      console.error(err);
    })
  })

  //multiple file spec
  it("_loadData test 4", function(done) {
    var directory = 151;
    var snippetName = directory.toString(36)
    var fileMap = multiFileSnippet._getFileMap(snippetName);
    multiFileSnippet._loadData(fileMap).then((values) => {
      expect(values.length).toEqual(4);
      expect(values[0]).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data2/151/1/form.json")).toString())
      expect(values[1]).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data2/151/1/test.json")).toString())
      expect(values[2]).toBeUndefined();
      expect(values[3]).toBeUndefined();
      done()
    }).catch((err) => {
      console.error(err);
    })
  })

  //multiple file spec missing file
  it("_loadData test 5", function(done) {
    var directory = 151;
    var snippetName = directory.toString(36)
    var fileMap = multiFileSnippet._getFileMap(snippetName, 2);
    multiFileSnippet._loadData(fileMap).then((values) => {
      expect(values.length).toEqual(4);
      expect(values[0]).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data2/151/2/form.json")).toString())
      expect(values[1]).toBeUndefined();
      expect(values[2]).toBeUndefined();
      expect(values[3]).toBeUndefined();
      done();
    }).catch((err) => {
      console.error(err);
    })
  })

  //markdown file spec
  it("_loadData test 6", function(done) {
    var directory = 151;
    var snippetName = directory.toString(36)
    var fileMap = markdownFileSnippet._getFileMap(snippetName, 1);
    markdownFileSnippet._loadData(fileMap).then((values) => {
      expect(values.length).toEqual(6);
      expect(values[0]).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data3/151/1/form.json")).toString())
      expect(values[1]).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data3/151/1/test.json")).toString())
      expect(values[2]).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data3/151/1/description.md")).toString())
      expect(values[3]).toBeUndefined();
      expect(values[4]).toBeUndefined();
      expect(values[5]).toBeUndefined();
      done();
    }).catch((err) => {
      console.error(err);
    })
  });

  //single file spec
  it("loadSnippet test 1", function(done) {
    var directory = 150;
    var snippetName = directory.toString(36)
    oneFileSnippet.loadSnippet(snippetName).then((result) => {
      expect(Object.keys(result).length).toEqual(1);
      expect(result.data.form).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data1/150/1/form.json"), 'utf-8'));
      expect(result.data.formConfig).toBeUndefined();
      expect(Object.keys(result.data).length).toEqual(2);
      done();
    }).catch((err) => {
      console.log(err);
    })
  })

  //single file spec no file exists
  it("loadSnippet test 2", function(done) {
    var directory = 150;
    var snippetName = directory.toString(36)
    oneFileSnippet.loadSnippet(snippetName, 4).then((result) => {}).catch(
      (err) => {
        expect(err.msg).toEqual(
          "Unable to locate the requested snippet");
        done();
      })
  })

  //single file spec extra file
  it("loadSnippet test 3", function(done) {
    var directory = 151;
    var snippetName = directory.toString(36)
    oneFileSnippet.loadSnippet(snippetName).then((result) => {
      expect(Object.keys(result).length).toEqual(1);
      expect(result.data.form).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data1/151/1/form.json"), "utf-8"));
      expect(result.data.formConfig).toBeUndefined();
      expect(Object.keys(result.data).length).toEqual(2);
      done();
    }).catch((err) => {
      console.error(err);
    })
  })

  //single file spec with Config
  it("loadSnippet test 4", function(done) {
    var directory = 150;
    var snippetName = directory.toString(36)
    oneFileSnippet.loadSnippet(snippetName, 3).then((result) => {
      expect(Object.keys(result).length).toEqual(1);
      expect(result.data.form).toEqual(fs.readFileSync(path.resolve(
        "spec/collateral/data1/150/3/form.json"), "utf-8"));
      expect(result.data.formConfig).toEqual(fs.readFileSync(path.resolve(
          "spec/collateral/data1/150/3/formConfig.json"),
        "utf-8"))
      expect(Object.keys(result.data).length).toEqual(2);
      done();
    }).catch((err) => {
      console.error(err);
    })
  })

  //multiple file spec
  it("loadSnippet test 5", function(done) {
    var directory = 151;
    var snippetName = directory.toString(36)
    multiFileSnippet.loadSnippet(snippetName).then((result) => {
      var filePath = [multiFileSnippet.store, directory, 1].join(
        "/")
      expect(result.data.form).equalsFileContents([filePath,
        "form.json"
      ].join("/"))
      expect(result.data.test).equalsFileContents([filePath,
        "test.json"
      ].join("/"))
      expect(result.data.formConfig).toBeUndefined();
      expect(result.data.testConfig).toBeUndefined();
      expect(result.data).toHaveKeys(4)
      done()
    }).catch((err) => {
      console.error(err);
    })
  })

  //multiple file spec missing file
  it("loadSnippet test 6", function(done) {
    var directory = 151;
    var snippetName = directory.toString(36)
    var snippet = multiFileSnippet;
    var version = 2
    snippet.loadSnippet(snippetName, version).then((result) => {
      var filePath = [snippet.store, directory, version].join("/")
      expect(result.data.form).equalsFileContents([filePath,
        "form.json"
      ].join("/"))
      expect(result.data.formConfig).toBeUndefined();
      expect(result.data.testConfig).toBeUndefined()
      expect(result.data.test).toBeUndefined()
      expect(result.data).toHaveKeys(4)
      done();
    }).catch((err) => {
      console.error(err);
    })
  })

  //markdown file spec
  it("loadSnippet test 7", function(done) {
    var directory = 151;
    var snippetName = directory.toString(36)
    markdownFileSnippet.loadSnippet(snippetName).then((result) => {
      expect(result.data).toHaveKeys(7);
      var filePath = [markdownFileSnippet.store, directory, 1].join(
        "/")
      expect(result.data.form).equalsFileContents([filePath,
        "form.json"
      ].join("/"))
      expect(result.data.test).equalsFileContents([filePath,
        "test.json"
      ].join("/"))
      expect(result.data.description).equalsFileContents([filePath,
        "description.md"
      ].join("/"))
      expect(result.data.formConfig).toBeUndefined()
      expect(result.data.testConfig).toBeUndefined()
      expect(result.data.descriptionConfig).toBeUndefined()
      expect(result.data.htmlDescription).equalsMarkedHTML([
        filePath, "description.md"
      ].join("/"))
      done();
    }).catch((err) => {
      console.error(err);
    })
  });

  // Text File Snippet
  it("loadSnippet test 8", function(done) {
    var directory = 152;
    var snippetName = directory.toString(36)
    txtFileSnippet.loadSnippet(snippetName).then((result) => {
      var filePath = [txtFileSnippet.store, directory, 1].join(
        "/")
      expect(result.data).toHaveKeys(6);
      expect(result.data.title).equalsFileContents([filePath,
        "title.txt"
      ].join("/"))
      done();
    })
  });

  //updating non existent snippet
  it("_updateSnippet test 1", function(done) {
    var directory = 147;
    var snippetName = directory.toString(36);
    writableSnippet._updateSnippet(snippetName, {
      form: "form"
    }).then(() => {
      console.log("error case");
    }).catch((e) => {
      expect(e.msg).toEqual(
        `unable to find the latest version of ${snippetName}`)
      done();
    })
  });

  //updating to a latest version
  it("_updateSnippet test 2", function(done) {
    var directory = 147;
    var snippetName = directory.toString(36);
    mkdirp.sync(`tmp/${directory}`);
    writableSnippet._updateSnippet(snippetName, {
      form: "form"
    }).then((version) => {
      expect(version).toEqual(1);
      expect(`tmp/${directory}/1/form.json`).fileExists();
      rimraf.sync(`tmp/${directory}`);
      done();
    }).catch((e) => {
      console.error(e);
    })
  })

  //checking extra files are not created
  it("_updateSnippet test 3", function(done) {
    var directory = 147;
    var snippetName = directory.toString(36);
    mkdirp.sync(`tmp/${directory}`);
    writableSnippet._updateSnippet(snippetName, {
      form: "form"
    }, 1).then(() => {
      expect(`tmp/${directory}/1/test.json`).not.fileExists();
      rimraf.sync(`tmp/${directory}`);
      done();
    }).catch((e) => {
      console.error(e);
    })
  })

  //checking data on update
  it("_updateSnippet test 4", function(done) {
    var directory = 147;
    var snippetName = directory.toString(36);
    mkdirp.sync(`tmp/${directory}`);
    writableSnippet._updateSnippet(snippetName, {
      form: "form"
    }).then(() => {
      expect("form").equalsFileContents(
        `tmp/${directory}/1/form.json`)
      rimraf.sync(`tmp/${directory}`);
      done();
    }).catch((e) => {
      console.error(e);
    })
  })

  // passing empty string should not create any file
  it("_updateSnippet test 5", function(done) {
    var directory = 147;
    var snippetName = directory.toString(36);
    mkdirp.sync(`tmp/${directory}`);
    writableSnippet._updateSnippet(snippetName, {
      form: "form",
      test: ""
    }).then(() => {
      expect("form").equalsFileContents(
        `tmp/${directory}/1/form.json`)
      expect(`tmp/${directory}/1/`).fileCount(1)
      rimraf.sync(`tmp/${directory}`);
      done();
    }).catch((e) => {
      console.error(e);
    })
  })

  //passing more snippet data creates files
  it("_updateSnippet test 6", function(done) {
    var directory = 147;
    var snippetName = directory.toString(36);
    mkdirp.sync(`tmp/${directory}`);
    writableSnippet._updateSnippet(snippetName, {
      form: "form",
      test: "test",
      description: "description",
      extra: "extra"
    }).then(() => {
      expect("test").equalsFileContents(
        `tmp/${directory}/1/test.json`)
      expect(`tmp/${directory}/1/`).fileCount(3)
      rimraf.sync(`tmp/${directory}`);
      done();
    }).catch((e) => {
      console.error(e);
    })
  })

  //updating an existing version
  it("_updateSnippet test 7", function(done) {
    var directory = 147;
    var snippetName = directory.toString(36);
    mkdirp.sync(`tmp/${directory}`);
    writableSnippet._updateSnippet(snippetName, {
      form: "form",
      test: "test",
      description: "description",
      extra: "extra"
    }).then(() => {
      writableSnippet._updateSnippet(snippetName, {
        form: "form"
      }).then((version) => {
        expect(version).toEqual(2);
        expect(`tmp/${directory}/2/form.json`).fileExists();
        expect(`tmp/${directory}/2`).fileCount(1);
        expect(`tmp/${directory}/4`).not.fileExists();
        rimraf.sync(`tmp/${directory}`);
        done();
      })
    }).catch((e) => {
      console.error(e);
    })
  });

  it("saveSnippet test 1", function(done) {
    var directory = 147;
    var snippetName = directory.toString(36);
    writableSnippet.saveSnippet(snippetName, {
      form: "form"
    }).then((version) => {
      expect(version).toEqual(1);
      done();
    }).catch((e) => {})
  });

  it("saveSnippet test 2", function(done) {
    var directory = 147;
    var snippetName = directory.toString(36);
    writableSnippet.saveSnippet(snippetName, {
      form: "form"
    }).then((version) => {
      expect(version).toEqual(2);
      rimraf.sync(`tmp/${directory}`);
      done();
    }).catch((e) => {})
  });

  it("listSnippet test 1", function(done) {
    oneFileSnippet.listSnippets().then(
      (snippets) => {
        expect(snippets.length).toEqual(3)
        done();
      }
    )
  });

  it("listSnippet test 1", function(done) {
    oneFileSnippet.listSnippets().then(
      (snippets) => {
        expect(snippets).toEqual([147, 150, 151].map((x) => {
          return x.toString(36)
        }));
        done();
      }
    )
  })

  it("default content test 1", function (done) {
    var directory = 150;
    var snippetName = directory.toString(36)
    defaultContentSnippet.loadSnippet(snippetName).then((result) => {
      var filePath = [defaultContentSnippet.store, directory, 1].join(
        "/")
      expect(result.data).toHaveKeys(4);
      expect(result.data.form).equalsFileContents([filePath,
        "form.json"
      ].join("/"))
      expect(result.data.test).toEqual(defaultContentSnippet.defaults.test)
      done();
    }).catch((err) => {
      console.log(err);
    })
  });

  it("default content test 2", function (done) {
    var directory = 151;
    var snippetName = directory.toString(36)
    defaultContentSnippet.loadSnippet(snippetName).then((result) => {
      var filePath = [defaultContentSnippet.store, directory, 1].join(
        "/")
      expect(result.data).toHaveKeys(4);
      expect(result.data.form).equalsFileContents([filePath,
        "form.json"
      ].join("/"))
      expect(result.data.test).equalsFileContents([filePath,
        "test.json"
      ].join("/"))
      done();
    }).catch((err) => {
      console.log(err);
    })
  });

})
