(function() {
  var utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  utils = Dante.utils;

  Dante.Editor.Menu = (function(_super) {
    __extends(Menu, _super);

    function Menu() {
      this.createlink = __bind(this.createlink, this);
      this.handleInputEnter = __bind(this.handleInputEnter, this);
      this.render = __bind(this.render, this);
      this.template = __bind(this.template, this);
      this.initialize = __bind(this.initialize, this);
      return Menu.__super__.constructor.apply(this, arguments);
    }

    Menu.prototype.el = "#dante-menu";

    Menu.prototype.events = {
      "mousedown i": "handleClick",
      "mouseenter": "handleOver",
      "mouseleave": "handleOut",
      "keypress input": "handleInputEnter"
    };

    Menu.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
      this.config = opts.buttons || this.default_config();
      this.current_editor = opts.editor;
      this.commandsReg = {
        block: /^(?:p|h[1-6]|blockquote|pre)$/,
        inline: /^(?:bold|italic|underline|insertorderedlist|insertunorderedlist|indent|outdent)$/,
        source: /^(?:insertimage|createlink|unlink)$/,
        insert: /^(?:inserthorizontalrule|insert)$/,
        wrap: /^(?:code)$/
      };
      this.lineBreakReg = /^(?:blockquote|pre|div|p)$/i;
      this.effectNodeReg = /(?:[pubia]|h[1-6]|blockquote|[uo]l|li)/i;
      return this.strReg = {
        whiteSpace: /(^\s+)|(\s+$)/g,
        mailTo: /^(?!mailto:|.+\/|.+#|.+\?)(.*@.*\..+)$/,
        http: /^(?!\w+?:\/\/|mailto:|\/|\.\/|\?|#)(.*)$/
      };
    };

    Menu.prototype.default_config = function() {
      return {

        /*
        buttons: [
            'blockquote', 'h2', 'h3', 'p', 'code', 'insertorderedlist', 'insertunorderedlist', 'inserthorizontalrule',
            'indent', 'outdent', 'bold', 'italic', 'underline', 'createlink'
          ]
         */
        buttons: ['blockquote', 'h2', 'h3', 'bold', 'italic', 'createlink']
      };
    };

    Menu.prototype.template = function() {
      var html;
      html = "<input class='dante-input' placeholder='http://' style='display: none;'>";
      _.each(this.config.buttons, function(item) {
        return html += "<i class=\"dante-icon icon-" + item + "\" data-action=\"" + item + "\"></i>";
      });
      return html;
    };

    Menu.prototype.render = function() {
      $(this.el).html(this.template());
      return this.show();
    };

    Menu.prototype.handleClick = function(ev) {
      var action, element, input;
      element = $(ev.currentTarget);
      action = element.data("action");
      input = $(this.el).find("input.dante-input");
      utils.log("menu " + action + " item clicked!");
      this.savedSel = utils.saveSelection();
      if (/(?:createlink)/.test(action)) {
        input.show();
        input.focus();
      } else {
        this.menuApply(action);
      }
      return false;
    };

    Menu.prototype.handleInputEnter = function(e) {
      if (e.which === 13) {
        utils.restoreSelection(this.savedSel);
        return this.createlink($(e.target));
      }
    };

    Menu.prototype.createlink = function(input) {
      var action, inputValue;
      input.hide();
      if (input.val()) {
        inputValue = input.val().replace(this.strReg.whiteSpace, "").replace(this.strReg.mailTo, "mailto:$1").replace(this.strReg.http, "http://$1");
        return this.menuApply("createlink", inputValue);
      }
      action = "unlink";
      return this.menuApply(action);
    };

    Menu.prototype.menuApply = function(action, value) {
      if (this.commandsReg.block.test(action)) {
        utils.log("block here");
        this.commandBlock(action);
      } else if (this.commandsReg.inline.test(action) || this.commandsReg.source.test(action)) {
        utils.log("overall here");
        this.commandOverall(action, value);
      } else if (this.commandsReg.insert.test(action)) {
        utils.log("insert here");
        this.commandInsert(action);
      } else if (this.commandsReg.wrap.test(action)) {
        utils.log("wrap here");
        this.commandWrap(action);
      } else {
        utils.log("can't find command function for action: " + action);
      }
      return false;
    };

    Menu.prototype.setupInsertedElement = function(element) {
      var n;
      n = this.current_editor.addClassesToElement(element);
      this.current_editor.setElementName(n);
      return this.current_editor.markAsSelected(n);
    };

    Menu.prototype.cleanContents = function() {
      return this.current_editor.cleanContents();
    };

    Menu.prototype.commandOverall = function(cmd, val) {
      var message, n;
      message = " to exec 「" + cmd + "」 command" + (val ? " with value: " + val : "");
      if (document.execCommand(cmd, false, val)) {
        utils.log("success" + message);
        n = this.current_editor.getNode();
        this.current_editor.setupLinks($(n).find("a"));
        this.displayHighlights();
        if ($(n).parent().hasClass("section-inner")) {
          n = this.current_editor.addClassesToElement(n);
          this.current_editor.setElementName(n);
        }
      } else {
        utils.log("fail" + message, true);
      }
    };

    Menu.prototype.commandInsert = function(name) {
      var node;
      node = this.current_editor.current_node;
      if (!node) {
        return;
      }
      this.current_editor.current_range.selectNode(node);
      this.current_editor.current_range.collapse(false);
      return this.commandOverall(node, name);
    };

    Menu.prototype.commandBlock = function(name) {
      var list, node;
      node = this.current_editor.current_node;
      list = this.effectNode(this.current_editor.getNode(node), true);
      if (list.indexOf(name) !== -1) {
        name = "p";
      }
      return this.commandOverall("formatblock", name);
    };

    Menu.prototype.commandWrap = function(tag) {
      var node, val;
      node = this.current_editor.current_node;
      val = "<" + tag + ">" + selection + "</" + tag + ">";
      return this.commandOverall("insertHTML", val);
    };

    Menu.prototype.effectNode = function(el, returnAsNodeName) {
      var nodes;
      nodes = [];
      el = el || this.current_editor.$el[0];
      while (el !== this.current_editor.$el[0]) {
        if (el.nodeName.match(this.effectNodeReg)) {
          nodes.push((returnAsNodeName ? el.nodeName.toLowerCase() : el));
        }
        el = el.parentNode;
      }
      return nodes;
    };

    Menu.prototype.handleOut = function() {
      var selected_menu;
      return selected_menu = false;
    };

    Menu.prototype.handleOver = function() {
      var selected_menu;
      return selected_menu = true;
    };

    Menu.prototype.displayHighlights = function() {
      var nodes;
      $(this.el).find(".active").removeClass("active");
      nodes = this.effectNode(utils.getNode());
      utils.log(nodes);
      return _.each(nodes, (function(_this) {
        return function(node) {
          var tag;
          tag = node.nodeName.toLowerCase();
          switch (tag) {
            case "a":
              menu.querySelector("input").value = item.getAttribute("href");
              tag = "createlink";
              break;
            case "img":
              menu.querySelector("input").value = item.getAttribute("src");
              tag = "insertimage";
              break;
            case "i":
              tag = "italic";
              break;
            case "u":
              tag = "underline";
              break;
            case "b":
              tag = "bold";
              break;
            case "code":
              tag = "code";
              break;
            case "ul":
              tag = "insertunorderedlist";
              break;
            case "ol":
              tag = "insertorderedlist";
              break;
            case "li":
              tag = "indent";
              utils.log("nothing to select");
          }
          return _this.highlight(tag);
        };
      })(this));
    };

    Menu.prototype.highlight = function(tag) {
      return $(".icon-" + tag).addClass("active");
    };

    Menu.prototype.show = function() {
      $(this.el).css("opacity", 1);
      $(this.el).css('visibility', 'visible');
      return this.displayHighlights();
    };

    Menu.prototype.hide = function() {
      $(this.el).css("opacity", 0);
      return $(this.el).css('visibility', 'hidden');
    };

    return Menu;

  })(Dante.View);

}).call(this);
