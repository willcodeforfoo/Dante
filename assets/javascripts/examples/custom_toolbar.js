(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.MyCustomCoffeeTooltip = (function(_super) {
    __extends(MyCustomCoffeeTooltip, _super);

    function MyCustomCoffeeTooltip() {
      return MyCustomCoffeeTooltip.__super__.constructor.apply(this, arguments);
    }

    MyCustomCoffeeTooltip.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
      this.icon = opts.icon || "icon-video";
      this.title = opts.title || "Add a Custom Thing!";
      this.action = opts.action || "custom-embed";
      return this.current_editor = opts.current_editor;
    };

    MyCustomCoffeeTooltip.prototype.handleClick = function(ev) {
      return alert("This is custom button with coffeescript extend style");
    };

    return MyCustomCoffeeTooltip;

  })(Dante.View.TooltipWidget);

  window.MyCustomTooltip = Dante.View.TooltipWidget.extend({
    initialize: function(opts) {
      if (opts == null) {
        opts = {};
      }
      this.icon = opts.icon || "icon-video";
      this.title = opts.title || "Add a Custom Thing!";
      this.action = opts.action || "custom-embed-simple";
      return this.current_editor = opts.current_editor;
    },
    handleClick: function(ev) {
      return alert("This is custom button with backbone extend style");
    }
  });

}).call(this);
