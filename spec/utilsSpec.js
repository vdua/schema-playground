var utils = require('../lib/utils.js');

describe('utils spec', function() {
  var obj, obj1, convertor1;
  beforeEach(function() {
    obj = {
      test: 1
    };
    obj1 = {
      test: 1,
      replace: 2
    };
    convertor1 = {
      replace: function(val) {
        return val * 2;
      }
    }
    spyOn(convertor1, "replace").and.callThrough()
  })

  it("parseObject with non object parameter", function() {
    expect(utils.parseObject("foo bar")).toEqual("foo bar")
  })

  it("parseObject without a convertor", function() {
    expect(utils.parseObject(obj)).toEqual(obj)
  });

  it("parseObject conversion is inline", function() {
    expect(utils.parseObject(obj)).toBe(obj)
  });

  it("parseObject convertor gets called", function() {
    utils.parseObject(obj1, convertor1);
    expect(convertor1.replace).toHaveBeenCalled()
  });

  it("parseObject convertor gets called with correct value", function() {
    utils.parseObject(obj1, convertor1);
    expect(convertor1.replace).toHaveBeenCalledWith(2)
  });

  it("parseObject object gets replaced", function() {
    var newObj = utils.parseObject(obj1, convertor1);
    expect(newObj.replace).toBe(4);
  });

  it("parseObject object gets replaced inline", function() {
    var newObj = utils.parseObject(obj1, convertor1);
    expect(newObj).toBe(obj1);
  });

})
