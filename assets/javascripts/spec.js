(function() {
  window.editor = new Dante.Editor({
    upload_url: "/images.json",
    el: "#editor1"
  });

  window.editor.start();

  QUnit.test("should initialize editor", function(assert) {
    return assert.ok(_.isObject(window.editor), "Passed!");
  });

}).call(this);
(function() {
  var TestView, TestViewOpts, TestViewWithEl, TestViewWithEvents,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TestView = (function(_super) {
    __extends(TestView, _super);

    function TestView() {
      return TestView.__super__.constructor.apply(this, arguments);
    }

    return TestView;

  })(Dante.View);

  TestViewWithEl = (function(_super) {
    __extends(TestViewWithEl, _super);

    function TestViewWithEl() {
      return TestViewWithEl.__super__.constructor.apply(this, arguments);
    }

    TestViewWithEl.prototype.el = "#view";

    TestViewWithEl.prototype.initialize = function() {
      this.model = {
        foo: "bar"
      };
      return TestViewWithEl.__super__.initialize.apply(this, arguments);
    };

    return TestViewWithEl;

  })(Dante.View);

  TestViewWithEvents = (function(_super) {
    __extends(TestViewWithEvents, _super);

    function TestViewWithEvents() {
      return TestViewWithEvents.__super__.constructor.apply(this, arguments);
    }

    TestViewWithEvents.prototype.el = "#view";

    TestViewWithEvents.prototype.initialize = function() {
      this.one = false;
      this.two = false;
      return this.some_var = 1;
    };

    TestViewWithEvents.prototype.events = {
      "click": function(ev) {
        console.log("CLICKED ANYWHERE");
        this.anywhere = true;
        return false;
      },
      "click .one": function(ev) {
        this.one = true;
        console.log("CLICKED .one YEAH, " + this.one);
        return false;
      },
      "click .two": "handleClickTwo"
    };

    TestViewWithEvents.prototype.handleClickTwo = function(ev) {
      this.two = true;
      console.log("CLICKED .two YEAH, " + this.two);
      console.log(ev.currentTarget);
      return false;
    };

    return TestViewWithEvents;

  })(Dante.View);

  TestViewOpts = (function(_super) {
    __extends(TestViewOpts, _super);

    function TestViewOpts() {
      return TestViewOpts.__super__.constructor.apply(this, arguments);
    }

    TestViewOpts.prototype.el = "#view";

    TestViewOpts.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
      return this.model = opts.model;
    };

    return TestViewOpts;

  })(Dante.View);

  window.view = new TestView;

  window.view2 = new TestView({
    el: "#view"
  });

  window.view3 = new TestViewWithEl;

  window.event_view = new TestViewWithEvents;

  window.opts_view = new TestViewOpts({
    model: 1234
  });

  QUnit.test("should initialize view without el", function(assert) {
    assert.ok(_.isObject(view), "Passed!");
    return assert.ok(_.isUndefined(view.el), "Passed!");
  });

  QUnit.test("should initialize view with el", function(assert) {
    assert.ok(_.isElement(view2.el), "Passed!");
    return assert.ok(_.isElement(view3.el), "Passed!");
  });

  QUnit.test("should initialize view with @model", function(assert) {
    return assert.ok(!_.isEmpty(view3.model), "Passed!");
  });

  QUnit.test("should set variable on click", function(assert) {
    event_view.$el.find("a.one").trigger("click");
    event_view.$el.find("a.two").trigger("click");
    assert.ok(event_view.one, "Passed!");
    return assert.ok(event_view.two, "Passed!");
  });

  QUnit.test("should set vars on initialize", function(assert) {
    return assert.ok(event_view.some_var === 1, "Passed!");
  });

  QUnit.test("should set windows.vars on initialize", function(assert) {
    return assert.ok(opts_view.model === 1234, "Passed!");
  });

}).call(this);
(function() {
  window.editor = new Dante.Editor({
    upload_url: "/images.json",
    el: "#editor1"
  });

  window.editor.start();

  window.editor2 = new Dante.Editor({
    el: "#editor2"
  });

  window.editor2.start();

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

  QUnit.test("should init editor", function(assert) {
    assert.ok(!_.isEmpty(window.editor), "Passed!");
    assert.ok(_.isObject(window.editor.tooltip_view), "Passed!");
    return assert.ok(_.isObject(window.editor.editor_menu), "Passed!");
  });

  QUnit.test("should build tooltip & menu", function(assert) {
    assert.ok(!_.isEmpty($(".inlineTooltip")), "Passed!");
    return assert.ok(!_.isEmpty($("#editor-menu")), "Passed!");
  });

  QUnit.test("should display placeholders when empty content", function(assert) {
    return assert.ok($(editor.el).find("span.defaultValue").length === 2, "Passed!");
  });

  QUnit.test("should clean spans", function(assert) {
    assert.ok(!$(editor2.el).find("a:first span").exists(), "Passed!");
    assert.ok(!$(editor2.el).find(".section-inner div.class").exists(), "Passed!");
    assert.ok(!$(editor2.el).find(".section-inner span:not(.defaultValue)").exists(), "Passed!");
    return assert.ok(!$(editor2.el).find(".section-inner p span").exists(), "Passed!");
  });

  QUnit.test("should detect existing images", function(assert) {
    var fig;
    fig = $(editor2.el).find(".section-inner figure");
    assert.ok($(fig).exists(), "generate figure.graf--figure");
    assert.ok($(fig).find("img").exists(), "figure have image");
    assert.ok(!_.isEmpty($(fig).find("img").attr('src')), "and image src");
    assert.ok($(fig).find("figcaption").exists(), "and caption");
    return assert.ok($(fig).find("figcaption span.defaultValue").exists(), "and caption span");
  });

}).call(this);


