(function() {
  Dante.View = (function() {
    function View(opts) {
      if (opts == null) {
        opts = {};
      }
      if (opts.el) {
        this.el = opts.el;
      }
      this._ensureElement();
      this.initialize.apply(this, arguments);
      this._ensureEvents();
    }

    View.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
    };

    View.prototype.events = function() {};

    View.prototype.render = function() {
      return this;
    };

    View.prototype.remove = function() {
      this._removeElement();
      this.stopListening();
      return this;
    };

    View.prototype._removeElement = function() {
      return this.$el.remove();
    };

    View.prototype.setElement = function(element) {
      this._setElement(element);
      return this;
    };

    View.prototype.setEvent = function(opts) {
      if (!_.isEmpty(opts)) {
        return _.each(opts, (function(_this) {
          return function(f, key) {
            var element, func, key_arr;
            key_arr = key.split(" ");
            if (_.isFunction(f)) {
              func = f;
            } else if (_.isString(f)) {
              func = _this[f];
            } else {
              throw "error event needs a function or string";
            }
            element = key_arr.length > 1 ? key_arr.splice(1, 3).join(" ") : null;
            return $(_this.el).on(key_arr[0], element, _.bind(func, _this));
          };
        })(this));
      }
    };

    View.prototype._ensureElement = function() {
      return this.setElement(_.result(this, 'el'));
    };

    View.prototype._ensureEvents = function() {
      return this.setEvent(_.result(this, 'events'));
    };

    View.prototype._setElement = function(el) {
      this.$el = el instanceof $ ? el : $(el);
      return this.el = this.$el[0];
    };

    return View;

  })();

}).call(this);
