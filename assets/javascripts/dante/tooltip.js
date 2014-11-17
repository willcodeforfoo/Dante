(function() {
  var utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  utils = Dante.utils;

  Dante.Editor.Tooltip = (function(_super) {
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

    Tooltip.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
      this.current_editor = opts.editor;
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
      return "<figure contenteditable='false' class='graf graf--figure is-defaultValue' name='" + (utils.generateUniqueName()) + "' tabindex='0'> <div style='' class='aspectRatioPlaceholder is-locked'> <div style='padding-bottom: 100%;' class='aspect-ratio-fill'></div> <img src='' data-height='375' data-width='600' data-image-id='' class='graf-image' data-delayed-src=''> </div> <figcaption contenteditable='true' data-default-value='Type caption for image (optional)' class='imageCaption'> <span class='defaultValue'>Type caption for image (optional)</span> <br> </figcaption> </figure>";
    };

    Tooltip.prototype.extractTemplate = function() {
      return "<div class='graf graf--mixtapeEmbed is-selected' name=''> <a target='_blank' data-media-id='' class='js-mixtapeImage mixtapeImage mixtapeImage--empty u-ignoreBlock' href=''> </a> <a data-tooltip-type='link' data-tooltip-position='bottom' data-tooltip='' title='' class='markup--anchor markup--mixtapeEmbed-anchor' data-href='' href='' target='_blank'> <strong class='markup--strong markup--mixtapeEmbed-strong'></strong> <em class='markup--em markup--mixtapeEmbed-em'></em> </a> </div>";
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
      var node, tmpl;
      if (opts == null) {
        opts = {};
      }
      utils.log("process image here!");
      tmpl = $(this.insertTemplate());
      tmpl.find("img").attr('src', this.current_editor.default_loading_placeholder);
      if ($(image_element).parents(".graf").length > 0) {
        if ($(image_element).parents(".graf").hasClass("graf--figure")) {
          return;
        }
        utils.log("UNO");
        tmpl.insertBefore($(image_element).parents(".graf"));
        node = this.current_editor.getNode();
        this.current_editor.preCleanNode($(node));
        this.current_editor.addClassesToElement(node);
      } else {
        utils.log("DOS");
        $(image_element).replaceWith(tmpl);
      }
      utils.log(tmpl.attr('name'));
      return this.replaceImg(image_element, $("[name='" + (tmpl.attr('name')) + "']"));
    };

    Tooltip.prototype.replaceImg = function(image_element, figure) {
      var img;
      utils.log(figure.attr("name"));
      utils.log(figure);
      $(image_element).remove();
      img = new Image();
      img.onload = function() {
        console.log("and here comes the water!");
        console.log(figure);
        console.log(this.width + 'x' + this.height);
        figure.find(".aspectRatioPlaceholder").css({
          'max-width': this.width,
          'max-height': this.height,
          'height': this.height
        });
        figure.find("img").attr({
          'data-height': this.height,
          'data-width': this.width
        });
        return figure.find("img").attr('src', image_element.src);
      };
      return img.src = image_element.src;
    };

    Tooltip.prototype.displayAndUploadImages = function(file) {
      return this.displayCachedImage(file);
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
      this.node = this.current_editor.getNode();
      this.current_editor.tooltip_view.hide();
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
            utils.log("UPLOADED SHOW FROM CACHE");
            replaced_node.find(".aspectRatioPlaceholder").css({
              'max-width': i.width,
              'max-height': i.height
            });
            return _this.uploadFile(file, replaced_node);
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

    Tooltip.prototype.uploadFile = function(file, node) {
      var handleUp, n;
      n = node;
      handleUp = (function(_this) {
        return function(jqxhr) {
          return _this.uploadCompleted(jqxhr, n);
        };
      })(this);
      return $.ajax({
        type: "post",
        url: this.current_editor.upload_url,
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
        success: (function(_this) {
          return function(response) {
            handleUp(response);
          };
        })(this),
        error: (function(_this) {
          return function(jqxhr) {
            return utils.log("ERROR: got error uploading file " + jqxhr.responseText);
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

    Tooltip.prototype.uploadCompleted = function(url, node) {
      return node.find("img").attr("src", url);
    };

    Tooltip.prototype.displayEmbedPlaceHolder = function() {
      var ph;
      ph = this.current_editor.embed_placeholder;
      this.node = this.current_editor.getNode();
      $(this.node).html(ph).addClass("is-embedable");
      this.current_editor.setRangeAt(this.node);
      this.hide();
      return false;
    };

    Tooltip.prototype.getEmbedFromNode = function(node) {
      this.node_name = $(node).attr("name");
      return $.getJSON("" + this.current_editor.oembed_url + ($(this.node).text())).success((function(_this) {
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
      ph = this.current_editor.extract_placeholder;
      this.node = this.current_editor.getNode();
      $(this.node).html(ph).addClass("is-extractable");
      this.current_editor.setRangeAt(this.node);
      this.hide();
      return false;
    };

    Tooltip.prototype.getExtractFromNode = function(node) {
      this.node_name = $(node).attr("name");
      return $.getJSON("" + this.current_editor.extract_url + ($(this.node).text())).success((function(_this) {
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
      return $.getJSON("" + this.current_editor.extract_url + url).done(function(data) {
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

  })(Dante.View);

}).call(this);
