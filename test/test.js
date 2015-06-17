/**
 * DOM Tests
 */

asyncTest("transform", function(assert) {
  QUnit.start();
  $.ajax({
    url: 'fixtures/test.xml',
    dataType: 'xslt'
  }).done(function(data) {
    var expected = '<html><head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/><title>Hello World!</title></head><body><h1>Hello World!</h1></body></html>';
    assert.domEqual(data.documentElement, expected);
  });
  
});