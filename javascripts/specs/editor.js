(function() {
  window.editor = new Dante.Editor({
    upload_url: "/images.json",
    el: "#editor1"
  });

  window.editor.start();

  QUnit.test("should initialize editor", function(assert) {
    return assert.ok(_.isObject(window.editor), "Passed!");
  });

  QUnit.test("should init editor defaults", function(assert) {
    assert.ok(!_.isEmpty(window.editor.title_placeholder), "Passed!");
    assert.ok(!_.isEmpty(window.editor.body_placeholder), "Passed!");
    assert.ok(!_.isEmpty(window.editor.embed_placeholder), "Passed!");
    assert.ok(!_.isEmpty(window.editor.extract_placeholder), "Passed!");
    assert.ok(!_.isEmpty(window.editor.upload_url), "Passed!");
    assert.ok(!_.isEmpty(window.editor.oembed_url), "Passed!");
    return assert.ok(!_.isEmpty(window.editor.extract_url), "Passed!");
  });

  QUnit.test("should init current_editor", function(assert) {
    assert.ok(!_.isEmpty(window.current_editor), "Passed!");
    assert.ok(_.isObject(window.current_editor.tooltip_view), "Passed!");
    return assert.ok(_.isObject(window.current_editor.editor_menu), "Passed!");
  });

  QUnit.test("should build tooltip & menu", function(assert) {
    assert.ok(!_.isEmpty($(".inlineTooltip2")), "Passed!");
    return assert.ok(!_.isEmpty($("#editor-menu")), "Passed!");
  });

  QUnit.test("should display placeholders when empty content", function(assert) {
    return assert.ok($("span.defaultValue").length === 2, "Passed!");
  });

}).call(this);
