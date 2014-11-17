(function() {
  var selected_menu, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  selected_menu = false;

  utils = Dante.utils;

  Dante.Editor = (function(_super) {
    __extends(Editor, _super);

    function Editor() {
      this.setupFirstAndLast = __bind(this.setupFirstAndLast, this);
      this.addClassesToElement = __bind(this.addClassesToElement, this);
      this.handlePaste = __bind(this.handlePaste, this);
      this.handleArrowForKeyDown = __bind(this.handleArrowForKeyDown, this);
      this.handleArrow = __bind(this.handleArrow, this);
      this.handleMouseUp = __bind(this.handleMouseUp, this);
      this.handleBlur = __bind(this.handleBlur, this);
      this.selection = __bind(this.selection, this);
      this.render = __bind(this.render, this);
      this.restart = __bind(this.restart, this);
      this.start = __bind(this.start, this);
      this.appendInitialContent = __bind(this.appendInitialContent, this);
      this.appendMenus = __bind(this.appendMenus, this);
      this.template = __bind(this.template, this);
      this.initialize = __bind(this.initialize, this);
      return Editor.__super__.constructor.apply(this, arguments);
    }

    Editor.prototype.events = {
      "blur": "handleBlur",
      "mouseup": "handleMouseUp",
      "keydown": "handleKeyDown",
      "keyup": "handleKeyUp",
      "paste": "handlePaste",
      "click .graf--figure": "handleGrafFigureSelect"
    };

    Editor.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
      this.editor_options = opts;
      this.initial_html = $(this.el).html();
      this.current_range = null;
      this.current_node = null;
      this.el = opts.el || "#editor";
      window.debugMode = opts.debug || false;
      if (window.debugMode) {
        $(this.el).addClass("debug");
      }
      this.upload_url = opts.upload_url || "/uploads.json";
      this.oembed_url = opts.oembed_url || "http://api.embed.ly/1/oembed?url=";
      this.extract_url = opts.extract_url || "http://api.embed.ly/1/extract?key=86c28a410a104c8bb58848733c82f840&url=";
      this.default_loading_placeholder = opts.default_loading_placeholder || "/images/media-loading-placeholder.png";
      this.store_url = opts.store_url;
      if (localStorage.getItem('contenteditable')) {
        $(this.el).html(localStorage.getItem('contenteditable'));
      }
      this.store();
      this.title_placeholder = "<span class='defaultValue defaultValue--root'>Title…</span><br>";
      this.body_placeholder = "<span class='defaultValue defaultValue--root'>Tell your story…</span><br>";
      this.embed_placeholder = "<span class='defaultValue defaultValue--prompt'>Paste a YouTube, Vine, Vimeo, or other video link, and press Enter</span><br>";
      return this.extract_placeholder = "<span class='defaultValue defaultValue--prompt'>Paste a link to embed content from another site (e.g. Twitter) and press Enter</span><br>";
    };

    Editor.prototype.store = function() {
      if (!this.store_url) {
        return;
      }
      return setTimeout((function(_this) {
        return function() {
          return _this.checkforStore();
        };
      })(this), 15000);
    };

    Editor.prototype.checkforStore = function() {
      if (this.content === this.getContent()) {
        utils.log("content not changed skip store");
        return this.store();
      } else {
        utils.log("content changed! update");
        this.content = this.getContent();
        return $.ajax({
          url: this.store_url,
          method: "post",
          data: this.getContent(),
          success: function(res) {
            utils.log("store!");
            return utils.log(res);
          },
          complete: (function(_this) {
            return function(jxhr) {
              return _this.store();
            };
          })(this)
        });
      }
    };

    Editor.prototype.getContent = function() {
      return $(this.el).find(".section-inner").html();
    };

    Editor.prototype.template = function() {
      return "<section class='section--first section--last'> <div class='section-divider layoutSingleColumn'> <hr class='section-divider'> </div> <div class='section-content'> <div class='section-inner'> <p class='graf graf--h3'>" + this.title_placeholder + "</p> <p class='graf graf--p'>" + this.body_placeholder + "<p> </div> </div> </section>";
    };

    Editor.prototype.baseParagraphTmpl = function() {
      return "<p class='graf--p' name='" + (utils.generateUniqueName()) + "'><br></p>";
    };

    Editor.prototype.appendMenus = function() {
      $("<div id='dante-menu' class='dante-menu' style='opacity: 0;'></div>").insertAfter(this.el);
      $("<div class='inlineTooltip2 button-scalableGroup'></div>").insertAfter(this.el);
      this.editor_menu = new Dante.Editor.Menu({
        editor: this
      });
      this.tooltip_view = new Dante.Editor.Tooltip({
        editor: this
      });
      return this.tooltip_view.render();
    };

    Editor.prototype.appendInitialContent = function() {
      return $(this.el).find(".section-inner").html(this.initial_html);
    };

    Editor.prototype.start = function() {
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

    Editor.prototype.restart = function() {
      return this.render();
    };

    Editor.prototype.render = function() {
      this.template();
      return $(this.el).html(this.template());
    };

    Editor.prototype.getSelectedText = function() {
      var text;
      text = "";
      if (typeof window.getSelection !== "undefined") {
        text = window.getSelection().toString();
      } else if (typeof document.selection !== "undefined" && document.selection.type === "Text") {
        text = document.selection.createRange().text;
      }
      return text;
    };

    Editor.prototype.selection = function() {
      selection;
      var selection;
      if (window.getSelection) {
        return selection = window.getSelection();
      } else if (document.selection && document.selection.type !== "Control") {
        return selection = document.selection;
      }
    };

    Editor.prototype.getRange = function() {
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

    Editor.prototype.setRange = function(range) {
      range = range || this.current_range;
      if (!range) {
        range = this.getRange();
        range.collapse(false);
      }
      this.selection().removeAllRanges();
      this.selection().addRange(range);
      return this;
    };

    Editor.prototype.getCharacterPrecedingCaret = function() {
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

    Editor.prototype.isLastChar = function() {
      return $(this.getNode()).text().trim().length === this.getCharacterPrecedingCaret().trim().length;
    };

    Editor.prototype.isFirstChar = function() {
      return this.getCharacterPrecedingCaret().trim().length === 0;
    };

    Editor.prototype.isSelectingAll = function(element) {
      var a, b;
      a = this.getSelectedText().killWhiteSpace().length;
      b = $(element).text().killWhiteSpace().length;
      return a === b;
    };

    Editor.prototype.setRangeAt = function(element, int) {
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

    Editor.prototype.setRangeAtText = function(element, int) {
      var node, range, sel;
      if (int == null) {
        int = 0;
      }
      range = document.createRange();
      sel = window.getSelection();
      node = element.firstChild;
      range.setStart(node, 0);
      range.setEnd(node, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return element.focus();
    };

    Editor.prototype.focus = function(focusStart) {
      if (!focusStart) {
        this.setRange();
      }
      $(this.el).focus();
      return this;
    };

    Editor.prototype.focusNode = function(node, range) {
      range.setStartAfter(node);
      range.setEndBefore(node);
      range.collapse(false);
      return this.setRange(range);
    };

    Editor.prototype.getNode = function() {
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

    Editor.prototype.displayMenu = function(sel) {
      return setTimeout((function(_this) {
        return function() {
          var pos;
          _this.editor_menu.render();
          pos = utils.getSelectionDimensions();
          _this.relocateMenu(pos);
          return _this.editor_menu.show();
        };
      })(this), 10);
    };

    Editor.prototype.handleTextSelection = function(anchor_node) {
      var text;
      this.editor_menu.hide();
      text = this.getSelectedText();
      if (!_.isEmpty(text.trim())) {
        this.current_node = anchor_node;
        return this.displayMenu();
      }
    };

    Editor.prototype.relocateMenu = function(position) {
      var l, padd, top;
      padd = this.editor_menu.$el.width() / 2;
      top = position.top + $(window).scrollTop() - 43;
      l = position.left + (position.width / 2) - padd;
      return this.editor_menu.$el.offset({
        left: l,
        top: top
      });
    };

    Editor.prototype.hidePlaceholder = function(element) {
      return $(element).find("span.defaultValue").remove().html("<br>");
    };

    Editor.prototype.displayEmptyPlaceholder = function(element) {
      $(".graf--first").html(this.title_placeholder);
      return $(".graf--last").html(this.body_placeholder);
    };

    Editor.prototype.handleGrafFigureSelect = function(ev) {
      var element;
      element = ev.currentTarget;
      this.markAsSelected(element);
      return this.setRangeAt($(element).find('.imageCaption')[0]);
    };

    Editor.prototype.handleBlur = function(ev) {
      setTimeout((function(_this) {
        return function() {
          if (!selected_menu) {
            return _this.editor_menu.hide();
          }
        };
      })(this), 200);
      return false;
    };

    Editor.prototype.handleMouseUp = function(ev) {
      var anchor_node;
      utils.log("MOUSE UP");
      anchor_node = this.getNode();
      utils.log(anchor_node);
      utils.log(ev.currentTarget);
      if (_.isNull(anchor_node)) {
        return;
      }
      this.handleTextSelection(anchor_node);
      this.hidePlaceholder(anchor_node);
      this.markAsSelected(anchor_node);
      return this.displayTooltipAt(anchor_node);
    };

    Editor.prototype.scrollTo = function(node) {
      var top;
      if (utils.isElementInViewport($(node))) {
        return;
      }
      top = node.offset().top;
      return $('html, body').animate({
        scrollTop: top
      }, 20);
    };

    Editor.prototype.handleArrow = function(ev) {
      var current_node;
      current_node = $(this.getNode());
      if (current_node) {
        this.markAsSelected(current_node);
        return this.displayTooltipAt(current_node);
      }
    };

    Editor.prototype.handleArrowForKeyDown = function(ev) {
      var current_node, ev_type, n, next_node, num, prev_node;
      current_node = $(this.getNode());
      utils.log(ev);
      ev_type = ev.originalEvent.key || ev.originalEvent.keyIdentifier;
      utils.log("ENTER ARROW for key " + ev_type);
      switch (ev_type) {
        case "Down":
          next_node = current_node.next();
          utils.log("NEXT NODE IS " + (next_node.attr('class')));
          utils.log("CURRENT NODE IS " + (current_node.attr('class')));
          if (!$(current_node).hasClass("graf")) {
            return;
          }
          if (!$(current_node).editableCaretOnLastLine()) {
            return;
          }
          utils.log("ENTER ARROW PASSED RETURNS");
          if (next_node.hasClass("graf--figure")) {
            n = next_node.find(".imageCaption");
            this.setRangeAt(n[0]);
            this.scrollTo(n);
            utils.log("1 down");
            utils.log(n[0]);
            next_node.addClass("is-mediaFocused is-selected");
            return false;
          } else if (next_node.hasClass("graf--mixtapeEmbed")) {
            n = current_node.next(".graf--mixtapeEmbed");
            num = n[0].childNodes.length;
            this.setRangeAt(n[0], num);
            this.scrollTo(n);
            utils.log("2 down");
            return false;
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
          if (!$(current_node).hasClass("graf")) {
            return;
          }
          if (!$(current_node).editableCaretOnFirstLine()) {
            return;
          }
          utils.log("ENTER ARROW PASSED RETURNS");
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
            return false;
          }
          return utils.log("noting");
      }
    };

    Editor.prototype.handlePaste = function(ev) {
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
        utils.log("HTML DETECTED ON PASTE");
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

    Editor.prototype.handleUnwrappedImages = function(elements) {
      return _.each(elements.find("img"), (function(_this) {
        return function(image) {
          utils.log("process image here!");
          return _this.tooltip_view.uploadExistentImage(image);
        };
      })(this));
    };

    Editor.prototype.handleInmediateDeletion = function(element) {
      var new_node;
      this.inmediateDeletion = false;
      new_node = $(this.baseParagraphTmpl()).insertBefore($(element));
      new_node.addClass("is-selected");
      this.setRangeAt($(element).prev()[0]);
      return $(element).remove();
    };

    Editor.prototype.handleUnwrappedNode = function(element) {
      var new_node, tmpl;
      tmpl = $(this.baseParagraphTmpl());
      this.setElementName(tmpl);
      $(element).wrap(tmpl);
      new_node = $("[name='" + (tmpl.attr('name')) + "']");
      new_node.addClass("is-selected");
      this.setRangeAt(new_node[0]);
      return false;
    };


    /*
    This is a rare hack only for FF (I hope),
    when there is no range it creates a new element as a placeholder,
    then finds previous element from that placeholder,
    then it focus the prev and removes the placeholder.
    a nasty nasty one...
     */

    Editor.prototype.handleNullAnchor = function() {
      var node, num, prev, range, sel, span;
      utils.log("WARNING! this is an empty node");
      sel = this.selection();
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
        utils.log(prev);
        if (prev.hasClass("graf")) {
          this.setRangeAt(prev[0], num);
          node.remove();
          this.markAsSelected(this.getNode());
        } else if (prev.hasClass("graf--mixtapeEmbed")) {
          this.setRangeAt(prev[0], num);
          node.remove();
          this.markAsSelected(this.getNode());
        } else if (!prev) {
          this.setRangeAt(this.$el.find(".section-inner p")[0]);
        }
        return this.displayTooltipAt($(this.el).find(".is-selected"));
      }
    };

    Editor.prototype.handleCompleteDeletion = function(element) {
      if (_.isEmpty($(element).text().trim())) {
        utils.log("HANDLE COMPLETE DELETION");
        this.selection().removeAllRanges();
        this.render();
        setTimeout((function(_this) {
          return function() {
            return _this.setRangeAt($(_this.el).find(".section-inner p")[0]);
          };
        })(this), 20);
        return this.completeDeletion = true;
      }
    };

    Editor.prototype.handleTab = function(anchor_node) {
      var classes, next;
      utils.log("HANDLE TAB");
      classes = ".graf, .graf--mixtapeEmbed, .graf--figure, .graf--figure";
      next = $(anchor_node).next(classes);
      if ($(next).hasClass("graf--figure")) {
        next = $(next).find("figcaption");
        this.setRangeAt(next[0]);
        this.markAsSelected($(next).parent(".graf--figure"));
        this.displayTooltipAt(next);
        this.scrollTo($(next));
        return false;
      }
      if (_.isEmpty(next) || _.isUndefined(next[0])) {
        next = $(".graf:first");
      }
      this.setRangeAt(next[0]);
      this.markAsSelected(next);
      this.displayTooltipAt(next);
      return this.scrollTo($(next));
    };

    Editor.prototype.handleKeyDown = function(e) {
      var anchor_node, parent, utils_anchor_node;
      utils.log("KEYDOWN");
      anchor_node = this.getNode();
      if (anchor_node) {
        this.markAsSelected(anchor_node);
      }
      if (e.which === 9) {
        this.handleTab(anchor_node);
        return false;
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
          utils.log("supress linebreak from embed !(last char)");
          if (!this.isLastChar()) {
            return false;
          }
        }
        if (parent.hasClass("graf--iframe") || parent.hasClass("graf--figure")) {
          if (this.isLastChar()) {
            this.handleLineBreakWith("p", parent);
            this.setRangeAtText($(".is-selected")[0]);
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
          }
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
        utils.log("anchor_node");
        utils.log(anchor_node);
        utils.log("UTILS anchor_node");
        utils_anchor_node = utils.getNode();
        utils.log(utils_anchor_node);
        if ($(utils_anchor_node).hasClass("section-content") || $(utils_anchor_node).hasClass("graf--first")) {
          utils.log("SECTION DETECTED FROM KEYDOWN " + (_.isEmpty($(utils_anchor_node).text())));
          if (_.isEmpty($(utils_anchor_node).text())) {
            return false;
          }
        }
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
        return this.handleArrowForKeyDown(e);
      }
    };

    Editor.prototype.handleKeyUp = function(e, node) {
      var anchor_node, utils_anchor_node;
      utils.log("KEYUP");
      this.editor_menu.hide();
      this.reachedTop = false;
      anchor_node = this.getNode();
      utils_anchor_node = utils.getNode();
      this.handleTextSelection(anchor_node);
      if (e.which === 8) {
        if ($(utils_anchor_node).hasClass("postField--body")) {
          utils.log("ALL GONE from UP");
          this.handleCompleteDeletion($(this.el));
          if (this.completeDeletion) {
            this.completeDeletion = false;
            return false;
          }
        }
        if ($(utils_anchor_node).hasClass("section-content") || $(utils_anchor_node).hasClass("graf--first")) {
          utils.log("SECTION DETECTED FROM KEYUP " + (_.isEmpty($(utils_anchor_node).text())));
          if (_.isEmpty($(utils_anchor_node).text())) {
            return false;
          }
        }
        if (_.isNull(anchor_node)) {
          this.handleNullAnchor();
          return false;
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

    Editor.prototype.handleLineBreakWith = function(element_type, from_element) {
      var new_paragraph;
      new_paragraph = $("<" + element_type + " class='graf graf--" + element_type + " graf--empty is-selected'><br/></" + element_type + ">");
      if (from_element.parent().is('[class^="graf--"]')) {
        new_paragraph.insertAfter(from_element.parent());
      } else {
        new_paragraph.insertAfter(from_element);
      }
      this.setRangeAt(new_paragraph[0]);
      return this.scrollTo(new_paragraph);
    };

    Editor.prototype.displayTooltipAt = function(element) {
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

    Editor.prototype.markAsSelected = function(element) {
      if (_.isUndefined(element)) {
        return;
      }
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

    Editor.prototype.addClassesToElement = function(element) {
      var n, name;
      n = element;
      name = n.nodeName.toLowerCase();
      switch (name) {
        case "p":
        case "h2":
        case "h3":
        case "pre":
        case "div":
          if (!$(n).hasClass("graf--mixtapeEmbed")) {
            $(n).removeClass().addClass("graf graf--" + name);
          }
          if (name === "p" && $(n).find("br").length === 0) {
            $(n).append("<br>");
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
        case 'strong':
        case 'em':
        case 'br':
        case 'b':
        case 'u':
        case 'i':
          utils.log("links");
          $(n).wrap("<p class='graf graf--" + name + "'></p>");
          n = $(n).parent();
          break;
        case "blockquote":
          n = $(n).removeClass().addClass("graf graf--" + name);
          break;
        default:
          $(n).wrap("<p class='graf graf--" + name + "'></p>");
          n = $(n).parent();
      }
      return n;
    };

    Editor.prototype.setupElementsClasses = function(element, cb) {
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

    Editor.prototype.cleanContents = function(element) {
      var s;
      if (_.isUndefined(element)) {
        this.element = $(this.el).find('.section-inner');
      } else {
        this.element = element;
      }
      s = new Sanitize({
        elements: ['strong', 'img', 'em', 'br', 'a', 'blockquote', 'b', 'u', 'i', 'pre', 'p', 'h2', 'h3'],
        attributes: {
          '__ALL__': ['class'],
          a: ['href', 'title', 'target'],
          img: ['src']
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
            } else if (input.node_name === 'a' && $(input.node).parent(".graf--mixtapeEmbed").exists()) {
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
            } else if (input.node_name === 'div' && $(input.node).hasClass("iframeContainer") && $(input.node).parent(".graf--iframe").exists()) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'iframe' && $(input.node).parent(".iframeContainer").exists()) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'figcaption' && $(input.node).parent(".graf--iframe").exists()) {
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
            } else if (input.node_name === 'div' && ($(input.node).hasClass("aspect-ratio-fill") || $(input.node).hasClass("aspectRatioPlaceholder")) && $(input.node).parent(".graf--figure").exists()) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'img' && $(input.node).parent(".graf--figure").exists()) {
              return {
                whitelist_nodes: [input.node]
              };
            } else if (input.node_name === 'a' && $(input.node).parent(".graf--mixtapeEmbed").exists()) {
              return {
                attr_whitelist: ["style"]
              };
            } else if (input.node_name === 'span' && $(input.node).parent(".imageCaption").exists()) {
              return {
                whitelist_nodes: [input.node]
              };
            } else {
              return null;
            }
          }
        ]
      });
      if (this.element.exists()) {
        utils.log("CLEAN HTML");
        return this.element.html(s.clean_node(this.element[0]));
      }
    };

    Editor.prototype.setupLinks = function(elems) {
      return _.each(elems, (function(_this) {
        return function(n) {
          return _this.setupLink(n);
        };
      })(this));
    };

    Editor.prototype.setupLink = function(n) {
      var href, parent_name;
      parent_name = $(n).parent().prop("tagName").toLowerCase();
      $(n).addClass("markup--anchor markup--" + parent_name + "-anchor");
      href = $(n).attr("href");
      return $(n).attr("data-href", href);
    };

    Editor.prototype.preCleanNode = function(element) {
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

    Editor.prototype.setupFirstAndLast = function() {
      var childs;
      childs = $(this.el).find(".section-inner").children();
      childs.removeClass("graf--last , graf--first");
      childs.first().addClass("graf--first");
      return childs.last().addClass("graf--last");
    };

    Editor.prototype.wrapTextNodes = function(element) {
      if (_.isUndefined(element)) {
        element = $(this.el).find('.section-inner');
      } else {
        element = element;
      }
      return element.contents().filter(function() {
        return this.nodeType === 3 && this.data.trim().length > 0;
      }).wrap("<p class='graf grap--p'></p>");
    };

    Editor.prototype.setElementName = function(element) {
      return $(element).attr("name", utils.generateUniqueName());
    };

    return Editor;

  })(Dante.View);

}).call(this);
