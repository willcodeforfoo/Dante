(function() {
  var LINE_HEIGHT, is_caret_at_end_of_node, is_caret_at_start_of_node, utils;

  String.prototype.killWhiteSpace = function() {
    return this.replace(/\s/g, '');
  };

  String.prototype.reduceWhiteSpace = function() {
    return this.replace(/\s+/g, ' ');
  };

  utils = {};

  window.Dante.utils = utils;

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

  utils.saveSelection = function() {
    var i, len, ranges, sel;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        ranges = [];
        i = 0;
        len = sel.rangeCount;
        while (i < len) {
          ranges.push(sel.getRangeAt(i));
          ++i;
        }
        return ranges;
      }
    } else {
      if (document.selection && document.selection.createRange) {
        return document.selection.createRange();
      }
    }
    return null;
  };

  utils.restoreSelection = function(savedSel) {
    var i, len, sel;
    if (savedSel) {
      if (window.getSelection) {
        sel = window.getSelection();
        sel.removeAllRanges();
        i = 0;
        len = savedSel.length;
        while (i < len) {
          sel.addRange(savedSel[i]);
          ++i;
        }
      } else {
        if (document.selection && savedSel.select) {
          savedSel.select();
        }
      }
    }
  };

  utils.getNode = function() {
    var container, range, sel;
    range = void 0;
    sel = void 0;
    container = void 0;
    if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      return range.parentElement();
    } else if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt) {
        if (sel.rangeCount > 0) {
          range = sel.getRangeAt(0);
        }
      } else {
        range = document.createRange();
        range.setStart(sel.anchorNode, sel.anchorOffset);
        range.setEnd(sel.focusNode, sel.focusOffset);
        if (range.collapsed !== sel.isCollapsed) {
          range.setStart(sel.focusNode, sel.focusOffset);
          range.setEnd(sel.anchorNode, sel.anchorOffset);
        }
      }
      if (range) {
        container = range.commonAncestorContainer;
        if (container.nodeType === 3) {
          return container.parentNode;
        } else {
          return container;
        }
      }
    }
  };

  utils.getSelectionDimensions = function() {
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

  utils.getCaretPosition = function(editableDiv) {
    var caretPos, containerEl, range, sel, tempEl, tempRange;
    caretPos = 0;
    containerEl = null;
    sel = void 0;
    range = void 0;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        if (range.commonAncestorContainer.parentNode === editableDiv) {
          caretPos = range.endOffset;
        }
      }
    } else if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      if (range.parentElement() === editableDiv) {
        tempEl = document.createElement("span");
        editableDiv.insertBefore(tempEl, editableDiv.firstChild);
        tempRange = range.duplicate();
        tempRange.moveToElementText(tempEl);
        tempRange.setEndPoint("EndToEnd", range);
        caretPos = tempRange.text.length;
      }
    }
    return caretPos;
  };

  utils.isElementInViewport = function(el) {
    var rect;
    if (typeof jQuery === "function" && el instanceof jQuery) {
      el = el[0];
    }
    rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
  };

  LINE_HEIGHT = 20;

  is_caret_at_start_of_node = function(node, range) {
    var pre_range;
    pre_range = document.createRange();
    pre_range.selectNodeContents(node);
    pre_range.setEnd(range.startContainer, range.startOffset);
    return pre_range.toString().trim().length === 0;
  };

  is_caret_at_end_of_node = function(node, range) {
    var post_range;
    post_range = document.createRange();
    post_range.selectNodeContents(node);
    post_range.setStart(range.endContainer, range.endOffset);
    return post_range.toString().trim().length === 0;
  };

  $.fn.editableIsCaret = function() {
    return window.getSelection().type === 'Caret';
  };

  $.fn.editableRange = function() {
    var sel;
    sel = window.getSelection();
    if (!(sel.rangeCount > 0)) {
      return;
    }
    return sel.getRangeAt(0);
  };

  $.fn.editableCaretRange = function() {
    if (!this.editableIsCaret()) {
      return;
    }
    return this.editableRange();
  };

  $.fn.editableSetRange = function(range) {
    var sel;
    sel = window.getSelection();
    if (sel.rangeCount > 0) {
      sel.removeAllRanges();
    }
    return sel.addRange(range);
  };

  $.fn.editableFocus = function(at_start) {
    var range, sel;
    if (at_start == null) {
      at_start = true;
    }
    if (!this.attr('contenteditable')) {
      return;
    }
    sel = window.getSelection();
    if (sel.rangeCount > 0) {
      sel.removeAllRanges();
    }
    range = document.createRange();
    range.selectNodeContents(this[0]);
    range.collapse(at_start);
    return sel.addRange(range);
  };

  $.fn.editableCaretAtStart = function() {
    var range;
    range = this.editableRange();
    if (!range) {
      return false;
    }
    return is_caret_at_start_of_node(this[0], range);
  };

  $.fn.editableCaretAtEnd = function() {
    var range;
    range = this.editableRange();
    if (!range) {
      return false;
    }
    return is_caret_at_end_of_node(this[0], range);
  };

  $.fn.editableCaretOnFirstLine = function() {
    var ctop, etop, range;
    range = this.editableRange();
    if (!range) {
      return false;
    }
    if (is_caret_at_start_of_node(this[0], range)) {
      return true;
    } else if (is_caret_at_end_of_node(this[0], range)) {
      ctop = this[0].getBoundingClientRect().bottom - LINE_HEIGHT;
    } else {
      ctop = range.getClientRects()[0].top;
    }
    etop = this[0].getBoundingClientRect().top;
    return ctop < etop + LINE_HEIGHT;
  };

  $.fn.editableCaretOnLastLine = function() {
    var cbtm, ebtm, range;
    range = this.editableRange();
    if (!range) {
      return false;
    }
    if (is_caret_at_end_of_node(this[0], range)) {
      return true;
    } else if (is_caret_at_start_of_node(this[0], range)) {
      cbtm = this[0].getBoundingClientRect().top + LINE_HEIGHT;
    } else {
      cbtm = range.getClientRects()[0].bottom;
    }
    ebtm = this[0].getBoundingClientRect().bottom;
    return cbtm > ebtm - LINE_HEIGHT;
  };

  $.fn.exists = function() {
    return this.length > 0;
  };

}).call(this);
