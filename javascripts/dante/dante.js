(function() {
  var debugMode, selected_menu, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.Editor = {};

  utils = {};

  window.selection = 0;

  selected_menu = false;

  window.current_editor = null;

  debugMode = true;

  String.prototype.killWhiteSpace = function() {
    return this.replace(/\s/g, '');
  };

  String.prototype.reduceWhiteSpace = function() {
    return this.replace(/\s+/g, ' ');
  };

  utils.log = function(message, force) {
    if (window.debugMode || force) {
      return console.log(message);
    }
  };

  utils.getBase64Image = function(img) {
    var canvas, ctx, dataURL;
    canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    dataURL = canvas.toDataURL("image/png");
    return dataURL;
  };

  utils.generateUniqueName = function() {
    return Math.random().toString(36).slice(8);
  };

  Editor.MainEditor = (function(_super) {
    __extends(MainEditor, _super);

    function MainEditor() {
      this.setupFirstAndLast = __bind(this.setupFirstAndLast, this);
      this.addClassesToElement = __bind(this.addClassesToElement, this);
      this.handlePaste = __bind(this.handlePaste, this);
      this.handleArrowDown = __bind(this.handleArrowDown, this);
      this.handleArrow = __bind(this.handleArrow, this);
      this.handleMouseUp = __bind(this.handleMouseUp, this);
      this.handleBlur = __bind(this.handleBlur, this);
      this.handleFocus = __bind(this.handleFocus, this);
      this.selection = __bind(this.selection, this);
      this.render = __bind(this.render, this);
      this.restart = __bind(this.restart, this);
      this.start = __bind(this.start, this);
      this.appendInitialContent = __bind(this.appendInitialContent, this);
      this.appendMenus = __bind(this.appendMenus, this);
      this.template = __bind(this.template, this);
      this.initialize = __bind(this.initialize, this);
      return MainEditor.__super__.constructor.apply(this, arguments);
    }

    MainEditor.prototype.events = {
      "blur": "handleBlur",
      "mouseup": "handleMouseUp",
      "keydown": "handleKeyDown",
      "keyup": "handleKeyUp",
      "paste": "handlePaste",
      "destroyed .graf--first": "handleDeletedContainer",
      "focus .graf": "handleFocus"
    };

    MainEditor.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
      this.editor_options = opts;
      window.current_editor = this;
      this.initial_html = $(this.el).html();
      this.current_range = null;
      this.current_node = null;
      this.el = opts.el || "#editor";
      window.debugMode = opts.debug || false;
      if (window.debugMode) {
        $(this.el).addClass("debug");
      }
      this.upload_url = opts.upload_url || "/images.json";
      this.oembed_url = opts.oembed_url || "http://api.embed.ly/1/oembed?url=";
      this.extract_url = opts.extract_url || "http://api.embed.ly/1/extract?key=86c28a410a104c8bb58848733c82f840&url=";
      if (localStorage.getItem('contenteditable')) {
        $(this.el).html(localStorage.getItem('contenteditable'));
      }
      this.store();
      this.title_placeholder = "<span class='defaultValue defaultValue--root'>Title…</span><br>";
      this.body_placeholder = "<span class='defaultValue defaultValue--root'>Tell your story…</span><br>";
      this.embed_placeholder = "<span class='defaultValue defaultValue--prompt'>Paste a YouTube, Vine, Vimeo, or other video link, and press Enter</span><br>";
      return this.extract_placeholder = "<span class='defaultValue defaultValue--prompt'>Paste a link to embed content from another site (e.g. Twitter) and press Enter</span><br>";
    };

    MainEditor.prototype.store = function() {
      localStorage.setItem("contenteditable", $(this.el).html());
      return setTimeout((function(_this) {
        return function() {
          return 1 + 1;
        };
      })(this), 5000);
    };

    MainEditor.prototype.template = function() {
      return "<section class='section--first section--last'> <div class='section-divider layoutSingleColumn'> <hr class='section-divider'> </div> <div class='section-content'> <div class='section-inner'> <p class='graf--h3'>" + this.title_placeholder + "</p> <p class='graf--p'>" + this.body_placeholder + "<p> </div> </div> </section>";
    };

    MainEditor.prototype.baseParagraphTmpl = function() {
      return "<p class='graf--p' name='" + (utils.generateUniqueName()) + "'><br></p>";
    };

    MainEditor.prototype.appendMenus = function() {
      $("<div id='editor-menu' class='editor-menu' style='opacity: 0;'></div>").insertAfter(this.el);
      $("<div class='inlineTooltip2 button-scalableGroup'></div>").insertAfter(this.el);
      this.editor_menu = new Editor.Menu();
      this.tooltip_view = new Editor.Tooltip();
      return this.tooltip_view.render();
    };

    MainEditor.prototype.appendInitialContent = function() {
      return $(this.el).find(".section-inner").html(this.initial_html);
    };

    MainEditor.prototype.start = function() {
      this.render();
      $(this.el).attr("contenteditable", "true");
      $(this.el).addClass("postField--body");
      $(this.el).wrap("<div class='notesSource'></div>");
      this.appendMenus();
      if (!_.isEmpty(this.initial_html.trim())) {
        this.appendInitialContent();
      }
      return this.setupElementsClasses();
    };

    MainEditor.prototype.restart = function() {
      return this.render();
    };

    MainEditor.prototype.render = function() {
      this.template();
      return $(this.el).html(this.template());
    };

    MainEditor.prototype.getSelectedText = function() {
      var text;
      text = "";
      if (typeof window.getSelection !== "undefined") {
        text = window.getSelection().toString();
      } else if (typeof document.selection !== "undefined" && document.selection.type === "Text") {
        text = document.selection.createRange().text;
      }
      return text;
    };

    MainEditor.prototype.selection = function() {
      selection;
      var selection;
      if (window.getSelection) {
        return selection = window.getSelection();
      } else if (document.selection && document.selection.type !== "Control") {
        return selection = document.selection;
      }
    };

    MainEditor.prototype.getRange = function() {
      var editor, range;
      editor = $(this.el)[0];
      range = selection && selection.rangeCount && selection.getRangeAt(0);
      if (!range) {
        range = document.createRange();
      }
      if (!editor.contains(range.commonAncestorContainer)) {
        range.selectNodeContents(editor);
        range.collapse(false);
      }
      return range;
    };

    MainEditor.prototype.setRange = function(range) {
      range = range || this.current_range;
      if (!range) {
        range = this.getRange();
        range.collapse(false);
      }
      this.selection().removeAllRanges();
      this.selection().addRange(range);
      return this;
    };

    MainEditor.prototype.getCharacterPrecedingCaret = function() {
      var precedingChar, precedingRange, range, sel;
      precedingChar = "";
      sel = void 0;
      range = void 0;
      precedingRange = void 0;
      if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount > 0) {
          range = sel.getRangeAt(0).cloneRange();
          range.collapse(true);
          range.setStart(this.getNode(), 0);
          precedingChar = range.toString().slice(0);
        }
      } else if ((sel = document.selection) && sel.type !== "Control") {
        range = sel.createRange();
        precedingRange = range.duplicate();
        precedingRange.moveToElementText(containerEl);
        precedingRange.setEndPoint("EndToStart", range);
        precedingChar = precedingRange.text.slice(0);
      }
      return precedingChar;
    };

    MainEditor.prototype.isLastChar = function() {
      return $(this.getNode()).text().trim().length === this.getCharacterPrecedingCaret().trim().length;
    };

    MainEditor.prototype.isFirstChar = function() {
      return this.getCharacterPrecedingCaret().trim().length === 0;
    };

    MainEditor.prototype.isSelectingAll = function(element) {
      var a, b;
      a = this.getSelectedText().killWhiteSpace().length;
      b = $(element).text().killWhiteSpace().length;
      return a === b;
    };

    MainEditor.prototype.setRangeAt = function(element, int) {
      var range, sel;
      if (int == null) {
        int = 0;
      }
      range = document.createRange();
      sel = window.getSelection();
      range.setStart(element, int);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return element.focus();
    };

    MainEditor.prototype.focus = function(focusStart) {
      if (!focusStart) {
        this.setRange();
      }
      $(this.el).focus();
      return this;
    };

    MainEditor.prototype.focusNode = function(node, range) {
      range.setStartAfter(node);
      range.setEndBefore(node);
      range.collapse(false);
      return this.setRange(range);
    };

    MainEditor.prototype.getNode = function() {
      var node, range, root;
      node = void 0;
      root = $(this.el).find(".section-inner")[0];
      if (this.selection().rangeCount < 1) {
        return;
      }
      range = this.selection().getRangeAt(0);
      node = range.commonAncestorContainer;
      if (!node || node === root) {
        return null;
      }
      while (node && (node.nodeType !== 1) && (node.parentNode !== root)) {
        node = node.parentNode;
      }
      while (node && (node.parentNode !== root)) {
        node = node.parentNode;
      }
      if (root && root.contains(node)) {
        return node;
      } else {
        return null;
      }
    };

    MainEditor.prototype.displayMenu = function(sel) {
      return setTimeout((function(_this) {
        return function() {
          var pos;
          _this.editor_menu.render();
          pos = _this.getSelectionDimensions();
          _this.relocateMenu(pos);
          return _this.editor_menu.show();
        };
      })(this), 10);
    };

    MainEditor.prototype.getSelectionDimensions = function() {
      var height, left, range, rect, sel, top, width;
      sel = document.selection;
      range = void 0;
      width = 0;
      height = 0;
      left = 0;
      top = 0;
      if (sel) {
        if (sel.type !== "Control") {
          range = sel.createRange();
          width = range.boundingWidth;
          height = range.boundingHeight;
        }
      } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
          range = sel.getRangeAt(0).cloneRange();
          if (range.getBoundingClientRect) {
            rect = range.getBoundingClientRect();
            width = rect.right - rect.left;
            height = rect.bottom - rect.top;
          }
        }
      }
      return {
        width: width,
        height: height,
        top: rect.top,
        left: rect.left
      };
    };

    MainEditor.prototype.handleTextSelection = function(anchor_node) {
      var text;
      this.editor_menu.hide();
      text = this.getSelectedText();
      if (!_.isEmpty(text.trim())) {
        this.current_range = this.getRange();
        this.current_node = anchor_node;
        return this.displayMenu();
      }
    };

    MainEditor.prototype.relocateMenu = function(position) {
      var l, padd, top;
      padd = this.editor_menu.$el.width() / 2;
      top = position.top + $(window).scrollTop() - 43;
      l = position.left + (position.width / 2) - padd;
      return this.editor_menu.$el.offset({
        left: l,
        top: top
      });
    };

    MainEditor.prototype.hidePlaceholder = function(element) {
      return $(element).find("span.defaultValue").remove().html("<br>");
    };

    MainEditor.prototype.displayEmptyPlaceholder = function(element) {
      $(".graf--first").html(this.title_placeholder);
      return $(".graf--last").html(this.body_placeholder);
    };

    MainEditor.prototype.handleFocus = function(ev) {
      this.markAsSelected(ev.currentTarget);
      return this.displayTooltipAt(ev.currentTarget);
    };

    MainEditor.prototype.handleBlur = function(ev) {
      setTimeout((function(_this) {
        return function() {
          if (!selected_menu) {
            return _this.editor_menu.hide();
          }
        };
      })(this), 200);
      return false;
    };

    MainEditor.prototype.handleMouseUp = function(ev) {
      var anchor_node;
      utils.log("MOUSE UP");
      anchor_node = this.getNode();
      this.handleTextSelection(anchor_node);
      utils.log(anchor_node);
      this.hidePlaceholder(anchor_node);
      this.markAsSelected(anchor_node);
      return this.displayTooltipAt(anchor_node);
    };

    MainEditor.prototype.scrollTo = function(node) {
      var top;
      top = node.offset().top;
      return $('html, body').animate({
        scrollTop: top
      }, 20);
    };

    MainEditor.prototype.handleArrow = function(ev) {
      var current_node;
      current_node = $(this.getNode());
      if (current_node) {
        this.markAsSelected(current_node);
        return this.displayTooltipAt(current_node);
      }
    };

    MainEditor.prototype.handleArrowDown = function(ev) {
      var current_node, ev_type, n, next_node, num, prev_node;
      current_node = $(this.getNode());
      utils.log(ev);
      ev_type = ev.originalEvent.key || ev.originalEvent.keyIdentifier;
      utils.log("ENTER ARROW DOWN " + ev.which + " " + ev_type);
      switch (ev_type) {
        case "Down":
          next_node = current_node.next();
          utils.log("NEXT NODE IS " + (next_node.attr('class')));
          utils.log("CURRENT NODE IS " + (current_node.attr('class')));
          if (next_node.hasClass("graf--figure")) {
            n = next_node.find(".imageCaption");
            this.setRangeAt(n[0]);
            this.scrollTo(n);
            utils.log("1 down");
            next_node.addClass("is-mediaFocused is-selected");
            false;
          } else if (next_node.hasClass("graf--mixtapeEmbed")) {
            n = current_node.next(".graf--mixtapeEmbed");
            num = n[0].childNodes.length;
            this.setRangeAt(n[0], num);
            this.scrollTo(n);
            utils.log("2 down");
            false;
          }
          if (current_node.hasClass("graf--figure") && next_node.hasClass("graf")) {
            this.setRangeAt(next_node[0]);
            this.scrollTo(next_node);
            utils.log("3 down");
            return false;
          }

          /*
          else if next_node.hasClass("graf")
            n = current_node.next(".graf")
            @setRangeAt n[0]
            @scrollTo(n)
            false
           */
          break;
        case "Up":
          prev_node = current_node.prev();
          utils.log("PREV NODE IS " + (prev_node.attr('class')));
          utils.log("CURRENT NODE IS up " + (current_node.attr('class')));
          if (!this.isFirstChar()) {
            return;
          }
          if (prev_node.hasClass("graf--figure")) {
            utils.log("1 up");
            n = prev_node.find(".imageCaption");
            this.setRangeAt(n[0]);
            this.scrollTo(n);
            prev_node.addClass("is-mediaFocused is-selected");
            return false;
          } else if (prev_node.hasClass("graf--mixtapeEmbed")) {
            n = current_node.prev(".graf--mixtapeEmbed");
            num = n[0].childNodes.length;
            this.setRangeAt(n[0], num);
            this.scrollTo(n);
            utils.log("2 up");
            return false;
          }
          if (current_node.hasClass("graf--figure") && prev_node.hasClass("graf")) {
            this.setRangeAt(prev_node[0]);
            this.scrollTo(prev_node);
            utils.log("3 up");
            return false;
          } else if (prev_node.hasClass("graf")) {
            n = current_node.prev(".graf");
            num = n[0].childNodes.length;
            this.setRangeAt(n[0], num);
            this.scrollTo(n);
            utils.log("4 up");
          }
          return utils.log("noting");
      }
    };

    MainEditor.prototype.handlePaste = function(ev) {
      var cbd, pastedText;
      utils.log("pasted!");
      this.aa = this.getNode();
      pastedText = void 0;
      if (window.clipboardData && window.clipboardData.getData) {
        pastedText = window.clipboardData.getData('Text');
      } else if (ev.originalEvent.clipboardData && ev.originalEvent.clipboardData.getData) {
        cbd = ev.originalEvent.clipboardData;
        pastedText = _.isEmpty(cbd.getData('text/html')) ? cbd.getData('text/plain') : cbd.getData('text/html');
      }
      if (pastedText.match(/<\/*[a-z][^>]+?>/gi)) {
        console.log("HTML DETECTED ON PASTE");
        $(pastedText);
        document.body.appendChild($("<div id='paste'></div>")[0]);
        $("#paste").html(pastedText);
        this.setupElementsClasses($("#paste"), (function(_this) {
          return function() {
            var last_node, new_node, nodes, num, top;
            nodes = $($("#paste").html()).insertAfter($(_this.aa));
            $("#paste").remove();
            last_node = nodes.last()[0];
            num = last_node.childNodes.length;
            _this.setRangeAt(last_node, num);
            new_node = $(_this.getNode());
            top = new_node.offset().top;
            _this.markAsSelected(new_node);
            _this.displayTooltipAt($(_this.el).find(".is-selected"));
            _this.handleUnwrappedImages(nodes);
            return $('html, body').animate({
              scrollTop: top
            }, 200);
          };
        })(this));
        return false;
      }
    };

    MainEditor.prototype.handleUnwrappedImages = function(elements) {
      return _.each(elements.find("img"), (function(_this) {
        return function(image) {
          utils.log("process image here!");
          return _this.tooltip_view.uploadExistentImage(image);
        };
      })(this));
    };

    MainEditor.prototype.handleInmediateDeletion = function(element) {
      var new_node;
      this.inmediateDeletion = false;
      new_node = $(this.baseParagraphTmpl()).insertBefore($(element));
      new_node.addClass("is-selected");
      this.setRangeAt($(element).prev()[0]);
      return $(element).remove();
    };

    MainEditor.prototype.handleUnwrappedNode = function(element) {
      var new_node, tmpl;
      tmpl = $(this.baseParagraphTmpl());
      this.setElementName(tmpl);
      $(element).wrap(tmpl);
      new_node = $("[name='" + (tmpl.attr('name')) + "']");
      new_node.addClass("is-selected");
      this.setRangeAt(new_node[0]);
      return false;
    };

    MainEditor.prototype.handleNullAnchor = function() {
      var node, num, prev, range, sel, span;
      utils.log("ALARM ALARM this is an empty node");
      sel = window.getSelection();
      if (sel.isCollapsed && sel.rangeCount > 0) {
        range = sel.getRangeAt(0);
        span = $(this.baseParagraphTmpl())[0];
        range.insertNode(span);
        range.setStart(span, 0);
        range.setEnd(span, 0);
        sel.removeAllRanges();
        sel.addRange(range);
        node = $(range.commonAncestorContainer);
        prev = node.prev();
        num = prev[0].childNodes.length;
        if (prev.hasClass("graf")) {
          this.setRangeAt(prev[0], num);
          node.remove();
          this.markAsSelected(this.getNode());
        } else if (prev.hasClass("graf--mixtapeEmbed")) {
          this.setRangeAt(prev[0], num);
          node.remove();
          this.markAsSelected(this.getNode());
        } else if (!prev) {
          utils.log("NO PREV");
        }
        return this.displayTooltipAt($(this.el).find(".is-selected"));
      }
    };

    MainEditor.prototype.handleCompleteDeletion = function(element) {
      if (_.isEmpty($(element).text().trim())) {
        utils.log("HANDLE COMPLETE DELETION");
        this.render();
        setTimeout((function(_this) {
          return function() {
            return _this.setRangeAt($(_this.el).find(".section-inner p")[0]);
          };
        })(this), 20);
        return this.completeDeletion = true;
      }
    };

    MainEditor.prototype.handleKeyDown = function(e) {
      var anchor_node, parent;
      utils.log("KEYDOWN");
      anchor_node = this.getNode();
      if (anchor_node) {
        this.markAsSelected(anchor_node);
      }
      if (e.which === 13) {
        $(this.el).find(".is-selected").removeClass("is-selected");
        parent = $(anchor_node);
        utils.log(this.isLastChar());
        if (parent.hasClass("is-embedable")) {
          this.tooltip_view.getEmbedFromNode($(anchor_node));
        } else if (parent.hasClass("is-extractable")) {
          this.tooltip_view.getExtractFromNode($(anchor_node));
        }
        if (parent.hasClass("graf--mixtapeEmbed") || parent.hasClass("graf--iframe") || parent.hasClass("graf--figure")) {
          if (!this.isLastChar()) {
            return false;
          }
        }
        if (parent.hasClass("graf--iframe") || parent.hasClass("graf--figure")) {
          if (this.isLastChar()) {
            this.handleLineBreakWith("p", parent);
            this.setRangeAt($(".is-selected")[0]);
            $(".is-selected").trigger("mouseup");
            return false;
          } else {
            return false;
          }
        }
        this.tooltip_view.cleanOperationClasses($(anchor_node));
        if (anchor_node && this.editor_menu.lineBreakReg.test(anchor_node.nodeName)) {
          if (this.isLastChar()) {
            utils.log("new paragraph if it the last character");
            e.preventDefault();
            this.handleLineBreakWith("p", parent);
          } else {

          }
        } else if (!anchor_node) {
          utils.log("creating new line break");
          e.preventDefault();
          this.handleLineBreakWith("p", parent);
        }
        setTimeout((function(_this) {
          return function() {
            var node;
            node = _this.getNode();
            _this.markAsSelected(_this.getNode());
            _this.setupFirstAndLast();
            _this.setElementName($(node));
            if (_.isEmpty($(node).text().trim())) {
              _.each($(node).children(), function(n) {
                return $(n).remove();
              });
              $(node).append("<br>");
            }
            return _this.displayTooltipAt($(_this.el).find(".is-selected"));
          };
        })(this), 2);
      }
      if (e.which === 8) {
        this.tooltip_view.hide();
        utils.log("removing from down");
        if (this.reachedTop) {
          utils.log("REACHED TOP");
        }
        if (this.prevented || this.reachedTop && this.isFirstChar()) {
          return false;
        }
        utils.log("pass initial validations");
        anchor_node = this.getNode();
        utils.log(anchor_node);
        if (anchor_node && anchor_node.nodeType === 3) {
          utils.log("TextNode detected from Down!");
        }
        if ($(anchor_node).hasClass("graf--mixtapeEmbed") || $(anchor_node).hasClass("graf--iframe")) {
          if (_.isEmpty($(anchor_node).text().trim())) {
            utils.log("EMPTY CHAR");
            return false;
          } else {
            if (this.isFirstChar()) {
              utils.log("FIRST CHAR");
              if (this.isSelectingAll(anchor_node)) {
                this.inmediateDeletion = true;
              }
              return false;
            } else {
              utils.log("NORMAL");
            }
          }
        }
        if ($(anchor_node).prev().hasClass("graf--mixtapeEmbed")) {
          if (this.isFirstChar() && !_.isEmpty($(anchor_node).text().trim())) {
            return false;
          }
        }
      }
      if (_.contains([38, 40], e.which)) {
        utils.log(e.which);
        return this.handleArrowDown(e);
      }
    };

    MainEditor.prototype.handleKeyUp = function(e, node) {
      var anchor_node;
      utils.log("KEYUP");
      this.editor_menu.hide();
      this.reachedTop = false;
      anchor_node = this.getNode();
      this.handleTextSelection(anchor_node);
      if (e.which === 8) {
        this.handleCompleteDeletion($(this.el));
        if (this.completeDeletion) {
          this.completeDeletion = false;
          return false;
        }
        if (this.inmediateDeletion) {
          this.handleInmediateDeletion(anchor_node);
        }
        if (anchor_node && anchor_node.nodeType === 3) {
          utils.log("HANDLE UNWRAPPED");
          this.handleUnwrappedNode(anchor_node);
          return false;
        }
        if (_.isNull(anchor_node)) {
          this.handleNullAnchor();
        }
        if ($(anchor_node).hasClass("graf--first")) {
          utils.log("THE FIRST ONE! UP");
          this.markAsSelected(anchor_node);
          this.setupFirstAndLast();
          false;
        }
        if (anchor_node) {
          this.markAsSelected(anchor_node);
          this.setupFirstAndLast();
          this.displayTooltipAt($(this.el).find(".is-selected"));
        }
      }
      if (_.contains([37, 38, 39, 40], e.which)) {
        return this.handleArrow(e);
      }
    };

    MainEditor.prototype.handleLineBreakWith = function(element_type, from_element) {
      var new_paragraph;
      new_paragraph = $("<" + element_type + " class='graf graf--" + element_type + " graf--empty is-selected'><br/></" + element_type + ">");
      if (from_element.parent().is('[class^="graf--"]')) {
        new_paragraph.insertAfter(from_element.parent());
      } else {
        new_paragraph.insertAfter(from_element);
      }
      return this.setRangeAt(new_paragraph[0]);
    };

    MainEditor.prototype.displayTooltipAt = function(element) {
      utils.log("POSITION FOR TOOLTIP");
      if (!element) {
        return;
      }
      this.tooltip_view.hide();
      if (!_.isEmpty($(element).text())) {
        return;
      }
      this.position = $(element).offset();
      this.tooltip_view.render();
      return this.tooltip_view.move({
        left: this.position.left - 60,
        top: this.position.top - 5
      });
    };

    MainEditor.prototype.markAsSelected = function(element) {
      $(this.el).find(".is-selected").removeClass("is-mediaFocused is-selected");
      $(element).addClass("is-selected");
      if ($(element).prop("tagName").toLowerCase() === "figure") {
        $(element).addClass("is-mediaFocused");
      }
      $(element).find(".defaultValue").remove();
      if ($(element).hasClass("graf--first")) {
        this.reachedTop = true;
        if ($(element).find("br").length === 0) {
          return $(element).append("<br>");
        }
      }
    };

    MainEditor.prototype.addClassesToElement = function(element) {
      var n, name;
      n = element;
      name = $(n).prop("tagName").toLowerCase();
      switch (name) {
        case "p":
        case "h2":
        case "h3":
        case "pre":
        case "div":
          if (!$(n).hasClass("graf--mixtapeEmbed")) {
            $(n).removeClass().addClass("graf graf--" + name);
          }
          break;
        case "code":
          $(n).unwrap().wrap("<p class='graf graf--pre'></p>");
          n = $(n).parent();
          break;
        case "ol":
        case "ul":
          $(n).removeClass().addClass("postList");
          _.each($(n).find("li"), function(li) {
            return $(n).removeClass().addClass("graf graf--li");
          });
          break;
        case "img":
          utils.log("images");
          this.tooltip_view.uploadExistentImage(n);
          break;
        case "a":
          $(n).wrap("<p class='graf graf--" + name + "'></p>");
          n = $(n).parent();
          break;
        case "blockquote":
          n = $(n).removeClass().addClass("graf graf--" + name);
      }
      return n;
    };

    MainEditor.prototype.setupElementsClasses = function(element, cb) {
      if (_.isUndefined(element)) {
        this.element = $(this.el).find('.section-inner');
      } else {
        this.element = element;
      }
      return setTimeout((function(_this) {
        return function() {
          _this.cleanContents(_this.element);
          _this.wrapTextNodes(_this.element);
          _.each(_this.element.children(), function(n) {
            var name;
            name = $(n).prop("tagName").toLowerCase();
            n = _this.addClassesToElement(n);
            return _this.setElementName(n);
          });
          _this.setupLinks(_this.element.find("a"));
          _this.setupFirstAndLast();
          if (_.isFunction(cb)) {
            return cb();
          }
        };
      })(this), 20);
    };

    MainEditor.prototype.cleanContents = function(element) {
      var s;
      if (_.isUndefined(element)) {
        this.element = $(this.el).find('.section-inner');
      } else {
        this.element = element;
      }
      s = new Sanitize({
        elements: ['strong', 'em', 'br', 'a', 'blockquote', 'b', 'u', 'i', 'pre', 'p', 'h2', 'h3'],
        attributes: {
          '__ALL__': ['class'],
          a: ['href', 'title', 'target']
        },
        protocols: {
          a: {
            href: ['http', 'https', 'mailto']
          }
        },
        transformers: [
          function(input) {
            if (input.node_name === "span" && $(input.node).hasClass("defaultValue")) {
              return {
                whitelist_nodes: [input.node]
              };
            } else {
              return null;
            }
          }, function(input) {
            if (input.node_name === 'div' && $(input.node).hasClass("graf--mixtapeEmbed")) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'a' && $(input.node).parent(".graf--mixtapeEmbed")) {
              return {
                attr_whitelist: ["style"]
              };
            } else {
              return null;
            }
          }, function(input) {
            if (input.node_name === 'figure' && $(input.node).hasClass("graf--iframe")) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'div' && $(input.node).hasClass("iframeContainer") && $(input.node).parent(".graf--iframe")) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'iframe' && $(input.node).parent(".iframeContainer")) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'figcaption' && $(input.node).parent(".graf--iframe")) {
              return {
                whitelist_nodes: [input.node]
              };
            } else {
              return null;
            }
          }, function(input) {
            if (input.node_name === 'figure' && $(input.node).hasClass("graf--figure")) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'div' && ($(input.node).hasClass("aspect-ratio-fill") || $(input.node).hasClass("aspectRatioPlaceholder")) && $(input.node).parent(".graf--figure")) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'img' && $(input.node).parent(".graf--figure")) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'a' && $(input.node).parent(".graf--mixtapeEmbed")) {
              return {
                attr_whitelist: ["style"]
              };
            } else if (input.node_name === 'span' && $(input.node).parent(".imageCaption")) {
              return {
                whitelist_nodes: [input.node]
              };
            } else {
              return null;
            }
          }
        ]
      });
      if (!_.isEmpty(this.element)) {
        utils.log("CLEAN HTML");
        return this.element.html(s.clean_node(this.element[0]));
      }
    };

    MainEditor.prototype.setupLinks = function(elems) {
      return _.each(elems, function(n) {
        var href, parent_name;
        parent_name = $(n).parent().prop("tagName").toLowerCase();
        $(n).addClass("markup--anchor markup--" + parent_name + "-anchor");
        href = $(n).attr("href");
        return $(n).attr("data-href", href);
      });
    };

    MainEditor.prototype.preCleanNode = function(element) {
      var s;
      s = new Sanitize({
        elements: ['strong', 'em', 'br', 'a', 'b', 'u', 'i'],
        attributes: {
          a: ['href', 'title', 'target']
        },
        protocols: {
          a: {
            href: ['http', 'https', 'mailto']
          }
        }
      });
      $(element).html(s.clean_node(element[0]));
      element = this.addClassesToElement($(element)[0]);
      return $(element);
    };

    MainEditor.prototype.setupFirstAndLast = function() {
      var childs;
      childs = $(this.el).find(".section-inner").children();
      childs.removeClass("graf--last , graf--first");
      childs.first().addClass("graf--first");
      return childs.last().addClass("graf--last");
    };

    MainEditor.prototype.wrapTextNodes = function(element) {
      if (_.isUndefined(element)) {
        element = $(this.el).find('.section-inner');
      } else {
        element = element;
      }
      return element.contents().filter(function() {
        return this.nodeType === 3 && this.data.trim().length > 0;
      }).wrap("<p class='graf grap--p'></p>");
    };

    MainEditor.prototype.setElementName = function(element) {
      return $(element).attr("name", utils.generateUniqueName());
    };

    return MainEditor;

  })(Backbone.View);

  Editor.Menu = (function(_super) {
    __extends(Menu, _super);

    function Menu() {
      this.render = __bind(this.render, this);
      this.template = __bind(this.template, this);
      this.initialize = __bind(this.initialize, this);
      return Menu.__super__.constructor.apply(this, arguments);
    }

    Menu.prototype.el = "#editor-menu";

    Menu.prototype.events = {
      "mousedown i": "handleClick",
      "mouseenter": "handleOver",
      "mouseleave": "handleOut"
    };

    Menu.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
      this.config = opts.buttons || this.default_config();
      this.commandsReg = {
        block: /^(?:p|h[1-6]|blockquote|pre)$/,
        inline: /^(?:bold|italic|underline|insertorderedlist|insertunorderedlist|indent|outdent)$/,
        source: /^(?:insertimage|createlink|unlink)$/,
        insert: /^(?:inserthorizontalrule|insert)$/,
        wrap: /^(?:code)$/
      };
      this.lineBreakReg = /^(?:blockquote|pre|div)$/i;
      return this.effectNodeReg = /(?:[pubia]|h[1-6]|blockquote|[uo]l|li)/i;
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
      html = "";
      _.each(this.config.buttons, function(item) {
        return html += "<i class=\"editor-icon icon-" + item + "\" data-action=\"" + item + "\"></i>";
      });
      return html;
    };

    Menu.prototype.render = function() {
      $(this.el).html(this.template());
      this.show();
      return this.delegateEvents();
    };

    Menu.prototype.handleClick = function(ev) {
      var element, name, value;
      element = $(ev.currentTarget);
      name = element.data("action");
      value = $(this.el).find("input").val();
      utils.log("menu " + name + " item clicked!");
      if (this.commandsReg.block.test(name)) {
        utils.log("block here");
        this.commandBlock(name);
      } else if (this.commandsReg.inline.test(name) || this.commandsReg.source.test(name)) {
        utils.log("overall here");
        this.commandOverall(name, value);
      } else if (this.commandsReg.insert.test(name)) {
        utils.log("insert here");
        this.commandInsert(name);
      } else if (this.commandsReg.wrap.test(name)) {
        utils.log("wrap here");
        this.commandWrap(name);
      } else {
        utils.log("can't find command function for name: " + name);
      }
      this.setupInsertedElement(current_editor.getNode());
      return false;
    };

    Menu.prototype.setupInsertedElement = function(element) {
      var n;
      n = current_editor.addClassesToElement(element);
      return current_editor.setElementName(n);
    };

    Menu.prototype.cleanContents = function() {
      return current_editor.cleanContents();
    };

    Menu.prototype.commandOverall = function(cmd, val) {
      var message;
      message = " to exec 「" + cmd + "」 command" + (val ? " with value: " + val : "");
      if (document.execCommand(cmd, false, val)) {
        utils.log("success" + message);
      } else {
        utils.log("fail" + message, true);
      }
    };

    Menu.prototype.commandInsert = function(name) {
      var node;
      node = current_editor.current_node;
      if (!node) {
        return;
      }
      current_editor.current_range.selectNode(node);
      current_editor.current_range.collapse(false);
      return this.commandOverall(node, name);
    };

    Menu.prototype.commandBlock = function(name) {
      var list, node;
      node = current_editor.current_node;
      list = this.effectNode(current_editor.getNode(node), true);
      if (list.indexOf(name) !== -1) {
        name = "p";
      }
      return this.commandOverall("formatblock", name);
    };

    Menu.prototype.commandWrap = function(tag) {
      var node, val;
      node = current_editor.current_node;
      val = "<" + tag + ">" + selection + "</" + tag + ">";
      return this.commandOverall("insertHTML", val);
    };

    Menu.prototype.effectNode = function(el, returnAsNodeName) {
      var nodes;
      nodes = [];
      el = el || current_editor.$el[0];
      while (el !== current_editor.$el[0]) {
        if (el.nodeName.match(this.effectNodeReg)) {
          nodes.push((returnAsNodeName ? el.nodeName.toLowerCase() : el));
        }
        el = el.parentNode;
      }
      return nodes;
    };

    Menu.prototype.handleOut = function() {
      return selected_menu = false;
    };

    Menu.prototype.handleOver = function() {
      return selected_menu = true;
    };

    Menu.prototype.show = function() {
      $(this.el).css("opacity", 1);
      return $(this.el).css('visibility', 'visible');
    };

    Menu.prototype.hide = function() {
      $(this.el).css("opacity", 0);
      return $(this.el).css('visibility', 'hidden');
    };

    return Menu;

  })(Backbone.View);

  Editor.Tooltip = (function(_super) {
    __extends(Tooltip, _super);

    function Tooltip() {
      this.hide = __bind(this.hide, this);
      this.getExtract = __bind(this.getExtract, this);
      this.getExtractFromNode = __bind(this.getExtractFromNode, this);
      this.getEmbedFromNode = __bind(this.getEmbedFromNode, this);
      this.uploadCompleted = __bind(this.uploadCompleted, this);
      this.updateProgressBar = __bind(this.updateProgressBar, this);
      this.uploadFile = __bind(this.uploadFile, this);
      this.uploadFiles = __bind(this.uploadFiles, this);
      this.toggleOptions = __bind(this.toggleOptions, this);
      this.render = __bind(this.render, this);
      this.initialize = __bind(this.initialize, this);
      return Tooltip.__super__.constructor.apply(this, arguments);
    }

    Tooltip.prototype.el = ".inlineTooltip2";

    Tooltip.prototype.events = {
      "click .button--inlineTooltipControl": "toggleOptions",
      "click .inlineTooltip2-menu .button": "handleClick"
    };

    Tooltip.prototype.initialize = function() {
      return this.buttons = [
        {
          icon: "fa-camera",
          title: "Add an image",
          action: "image"
        }, {
          icon: "fa-play",
          title: "Add a video",
          action: "embed"
        }, {
          icon: "fa-code",
          title: "Add an embed",
          action: "embed-extract"
        }, {
          icon: "fa-minus",
          title: "Add a new part",
          action: "hr"
        }
      ];
    };

    Tooltip.prototype.template = function() {
      var menu;
      menu = "";
      _.each(this.buttons, function(b) {
        var data_action_value;
        data_action_value = b.action_value ? "data-action-value='" + b.action_value + "'" : "";
        return menu += "<button class='button button--small button--circle button--neutral button--scale u-transitionSeries' title='" + b.title + "' data-action='inline-menu-" + b.action + "' " + data_action_value + "> <span class='fa " + b.icon + "'></span> </button>";
      });
      return "<button class='button button--small button--circle button--neutral button--inlineTooltipControl' title='Close Menu' data-action='inline-menu'> <span class='fa fa-plus'></span> </button> <div class='inlineTooltip2-menu'> " + menu + " </div>";
    };

    Tooltip.prototype.insertTemplate = function() {
      return "<figure contenteditable='false' class='graf graf--figure is-defaultValue' name='" + (utils.generateUniqueName()) + "' tabindex='0'> <div style='max-width: 600px; max-height: 375px;' class='aspectRatioPlaceholder is-locked'> <div style='padding-bottom: 62.5%;' class='aspect-ratio-fill'></div> <img src='' data-height='375' data-width='600' data-image-id='' class='graf-image' data-delayed-src=''> </div> <figcaption contenteditable='true' data-default-value='Type caption for image (optional)' class='imageCaption'> <span class='defaultValue'>Type caption for image (optional)</span> <br> </figcaption> </figure>";
    };

    Tooltip.prototype.extractTemplate = function() {
      return "<div class='graf graf--mixtapeEmbed is-selected' name=''> <a target='_blank' data-media-id='' class='js-mixtapeImage mixtapeImage mixtapeImage--empty u-ignoreBlock' href=''> </a> <a data-tooltip-type='link' data-tooltip-position='bottom' data-tooltip='' title='' class='markup--anchor markup--mixtapeEmbed-anchor' data-href='' href='' target='_blank'> <strong class='markup--strong markup--mixtapeEmbed-strong'></strong> <br> <em class='markup--em markup--mixtapeEmbed-em'></em> </a> </div>";
    };

    Tooltip.prototype.embedTemplate = function() {
      return "<figure contenteditable='false' class='graf--figure graf--iframe graf--first' name='504e' tabindex='0'> <div class='iframeContainer'> <iframe frameborder='0' width='700' height='393' data-media-id='' src='' data-height='480' data-width='854'> </iframe> </div> <figcaption contenteditable='true' data-default-value='Type caption for embed (optional)' class='imageCaption'> <a rel='nofollow' class='markup--anchor markup--figure-anchor' data-href='' href='' target='_blank'> </a> </figcaption> </figure>";
    };

    Tooltip.prototype.render = function() {
      $(this.el).html(this.template());
      return $(this.el).show();
    };

    Tooltip.prototype.toggleOptions = function() {
      utils.log("Toggle Options!!");
      return $(this.el).toggleClass("is-active is-scaled");
    };

    Tooltip.prototype.move = function(coords) {
      return $(this.el).offset(coords);
    };

    Tooltip.prototype.handleClick = function(ev) {
      var name;
      name = $(ev.currentTarget).data('action');
      utils.log(name);
      switch (name) {
        case "inline-menu-image":
          this.placeholder = "<p>PLACEHOLDER</p>";
          return this.imageSelect(ev);
        case "inline-menu-embed":
          return this.displayEmbedPlaceHolder();
        case "inline-menu-embed-extract":
          return this.displayExtractPlaceHolder();
        case "inline-menu-hr":
          return this.splitSection();
      }
    };

    Tooltip.prototype.uploadExistentImage = function(image_element, opts) {
      var node, tmpl, tmpl_img;
      if (opts == null) {
        opts = {};
      }
      utils.log("process image here!");
      tmpl = $(this.insertTemplate());
      tmpl_img = tmpl.find("img").attr('src', image_element.src);
      tmpl.find(".aspectRatioPlaceholder").css({
        'max-width': image_element.width,
        'max-height': image_element.height
      });
      if ($(image_element).parents(".graf").length > 0) {
        if ($(image_element).parents(".graf").hasClass("graf--figure")) {
          return;
        }
        tmpl.insertBefore($(image_element).parents(".graf"));
        node = current_editor.getNode();
        current_editor.preCleanNode($(node));
        return current_editor.addClassesToElement(node);
      } else {
        return $(image_element).replaceWith(tmpl);
      }
    };

    Tooltip.prototype.displayAndUploadImages = function(file) {
      this.displayCachedImage(file);
      return this.uploadFile(file);
    };

    Tooltip.prototype.imageSelect = function(ev) {
      var $selectFile, self;
      $selectFile = $('<input type="file" multiple="multiple">').click();
      self = this;
      return $selectFile.change(function() {
        var t;
        t = this;
        return self.uploadFiles(t.files);
      });
    };

    Tooltip.prototype.displayCachedImage = function(file) {
      var reader;
      this.node = current_editor.getNode();
      current_editor.tooltip_view.hide();
      reader = new FileReader();
      reader.onload = (function(_this) {
        return function(e) {
          var i, img_tag, new_tmpl, replaced_node;
          i = new Image;
          i.src = e.target.result;
          new_tmpl = $(_this.insertTemplate());
          replaced_node = $(new_tmpl).insertBefore($(_this.node));
          img_tag = new_tmpl.find('img.graf-image').attr('src', e.target.result);
          img_tag.height = i.height;
          img_tag.width = i.width;
          if (!(i.width === 0 || i.height === 0)) {
            return $('img.graf-image').parent(".aspectRatioPlaceholder").css({
              'max-width': i.width,
              'max-height': i.height
            });
          }
        };
      })(this);
      return reader.readAsDataURL(file);
    };

    Tooltip.prototype.formatData = function(file) {
      var formData;
      formData = new FormData();
      formData.append('file', file);
      return formData;
    };

    Tooltip.prototype.uploadFiles = function(files) {
      var acceptedTypes, file, i, _results;
      acceptedTypes = {
        "image/png": true,
        "image/jpeg": true,
        "image/gif": true
      };
      i = 0;
      _results = [];
      while (i < files.length) {
        file = files[i];
        if (acceptedTypes[file.type] === true) {
          $(this.placeholder).append("<progress class=\"progress\" min=\"0\" max=\"100\" value=\"0\">0</progress>");
          this.displayAndUploadImages(file);
        }
        _results.push(i++);
      }
      return _results;
    };

    Tooltip.prototype.uploadFile = function(file) {
      return $.ajax({
        type: "post",
        url: current_editor.upload_url,
        xhr: (function(_this) {
          return function() {
            var xhr;
            xhr = new XMLHttpRequest();
            xhr.upload.onprogress = _this.updateProgressBar;
            return xhr;
          };
        })(this),
        cache: false,
        contentType: false,
        complete: (function(_this) {
          return function(jqxhr) {
            _this.uploadCompleted(jqxhr);
          };
        })(this),
        processData: false,
        data: this.formatData(file)
      });
    };

    Tooltip.prototype.updateProgressBar = function(e) {
      var $progress, complete;
      $progress = $('.progress:first', this.$el);
      complete = "";
      if (e.lengthComputable) {
        complete = e.loaded / e.total * 100;
        complete = complete != null ? complete : {
          complete: 0
        };
        utils.log("complete");
        return utils.log(complete);
      }
    };

    Tooltip.prototype.uploadCompleted = function(jqxhr) {
      return utils.log(jqxhr);
    };

    Tooltip.prototype.displayEmbedPlaceHolder = function() {
      var ph;
      ph = current_editor.embed_placeholder;
      this.node = current_editor.getNode();
      $(this.node).html(ph).addClass("is-embedable");
      current_editor.setRangeAt(this.node);
      this.hide();
      return false;
    };

    Tooltip.prototype.getEmbedFromNode = function(node) {
      this.node_name = $(node).attr("name");
      return $.getJSON("" + current_editor.oembed_url + ($(this.node).text())).success((function(_this) {
        return function(data) {
          var iframe_src, replaced_node, tmpl, url;
          _this.node = $("[name=" + _this.node_name + "]");
          iframe_src = $(data.html).prop("src");
          tmpl = $(_this.embedTemplate());
          tmpl.attr("name", _this.node.attr("name"));
          $(_this.node).replaceWith(tmpl);
          replaced_node = $(".graf--iframe[name=" + (_this.node.attr("name")) + "]");
          replaced_node.find("iframe").attr("src", iframe_src);
          url = data.url || data.author_url;
          utils.log("URL IS " + url);
          replaced_node.find(".markup--anchor").attr("href", url).text(url);
          return _this.hide();
        };
      })(this));
    };

    Tooltip.prototype.displayExtractPlaceHolder = function() {
      var ph;
      ph = current_editor.extract_placeholder;
      this.node = current_editor.getNode();
      $(this.node).html(ph).addClass("is-extractable");
      current_editor.setRangeAt(this.node);
      this.hide();
      return false;
    };

    Tooltip.prototype.getExtractFromNode = function(node) {
      this.node_name = $(node).attr("name");
      return $.getJSON("" + current_editor.extract_url + ($(this.node).text())).success((function(_this) {
        return function(data) {
          var iframe_src, image_node, replaced_node, tmpl;
          _this.node = $("[name=" + _this.node_name + "]");
          iframe_src = $(data.html).prop("src");
          tmpl = $(_this.extractTemplate());
          tmpl.attr("name", _this.node.attr("name"));
          $(_this.node).replaceWith(tmpl);
          replaced_node = $(".graf--mixtapeEmbed[name=" + (_this.node.attr("name")) + "]");
          replaced_node.find("strong").text(data.title);
          replaced_node.find("em").text(data.description);
          replaced_node.append(data.provider_url);
          replaced_node.find(".markup--anchor").attr("href", data.url);
          if (!_.isEmpty(data.images)) {
            image_node = replaced_node.find(".mixtapeImage");
            image_node.css("background-image", "url(" + data.images[0].url + ")");
            image_node.removeClass("mixtapeImage--empty u-ignoreBlock");
          }
          return _this.hide();
        };
      })(this));
    };

    Tooltip.prototype.getExtract = function(url) {
      return $.getJSON("" + current_editor.extract_url + url).done(function(data) {
        return utils.log(data);
      });
    };

    Tooltip.prototype.cleanOperationClasses = function(node) {
      return node.removeClass("is-embedable is-extractable");
    };

    Tooltip.prototype.hide = function() {
      $(this.el).hide();
      return $(this.el).removeClass("is-active is-scaled");
    };

    return Tooltip;

  })(Backbone.View);

}).call(this);
