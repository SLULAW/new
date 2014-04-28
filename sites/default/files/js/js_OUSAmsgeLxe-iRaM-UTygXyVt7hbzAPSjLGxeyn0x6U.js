(function ($) {

/**
 * Attaches double-click behavior to toggle full path of Krumo elements.
 */
Drupal.behaviors.devel = {
  attach: function (context, settings) {

    // Add hint to footnote
    $('.krumo-footnote .krumo-call').once().before('<img style="vertical-align: middle;" title="Click to expand. Double-click to show path." src="' + settings.basePath + 'misc/help.png"/>');

    var krumo_name = [];
    var krumo_type = [];

    function krumo_traverse(el) {
      krumo_name.push($(el).html());
      krumo_type.push($(el).siblings('em').html().match(/\w*/)[0]);

      if ($(el).closest('.krumo-nest').length > 0) {
        krumo_traverse($(el).closest('.krumo-nest').prev().find('.krumo-name'));
      }
    }

    $('.krumo-child > div:first-child', context).dblclick(
      function(e) {
        if ($(this).find('> .krumo-php-path').length > 0) {
          // Remove path if shown.
          $(this).find('> .krumo-php-path').remove();
        }
        else {
          // Get elements.
          krumo_traverse($(this).find('> a.krumo-name'));

          // Create path.
          var krumo_path_string = '';
          for (var i = krumo_name.length - 1; i >= 0; --i) {
            // Start element.
            if ((krumo_name.length - 1) == i)
              krumo_path_string += '$' + krumo_name[i];

            if (typeof krumo_name[(i-1)] !== 'undefined') {
              if (krumo_type[i] == 'Array') {
                krumo_path_string += "[";
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += krumo_name[(i-1)];
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += "]";
              }
              if (krumo_type[i] == 'Object')
                krumo_path_string += '->' + krumo_name[(i-1)];
            }
          }
          $(this).append('<div class="krumo-php-path" style="font-family: Courier, monospace; font-weight: bold;">' + krumo_path_string + '</div>');

          // Reset arrays.
          krumo_name = [];
          krumo_type = [];
        }
      }
    );
  }
};

})(jQuery);
;
/**
 * @file layout.js
 *
 * Contains javascript to make layout modification a little nicer.
 */

(function ($) {
  Drupal.Panels.Layout = {};
  Drupal.Panels.Layout.autoAttach = function() {
    $('div.form-item div.layout-icon').click(function() {
      $widget = $('input', $(this).parent());
      // Toggle if a checkbox, turn on if a radio.
      $widget.attr('checked', !$widget.attr('checked') || $widget.is('input[type=radio]'));
    });
  };

  $(Drupal.Panels.Layout.autoAttach);
})(jQuery);
;
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;
/**
 * @file
 *
 * Implement a modal form.
 *
 * @see modal.inc for documentation.
 *
 * This javascript relies on the CTools ajax responder.
 */

(function ($) {
  // Make sure our objects are defined.
  Drupal.CTools = Drupal.CTools || {};
  Drupal.CTools.Modal = Drupal.CTools.Modal || {};

  /**
   * Display the modal
   *
   * @todo -- document the settings.
   */
  Drupal.CTools.Modal.show = function(choice) {
    var opts = {};

    if (choice && typeof choice == 'string' && Drupal.settings[choice]) {
      // This notation guarantees we are actually copying it.
      $.extend(true, opts, Drupal.settings[choice]);
    }
    else if (choice) {
      $.extend(true, opts, choice);
    }

    var defaults = {
      modalTheme: 'CToolsModalDialog',
      throbberTheme: 'CToolsModalThrobber',
      animation: 'show',
      animationSpeed: 'fast',
      modalSize: {
        type: 'scale',
        width: .8,
        height: .8,
        addWidth: 0,
        addHeight: 0,
        // How much to remove from the inner content to make space for the
        // theming.
        contentRight: 25,
        contentBottom: 45
      },
      modalOptions: {
        opacity: .55,
        background: '#fff'
      }
    };

    var settings = {};
    $.extend(true, settings, defaults, Drupal.settings.CToolsModal, opts);

    if (Drupal.CTools.Modal.currentSettings && Drupal.CTools.Modal.currentSettings != settings) {
      Drupal.CTools.Modal.modal.remove();
      Drupal.CTools.Modal.modal = null;
    }

    Drupal.CTools.Modal.currentSettings = settings;

    var resize = function(e) {
      // When creating the modal, it actually exists only in a theoretical
      // place that is not in the DOM. But once the modal exists, it is in the
      // DOM so the context must be set appropriately.
      var context = e ? document : Drupal.CTools.Modal.modal;

      if (Drupal.CTools.Modal.currentSettings.modalSize.type == 'scale') {
        var width = $(window).width() * Drupal.CTools.Modal.currentSettings.modalSize.width;
        var height = $(window).height() * Drupal.CTools.Modal.currentSettings.modalSize.height;
      }
      else {
        var width = Drupal.CTools.Modal.currentSettings.modalSize.width;
        var height = Drupal.CTools.Modal.currentSettings.modalSize.height;
      }

      // Use the additionol pixels for creating the width and height.
      $('div.ctools-modal-content', context).css({
        'width': width + Drupal.CTools.Modal.currentSettings.modalSize.addWidth + 'px',
        'height': height + Drupal.CTools.Modal.currentSettings.modalSize.addHeight + 'px'
      });
      $('div.ctools-modal-content .modal-content', context).css({
        'width': (width - Drupal.CTools.Modal.currentSettings.modalSize.contentRight) + 'px',
        'height': (height - Drupal.CTools.Modal.currentSettings.modalSize.contentBottom) + 'px'
      });
    }

    if (!Drupal.CTools.Modal.modal) {
      Drupal.CTools.Modal.modal = $(Drupal.theme(settings.modalTheme));
      if (settings.modalSize.type == 'scale') {
        $(window).bind('resize', resize);
      }
    }

    resize();

    $('span.modal-title', Drupal.CTools.Modal.modal).html(Drupal.CTools.Modal.currentSettings.loadingText);
    Drupal.CTools.Modal.modalContent(Drupal.CTools.Modal.modal, settings.modalOptions, settings.animation, settings.animationSpeed);
    $('#modalContent .modal-content').html(Drupal.theme(settings.throbberTheme));

    // Position autocomplete results based on the scroll position of the modal.
    $('#modalContent .modal-content').delegate('input.form-autocomplete', 'keyup', function() {
      $('#autocomplete').css('top', $(this).position().top + $(this).outerHeight() + $(this).offsetParent().filter('#modal-content').scrollTop());
    });
  };

  /**
   * Hide the modal
   */
  Drupal.CTools.Modal.dismiss = function() {
    if (Drupal.CTools.Modal.modal) {
      Drupal.CTools.Modal.unmodalContent(Drupal.CTools.Modal.modal);
    }
  };

  /**
   * Provide the HTML to create the modal dialog.
   */
  Drupal.theme.prototype.CToolsModalDialog = function () {
    var html = ''
    html += '  <div id="ctools-modal">'
    html += '    <div class="ctools-modal-content">' // panels-modal-content
    html += '      <div class="modal-header">';
    html += '        <a class="close" href="#">';
    html +=            Drupal.CTools.Modal.currentSettings.closeText + Drupal.CTools.Modal.currentSettings.closeImage;
    html += '        </a>';
    html += '        <span id="modal-title" class="modal-title">&nbsp;</span>';
    html += '      </div>';
    html += '      <div id="modal-content" class="modal-content">';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';

    return html;
  }

  /**
   * Provide the HTML to create the throbber.
   */
  Drupal.theme.prototype.CToolsModalThrobber = function () {
    var html = '';
    html += '  <div id="modal-throbber">';
    html += '    <div class="modal-throbber-wrapper">';
    html +=        Drupal.CTools.Modal.currentSettings.throbber;
    html += '    </div>';
    html += '  </div>';

    return html;
  };

  /**
   * Figure out what settings string to use to display a modal.
   */
  Drupal.CTools.Modal.getSettings = function (object) {
    var match = $(object).attr('class').match(/ctools-modal-(\S+)/);
    if (match) {
      return match[1];
    }
  }

  /**
   * Click function for modals that can be cached.
   */
  Drupal.CTools.Modal.clickAjaxCacheLink = function () {
    Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(this));
    return Drupal.CTools.AJAX.clickAJAXCacheLink.apply(this);
  };

  /**
   * Handler to prepare the modal for the response
   */
  Drupal.CTools.Modal.clickAjaxLink = function () {
    Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(this));
    return false;
  };

  /**
   * Submit responder to do an AJAX submit on all modal forms.
   */
  Drupal.CTools.Modal.submitAjaxForm = function(e) {
    var $form = $(this);
    var url = $form.attr('action');

    setTimeout(function() { Drupal.CTools.AJAX.ajaxSubmit($form, url); }, 1);
    return false;
  }

  /**
   * Bind links that will open modals to the appropriate function.
   */
  Drupal.behaviors.ZZCToolsModal = {
    attach: function(context) {
      // Bind links
      // Note that doing so in this order means that the two classes can be
      // used together safely.
      /*
       * @todo remimplement the warm caching feature
       $('a.ctools-use-modal-cache', context).once('ctools-use-modal', function() {
         $(this).click(Drupal.CTools.Modal.clickAjaxCacheLink);
         Drupal.CTools.AJAX.warmCache.apply(this);
       });
        */

      $('area.ctools-use-modal, a.ctools-use-modal', context).once('ctools-use-modal', function() {
        var $this = $(this);
        $this.click(Drupal.CTools.Modal.clickAjaxLink);
        // Create a drupal ajax object
        var element_settings = {};
        if ($this.attr('href')) {
          element_settings.url = $this.attr('href');
          element_settings.event = 'click';
          element_settings.progress = { type: 'throbber' };
        }
        var base = $this.attr('href');
        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
      });

      // Bind buttons
      $('input.ctools-use-modal, button.ctools-use-modal', context).once('ctools-use-modal', function() {
        var $this = $(this);
        $this.click(Drupal.CTools.Modal.clickAjaxLink);
        var button = this;
        var element_settings = {};

        // AJAX submits specified in this manner automatically submit to the
        // normal form action.
        element_settings.url = Drupal.CTools.Modal.findURL(this);
        if (element_settings.url == '') {
          element_settings.url = $(this).closest('form').attr('action');
        }
        element_settings.event = 'click';
        element_settings.setClick = true;

        var base = $this.attr('id');
        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);

        // Make sure changes to settings are reflected in the URL.
        $('.' + $(button).attr('id') + '-url').change(function() {
          Drupal.ajax[base].options.url = Drupal.CTools.Modal.findURL(button);
        });
      });

      // Bind our custom event to the form submit
      $('#modal-content form', context).once('ctools-use-modal', function() {
        var $this = $(this);
        var element_settings = {};

        element_settings.url = $this.attr('action');
        element_settings.event = 'submit';
        element_settings.progress = { 'type': 'throbber' }
        var base = $this.attr('id');

        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
        Drupal.ajax[base].form = $this;

        $('input[type=submit], button', this).click(function(event) {
          Drupal.ajax[base].element = this;
          this.form.clk = this;
          // An empty event means we were triggered via .click() and
          // in jquery 1.4 this won't trigger a submit.
          if (event.bubbles == undefined) {
            $(this.form).trigger('submit');
            return false;
          }
        });
      });

      // Bind a click handler to allow elements with the 'ctools-close-modal'
      // class to close the modal.
      $('.ctools-close-modal', context).once('ctools-close-modal')
        .click(function() {
          Drupal.CTools.Modal.dismiss();
          return false;
        });
    }
  };

  // The following are implementations of AJAX responder commands.

  /**
   * AJAX responder command to place HTML within the modal.
   */
  Drupal.CTools.Modal.modal_display = function(ajax, response, status) {
    if ($('#modalContent').length == 0) {
      Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(ajax.element));
    }
    $('#modal-title').html(response.title);
    // Simulate an actual page load by scrolling to the top after adding the
    // content. This is helpful for allowing users to see error messages at the
    // top of a form, etc.
    $('#modal-content').html(response.output).scrollTop(0);

    // Attach behaviors within a modal dialog.
    var settings = response.settings || ajax.settings || Drupal.settings;
    Drupal.attachBehaviors('#modalContent', settings);
  }

  /**
   * AJAX responder command to dismiss the modal.
   */
  Drupal.CTools.Modal.modal_dismiss = function(command) {
    Drupal.CTools.Modal.dismiss();
    $('link.ctools-temporary-css').remove();
  }

  /**
   * Display loading
   */
  //Drupal.CTools.AJAX.commands.modal_loading = function(command) {
  Drupal.CTools.Modal.modal_loading = function(command) {
    Drupal.CTools.Modal.modal_display({
      output: Drupal.theme(Drupal.CTools.Modal.currentSettings.throbberTheme),
      title: Drupal.CTools.Modal.currentSettings.loadingText
    });
  }

  /**
   * Find a URL for an AJAX button.
   *
   * The URL for this gadget will be composed of the values of items by
   * taking the ID of this item and adding -url and looking for that
   * class. They need to be in the form in order since we will
   * concat them all together using '/'.
   */
  Drupal.CTools.Modal.findURL = function(item) {
    var url = '';
    var url_class = '.' + $(item).attr('id') + '-url';
    $(url_class).each(
      function() {
        var $this = $(this);
        if (url && $this.val()) {
          url += '/';
        }
        url += $this.val();
      });
    return url;
  };


  /**
   * modalContent
   * @param content string to display in the content box
   * @param css obj of css attributes
   * @param animation (fadeIn, slideDown, show)
   * @param speed (valid animation speeds slow, medium, fast or # in ms)
   */
  Drupal.CTools.Modal.modalContent = function(content, css, animation, speed) {
    // If our animation isn't set, make it just show/pop
    if (!animation) {
      animation = 'show';
    }
    else {
      // If our animation isn't "fadeIn" or "slideDown" then it always is show
      if (animation != 'fadeIn' && animation != 'slideDown') {
        animation = 'show';
      }
    }

    if (!speed) {
      speed = 'fast';
    }

    // Build our base attributes and allow them to be overriden
    css = jQuery.extend({
      position: 'absolute',
      left: '0px',
      margin: '0px',
      background: '#000',
      opacity: '.55'
    }, css);

    // Add opacity handling for IE.
    css.filter = 'alpha(opacity=' + (100 * css.opacity) + ')';
    content.hide();

    // if we already ahve a modalContent, remove it
    if ( $('#modalBackdrop')) $('#modalBackdrop').remove();
    if ( $('#modalContent')) $('#modalContent').remove();

    // position code lifted from http://www.quirksmode.org/viewport/compatibility.html
    if (self.pageYOffset) { // all except Explorer
    var wt = self.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
      var wt = document.documentElement.scrollTop;
    } else if (document.body) { // all other Explorers
      var wt = document.body.scrollTop;
    }

    // Get our dimensions

    // Get the docHeight and (ugly hack) add 50 pixels to make sure we dont have a *visible* border below our div
    var docHeight = $(document).height() + 50;
    var docWidth = $(document).width();
    var winHeight = $(window).height();
    var winWidth = $(window).width();
    if( docHeight < winHeight ) docHeight = winHeight;

    // Create our divs
    $('body').append('<div id="modalBackdrop" style="z-index: 1000; display: none;"></div><div id="modalContent" style="z-index: 1001; position: absolute;">' + $(content).html() + '</div>');

    // Keyboard and focus event handler ensures focus stays on modal elements only
    modalEventHandler = function( event ) {
      target = null;
      if ( event ) { //Mozilla
        target = event.target;
      } else { //IE
        event = window.event;
        target = event.srcElement;
      }

      var parents = $(target).parents().get();
      for (var i = 0; i < parents.length; ++i) {
        var position = $(parents[i]).css('position');
        if (position == 'absolute' || position == 'fixed') {
          return true;
        }
      }
      if( $(target).filter('*:visible').parents('#modalContent').size()) {
        // allow the event only if target is a visible child node of #modalContent
        return true;
      }
      if ( $('#modalContent')) $('#modalContent').get(0).focus();
      return false;
    };
    $('body').bind( 'focus', modalEventHandler );
    $('body').bind( 'keypress', modalEventHandler );

    // Create our content div, get the dimensions, and hide it
    var modalContent = $('#modalContent').css('top','-1000px');
    var mdcTop = wt + ( winHeight / 2 ) - (  modalContent.outerHeight() / 2);
    var mdcLeft = ( winWidth / 2 ) - ( modalContent.outerWidth() / 2);
    $('#modalBackdrop').css(css).css('top', 0).css('height', docHeight + 'px').css('width', docWidth + 'px').show();
    modalContent.css({top: mdcTop + 'px', left: mdcLeft + 'px'}).hide()[animation](speed);

    // Bind a click for closing the modalContent
    modalContentClose = function(){close(); return false;};
    $('.close').bind('click', modalContentClose);

    // Bind a keypress on escape for closing the modalContent
    modalEventEscapeCloseHandler = function(event) {
      if (event.keyCode == 27) {
        close();
        return false;
      }
    };

    $(document).bind('keydown', modalEventEscapeCloseHandler);

    // Close the open modal content and backdrop
    function close() {
      // Unbind the events
      $(window).unbind('resize',  modalContentResize);
      $('body').unbind( 'focus', modalEventHandler);
      $('body').unbind( 'keypress', modalEventHandler );
      $('.close').unbind('click', modalContentClose);
      $('body').unbind('keypress', modalEventEscapeCloseHandler);
      $(document).trigger('CToolsDetachBehaviors', $('#modalContent'));

      // Set our animation parameters and use them
      if ( animation == 'fadeIn' ) animation = 'fadeOut';
      if ( animation == 'slideDown' ) animation = 'slideUp';
      if ( animation == 'show' ) animation = 'hide';

      // Close the content
      modalContent.hide()[animation](speed);

      // Remove the content
      $('#modalContent').remove();
      $('#modalBackdrop').remove();
    };

    // Move and resize the modalBackdrop and modalContent on resize of the window
     modalContentResize = function(){
      // Get our heights
      var docHeight = $(document).height();
      var docWidth = $(document).width();
      var winHeight = $(window).height();
      var winWidth = $(window).width();
      if( docHeight < winHeight ) docHeight = winHeight;

      // Get where we should move content to
      var modalContent = $('#modalContent');
      var mdcTop = ( winHeight / 2 ) - (  modalContent.outerHeight() / 2);
      var mdcLeft = ( winWidth / 2 ) - ( modalContent.outerWidth() / 2);

      // Apply the changes
      $('#modalBackdrop').css('height', docHeight + 'px').css('width', docWidth + 'px').show();
      modalContent.css('top', mdcTop + 'px').css('left', mdcLeft + 'px').show();
    };
    $(window).bind('resize', modalContentResize);

    $('#modalContent').focus();
  };

  /**
   * unmodalContent
   * @param content (The jQuery object to remove)
   * @param animation (fadeOut, slideUp, show)
   * @param speed (valid animation speeds slow, medium, fast or # in ms)
   */
  Drupal.CTools.Modal.unmodalContent = function(content, animation, speed)
  {
    // If our animation isn't set, make it just show/pop
    if (!animation) { var animation = 'show'; } else {
      // If our animation isn't "fade" then it always is show
      if (( animation != 'fadeOut' ) && ( animation != 'slideUp')) animation = 'show';
    }
    // Set a speed if we dont have one
    if ( !speed ) var speed = 'fast';

    // Unbind the events we bound
    $(window).unbind('resize', modalContentResize);
    $('body').unbind('focus', modalEventHandler);
    $('body').unbind('keypress', modalEventHandler);
    $('.close').unbind('click', modalContentClose);
    $(document).trigger('CToolsDetachBehaviors', $('#modalContent'));

    // jQuery magic loop through the instances and run the animations or removal.
    content.each(function(){
      if ( animation == 'fade' ) {
        $('#modalContent').fadeOut(speed, function() {
          $('#modalBackdrop').fadeOut(speed, function() {
            $(this).remove();
          });
          $(this).remove();
        });
      } else {
        if ( animation == 'slide' ) {
          $('#modalContent').slideUp(speed,function() {
            $('#modalBackdrop').slideUp(speed, function() {
              $(this).remove();
            });
            $(this).remove();
          });
        } else {
          $('#modalContent').remove();
          $('#modalBackdrop').remove();
        }
      }
    });
  };

$(function() {
  Drupal.ajax.prototype.commands.modal_display = Drupal.CTools.Modal.modal_display;
  Drupal.ajax.prototype.commands.modal_dismiss = Drupal.CTools.Modal.modal_dismiss;
});

})(jQuery);
;
/**
 * @file
 * Provides dependent visibility for form items in CTools' ajax forms.
 *
 * To your $form item definition add:
 * - '#process' => array('ctools_process_dependency'),
 * - '#dependency' => array('id-of-form-item' => array(list, of, values, that,
 *   make, this, item, show),
 *
 * Special considerations:
 * - Radios are harder. Because Drupal doesn't give radio groups individual IDs,
 *   use 'radio:name-of-radio'.
 *
 * - Checkboxes don't have their own id, so you need to add one in a div
 *   around the checkboxes via #prefix and #suffix. You actually need to add TWO
 *   divs because it's the parent that gets hidden. Also be sure to retain the
 *   'expand_checkboxes' in the #process array, because the CTools process will
 *   override it.
 */

(function ($) {
  Drupal.CTools = Drupal.CTools || {};
  Drupal.CTools.dependent = {};

  Drupal.CTools.dependent.bindings = {};
  Drupal.CTools.dependent.activeBindings = {};
  Drupal.CTools.dependent.activeTriggers = [];

  Drupal.CTools.dependent.inArray = function(array, search_term) {
    var i = array.length;
    while (i--) {
      if (array[i] == search_term) {
         return true;
      }
    }
    return false;
  }


  Drupal.CTools.dependent.autoAttach = function() {
    // Clear active bindings and triggers.
    for (i in Drupal.CTools.dependent.activeTriggers) {
      $(Drupal.CTools.dependent.activeTriggers[i]).unbind('change');
    }
    Drupal.CTools.dependent.activeTriggers = [];
    Drupal.CTools.dependent.activeBindings = {};
    Drupal.CTools.dependent.bindings = {};

    if (!Drupal.settings.CTools) {
      return;
    }

    // Iterate through all relationships
    for (id in Drupal.settings.CTools.dependent) {
      // Test to make sure the id even exists; this helps clean up multiple
      // AJAX calls with multiple forms.

      // Drupal.CTools.dependent.activeBindings[id] is a boolean,
      // whether the binding is active or not.  Defaults to no.
      Drupal.CTools.dependent.activeBindings[id] = 0;
      // Iterate through all possible values
      for(bind_id in Drupal.settings.CTools.dependent[id].values) {
        // This creates a backward relationship.  The bind_id is the ID
        // of the element which needs to change in order for the id to hide or become shown.
        // The id is the ID of the item which will be conditionally hidden or shown.
        // Here we're setting the bindings for the bind
        // id to be an empty array if it doesn't already have bindings to it
        if (!Drupal.CTools.dependent.bindings[bind_id]) {
          Drupal.CTools.dependent.bindings[bind_id] = [];
        }
        // Add this ID
        Drupal.CTools.dependent.bindings[bind_id].push(id);
        // Big long if statement.
        // Drupal.settings.CTools.dependent[id].values[bind_id] holds the possible values

        if (bind_id.substring(0, 6) == 'radio:') {
          var trigger_id = "input[name='" + bind_id.substring(6) + "']";
        }
        else {
          var trigger_id = '#' + bind_id;
        }

        Drupal.CTools.dependent.activeTriggers.push(trigger_id);

        if ($(trigger_id).attr('type') == 'checkbox') {
          $(trigger_id).siblings('label').addClass('hidden-options');
        }

        var getValue = function(item, trigger) {
          if ($(trigger).size() == 0) {
            return null;
          }

          if (item.substring(0, 6) == 'radio:') {
            var val = $(trigger + ':checked').val();
          }
          else {
            switch ($(trigger).attr('type')) {
              case 'checkbox':
                var val = $(trigger).attr('checked') ? true : false;

                if (val) {
                  $(trigger).siblings('label').removeClass('hidden-options').addClass('expanded-options');
                }
                else {
                  $(trigger).siblings('label').removeClass('expanded-options').addClass('hidden-options');
                }

                break;
              default:
                var val = $(trigger).val();
            }
          }
          return val;
        }

        var setChangeTrigger = function(trigger_id, bind_id) {
          // Triggered when change() is clicked.
          var changeTrigger = function() {
            var val = getValue(bind_id, trigger_id);

            if (val == null) {
              return;
            }

            for (i in Drupal.CTools.dependent.bindings[bind_id]) {
              var id = Drupal.CTools.dependent.bindings[bind_id][i];
              // Fix numerous errors
              if (typeof id != 'string') {
                continue;
              }

              // This bit had to be rewritten a bit because two properties on the
              // same set caused the counter to go up and up and up.
              if (!Drupal.CTools.dependent.activeBindings[id]) {
                Drupal.CTools.dependent.activeBindings[id] = {};
              }

              if (val != null && Drupal.CTools.dependent.inArray(Drupal.settings.CTools.dependent[id].values[bind_id], val)) {
                Drupal.CTools.dependent.activeBindings[id][bind_id] = 'bind';
              }
              else {
                delete Drupal.CTools.dependent.activeBindings[id][bind_id];
              }

              var len = 0;
              for (i in Drupal.CTools.dependent.activeBindings[id]) {
                len++;
              }

              var object = $('#' + id + '-wrapper');
              if (!object.size()) {
                // Some elements can't use the parent() method or they can
                // damage things. They are guaranteed to have wrappers but
                // only if dependent.inc provided them. This check prevents
                // problems when multiple AJAX calls cause settings to build
                // up.
                var $original = $('#' + id);
                if ($original.is('fieldset') || $original.is('textarea')) {
                  continue;
                }

                object = $('#' + id).parent();
              }

              if (Drupal.settings.CTools.dependent[id].type == 'disable') {
                if (Drupal.settings.CTools.dependent[id].num <= len) {
                  // Show if the element if criteria is matched
                  object.attr('disabled', false);
                  object.addClass('dependent-options');
                  object.children().attr('disabled', false);
                }
                else {
                  // Otherwise hide. Use css rather than hide() because hide()
                  // does not work if the item is already hidden, for example,
                  // in a collapsed fieldset.
                  object.attr('disabled', true);
                  object.children().attr('disabled', true);
                }
              }
              else {
                if (Drupal.settings.CTools.dependent[id].num <= len) {
                  // Show if the element if criteria is matched
                  object.show(0);
                  object.addClass('dependent-options');
                }
                else {
                  // Otherwise hide. Use css rather than hide() because hide()
                  // does not work if the item is already hidden, for example,
                  // in a collapsed fieldset.
                  object.css('display', 'none');
                }
              }
            }
          }

          $(trigger_id).change(function() {
            // Trigger the internal change function
            // the attr('id') is used because closures are more confusing
            changeTrigger(trigger_id, bind_id);
          });
          // Trigger initial reaction
          changeTrigger(trigger_id, bind_id);
        }
        setChangeTrigger(trigger_id, bind_id);
      }
    }
  }

  Drupal.behaviors.CToolsDependent = {
    attach: function (context) {
      Drupal.CTools.dependent.autoAttach();

      // Really large sets of fields are too slow with the above method, so this
      // is a sort of hacked one that's faster but much less flexible.
      $("select.ctools-master-dependent")
        .once('ctools-dependent')
        .change(function() {
          var val = $(this).val();
          if (val == 'all') {
            $('.ctools-dependent-all').show(0);
          }
          else {
            $('.ctools-dependent-all').hide(0);
            $('.ctools-dependent-' + val).show(0);
          }
        })
        .trigger('change');
    }
  }
})(jQuery);
;
(function ($) {
  Drupal.behaviors.improved_multi_select = {
    attach: function(context, settings) {
      if (settings.improved_multi_select && settings.improved_multi_select.selectors) {
        var options = settings.improved_multi_select;

        for (var key in options.selectors) {
          var selector = options.selectors[key];
          $(selector, context).once('improvedselect', function() {
            var $select = $(this),
              moveButtons = '',
              improvedselect_id = $select.attr('id'),
              $cloned_select = null,
              cloned_select_id = '';
            if (options.orderable) {
              // If the select is orderable then we clone the original select
              // so that we have the original ordering to use later.
              $cloned_select = $select.clone();
              cloned_select_id = $cloned_select.attr('id');
              cloned_select_id += '-cloned';
              $cloned_select.attr('id', cloned_select_id);
              $cloned_select.appendTo($select.parent()).hide();
              // Move button markup to add to the widget.
              moveButtons = '<span class="move_up" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_moveup) + '</span>' +
                            '<span class="move_down" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_movedown) + '</span>';
            }
            $select.parent().append(
              '<div class="improvedselect" sid="' + $select.attr('id') + '" id="improvedselect-' + $select.attr('id') + '">' +
                '<div class="improvedselect-text-wrapper">' +
                  '<input type="text" class="improvedselect_filter" sid="' + $select.attr('id') + '" prev="" />' +
                '</div>' +
                '<ul class="improvedselect_sel"></ul>' +
                '<ul class="improvedselect_all"></ul>' +
                '<div class="improvedselect_control">' +
                  '<span class="add" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_add) + '</span>' +
                  '<span class="del" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_del) + '</span>' +
                  '<span class="add_all" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_addall) + '</span>' +
                  '<span class="del_all" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_delall) + '</span>' +
                  moveButtons +
                '</div>' +
                '<div class="clear"></div>' +
              '</div>');
            if ($select.find('optgroup').has('option').length > 0) {
              $select.parent().find('.improvedselect').addClass('has_group');
              // Build groups.
              $('#improvedselect-' + improvedselect_id + ' .improvedselect-text-wrapper', context)
                .after('<div class="improvedselect_tabs-wrapper" sid="' + $select.attr('id') + '"><ul class="improvedselect_tabs"></ul></div>');
              $select.find('optgroup').has('option').each(function() {
                $('#improvedselect-' + improvedselect_id + ' .improvedselect_tabs', context)
                  .append('<li><a href="">' + $(this).attr('label') + '</a></li>');
              });
              // Show all groups option.
              $('#improvedselect-' + improvedselect_id + ' .improvedselect_tabs', context)
                .prepend('<li class="all"><a href="">' + Drupal.t('All') + '</a></li>');
              // Select group.
              $('#improvedselect-' + improvedselect_id + ' .improvedselect_tabs li a', context).click(function(e) {
                var $group = $(this),
                  sid = $group.parent().parent().parent().attr('sid');
                $('#improvedselect-' + improvedselect_id + ' .improvedselect_tabs li.selected', context).removeClass('selected').find('a').unwrap();
                $group.wrap('<div>').parents('li').first().addClass('selected');

                // Any existing selections in the all list need to be unselected
                // if they aren't part of the newly selected group.
                if (!$group.hasClass('all')) {
                  $('#improvedselect-' + improvedselect_id + ' .improvedselect_all li.selected[group!=' + $group.text() + ']', context).removeClass('selected');
                }

                // Clear the filter if we have to.
                if (options.groupresetfilter) {
                  // Clear filter box.
                  $('#improvedselect-' + improvedselect_id + ' .improvedselect_filter', context).val('');
                }
                // Force re-filtering.
                $('#improvedselect-' + improvedselect_id + ' .improvedselect_filter', context).attr('prev', '');
                // Re-filtering will handle the rest.
                improvedselectFilter(sid, options, context);
                e.preventDefault();
              });
              // Select all to begin.
              $('#improvedselect-' + improvedselect_id + ' .improvedselect_tabs li.all a', context).click();
            }

            $select.find('option, optgroup').each(function() {
              var $opt = $(this),
                group = '';
              if ($opt.attr('tagName') == 'OPTGROUP') {
                if ($opt.has('option').length) {
                  $('#improvedselect-'+ improvedselect_id +' .improvedselect_all', context)
                    .append('<li isgroup="isgroup" so="---' + $opt.attr('label') + '---">--- '+ $opt.attr('label') +' ---</li>');
                }
              }
              else {
                group = $opt.parent("optgroup").attr("label");
                if (group) {
                  group = ' group="' + group + '"';
                }
                if ($opt.attr('selected')) {
                  $('#improvedselect-' + improvedselect_id + ' .improvedselect_sel', context)
                    .append('<li so="' + $opt.attr('value') + '"' + group + '>' + $opt.text() + '</li>');
                }
                else {
                  $('#improvedselect-' + improvedselect_id + ' .improvedselect_all', context)
                    .append('<li so="' + $opt.attr('value') + '"' + group + '>' + $opt.text() + '</li>');
                }
              }
            });
            $('#improvedselect-'+ improvedselect_id + ' .improvedselect_sel li, #improvedselect-' + improvedselect_id + ' .improvedselect_all li[isgroup!="isgroup"]', context).click(function() {
              $(this).toggleClass('selected');
            });
            $select.hide();
            // Double click feature request.
            $('#improvedselect-'+ improvedselect_id + ' .improvedselect_sel li, #improvedselect-' + improvedselect_id + ' .improvedselect_all li[isgroup!="isgroup"]', context).dblclick(function() {
              // Store selected items.
              var selected = $(this).parent().find('li.selected'),
                current_class = $(this).parent().attr('class');
              // Add item.
              if (current_class == 'improvedselect_all') {
                $(this).parent().find('li.selected').removeClass('selected');
                $(this).addClass('selected');
                $(this).parent().parent().find('.add').click();
              }
              // Remove item.
              else {
                $(this).parent().find('li.selected').removeClass('selected');
                $(this).addClass('selected');
                $(this).parent().parent().find('.del').click();
              }
              // Restore selected items.
              if (selected.length) {
                for (var k = 0; k < selected.length; k++) {
                  if ($(selected[k]).parent().attr('class') == current_class) {
                    $(selected[k]).addClass('selected');
                  }
                }
              }
            });

            // Set the height of the select fields based on the height of the
            // parent, otherwise it can end up with a lot of wasted space.
            $('.improvedselect_sel, .improvedselect_all').each(function() {
              $(this).height($(this).parent().height() - 35);
            });
          });
        }

        $('.improvedselect_filter', context).keyup(function() {
          improvedselectFilter($(this).attr('sid'), options, context);
        });

        // Add selected items.
        $('.improvedselect .add', context).click(function() {
          var sid = $(this).attr('sid');
          $('#improvedselect-' + sid + ' .improvedselect_all .selected', context).each(function() {
            $opt = $(this);
            $opt.removeClass('selected');
            improvedselectUpdateGroupVisibility($opt, 1);
            $('#improvedselect-' + sid + ' .improvedselect_sel', context).append($opt);
          });
          improvedselectUpdate(sid, context);
        });

        // Remove selected items.
        $('.improvedselect .del', context).click(function() {
          var sid = $(this).attr('sid');
          $('#improvedselect-' + sid + ' .improvedselect_sel .selected', context).each(function() {
            $opt = $(this);
            $opt.removeClass('selected');
            $('#improvedselect-' + sid + ' .improvedselect_all', context).append($opt);
            improvedselectUpdateGroupVisibility($opt, 0);
          });
          // Force re-filtering.
          $('#improvedselect-' + sid + ' .improvedselect_filter', context).attr('prev', '');
          // Re-filtering will handle the rest.
          improvedselectFilter(sid, options, context);
          improvedselectUpdate(sid, context);
        });

        // Add all items.
        $('.improvedselect .add_all', context).click(function() {
          var sid = $(this).attr('sid');
          $('#improvedselect-' + sid + ' .improvedselect_all li[isgroup!=isgroup]', context).each(function() {
            $opt = $(this);
            if ($opt.css('display') != 'none') {
              $opt.removeClass('selected');
              improvedselectUpdateGroupVisibility($opt, 1);
              $('#improvedselect-' + sid + ' .improvedselect_sel', context).append($opt);
            }
          });
          improvedselectUpdate(sid, context);
        });

        // Remove all items.
        $('.improvedselect .del_all', context).click(function() {
          var sid = $(this).attr('sid');
          $('#improvedselect-' + sid + ' .improvedselect_sel li', context).each(function() {
            $opt = $(this);
            $opt.removeClass('selected');
            $('#improvedselect-' + sid + ' .improvedselect_all', context).append($opt);
            improvedselectUpdateGroupVisibility($opt, 0);
          });
          // Force re-filtering.
          $('#improvedselect-' + sid + ' .improvedselect_filter', context).attr('prev', '');
          // Re-filtering will handle the rest.
          improvedselectFilter(sid, options, context);
          improvedselectUpdate(sid, context);
        });

        // Move selected items up.
        $('.improvedselect .move_up', context).click(function() {
          var sid = $(this).attr('sid');
          $('#improvedselect-' + sid + ' .improvedselect_sel .selected', context).each(function() {
            var $selected = $(this);
            // Don't move selected items past other selected items or there will
            // be problems when moving multiple items at once.
            $selected.prev(':not(.selected)').before($selected);
          });
          improvedselectUpdate(sid, context);
        });

        // Move selected items down.
        $('.improvedselect .move_down', context).click(function() {
          var sid = $(this).attr('sid');
          // Run through the selections in reverse, otherwise problems occur
          // when moving multiple items at once.
          $($('#improvedselect-' + sid + ' .improvedselect_sel .selected', context).get().reverse()).each(function() {
            var $selected = $(this);
            // Don't move selected items past other selected items or there will
            // be problems when moving multiple items at once.
            $selected.next(':not(.selected)').after($selected);
          });
          improvedselectUpdate(sid, context);
        });
        // Let other scripts know improvedSelect was initialized
        $.event.trigger('improvedMultiSelectInitialized', [$(this)]);
      }
      // Let other scripts know improvedSelect has been attached
      $.event.trigger('improvedMultiSelectAttached');
    }
  };

  /**
   * Filter the all options list.
   */
  function improvedselectFilter(sid, options, context) {
    $filter = $('.improvedselect_filter', context);
    // Get current selected group.
    var $selectedGroup = $('#improvedselect-' + sid + ' .improvedselect_tabs li.selected:not(.all) a', context),
      text = $filter.val(),
      pattern,
      regex,
      words;

    if (text.length && text != $filter.attr('prev')) {
      $filter.attr('prev', text);
      switch (options.filtertype) {
        case 'partial':
        default:
          pattern = text;
          break;
        case 'exact':
          pattern = '^' + text + '$';
          break;
        case 'anywords':
          words = text.split(' ');
          pattern = '';
          for (var i = 0; i < words.length; i++) {
            if (words[i]) {
              pattern += (pattern) ? '|\\b' + words[i] + '\\b' : '\\b' + words[i] + '\\b';
            }
          }
          break;
        case 'anywords_partial':
          words = text.split(' ');
          pattern = '';
          for (var i = 0; i < words.length; i++) {
            if (words[i]) {
              pattern += (pattern) ? '|' + words[i] + '' : words[i];
            }
          }
          break;
        case 'allwords':
          words = text.split(' ');
          pattern = '^';
          // Add a lookahead for each individual word.
          // Lookahead is used because the words can match in any order
          // so this makes it simpler and faster.
          for (var i = 0; i < words.length; i++) {
            if (words[i]) {
              pattern += '(?=.*?\\b' + words[i] + '\\b)';
            }
          }
          break;
        case 'allwords_partial':
          words = text.split(' ');
          pattern = '^';
          // Add a lookahead for each individual word.
          // Lookahead is used because the words can match in any order
          // so this makes it simpler and faster.
          for (var i = 0; i < words.length; i++) {
            if (words[i]) {
              pattern += '(?=.*?' + words[i] + ')';
            }
          }
          break;
      }

      regex = new RegExp(pattern,'i');
      $('#improvedselect-' + sid + ' .improvedselect_all li', context).each(function() {
        $opt = $(this);
        if ($opt.attr('isgroup') != 'isgroup') {
          var str = $opt.text();
          if (str.match(regex) && (!$selectedGroup.length || $selectedGroup.text() == $opt.attr('group'))) {
            $opt.show();
            if ($opt.attr('group')) {
              // If a group is selected we don't need to show groups.
              if (!$selectedGroup.length) {
                $opt.siblings('li[isgroup="isgroup"][so="---' + $opt.attr('group') + '---"]').show();
              }
              else {
                $opt.siblings('li[isgroup="isgroup"][so="---' + $opt.attr('group') + '---"]').hide();
              }
            }
          }
          else {
            $opt.hide();
            if ($opt.attr('group')) {
              if ($opt.siblings('li[isgroup!="isgroup"][group="' + $opt.attr('group') + '"]:visible').length == 0) {
                $opt.siblings('li[isgroup="isgroup"][so="---' + $opt.attr('group') + '---"]').hide();
              }
            }
          }
        }
      });
    }
    else {
      if (!text.length) {
        $filter.attr('prev', '');
      }
      $('#improvedselect-' + sid + ' .improvedselect_all li', context).each(function() {
        var $opt = $(this);
        if ($opt.attr('isgroup') != 'isgroup') {
          if (!$selectedGroup.length || $selectedGroup.text() == $opt.attr('group')) {
            $opt.show();
          }
          else {
            $opt.hide();
          }
          improvedselectUpdateGroupVisibility($opt, 0);
        }
      });
    }
  }

  /**
   * Update the visibility of an option's group.
   *
   * @param $opt
   *   A jQuery object of a select option.
   * @param numItems
   *   How many items should be considered an empty group. Generally zero or one
   *   depending on if an item has been or is going to be removed or added.
   */
  function improvedselectUpdateGroupVisibility($opt, numItems) {
    var $selectedGroup = $opt.parents('.improvedselect').first().find('.improvedselect_tabs li.selected:not(.all) a');

    // Don't show groups if a group is selected.
    if ($opt.parent().children('li[isgroup!="isgroup"][group="' + $opt.attr('group') + '"]:visible').length <= numItems || $selectedGroup.length) {
      $opt.siblings('li[isgroup="isgroup"][so="---' + $opt.attr('group') + '---"]').hide();
    }
    else {
      $opt.siblings('li[isgroup="isgroup"][so="---' + $opt.attr('group') + '---"]').show();
    }
  }

  function improvedselectUpdate(sid, context) {
    // If we have sorting enabled, make sure we have the results sorted.
    var $select = $('#' + sid),
      $cloned_select = $('#' + sid + '-cloned');

    if ($cloned_select.length) {
      $select.find('option, optgroup').remove();
      $('#improvedselect-' + sid + ' .improvedselect_sel li', context).each(function() {
        var $li = $(this);
        $select.append($('<option></option').attr('value', $li.attr('so')).attr('selected', 'selected').text($li.text()));
      });
      // Now that the select has the options in the correct order, use the
      // cloned select for resetting the ul values.
      $select = $cloned_select;
    }
    else {
      $select.find('option:selected').attr("selected", "");
      $('#improvedselect-' + sid + ' .improvedselect_sel li', context).each(function() {
        $('#' + sid + ' [value="' + $(this).attr('so') + '"]', context).attr("selected", "selected");
      });
    }

    $select.find('option, optgroup').each(function() {
      $opt = $(this);
      if ($opt.attr('tagName') == 'OPTGROUP') {
        if ($opt.has('option').length) {
          $('#improvedselect-' + sid + ' .improvedselect_all', context).append($('#improvedselect-' + sid + ' .improvedselect_all [so="---' + $opt.attr('label') + '---"]', context));
        }
      }
      else {
        // When using reordering, the options will be from the cloned select,
        // meaning that there will be none selected, which means that items
        // in the selected list will not be reordered, which is what we want.
        if ($opt.attr("selected")) {
          $('#improvedselect-' + sid + ' .improvedselect_sel', context).append($('#improvedselect-' + sid + ' .improvedselect_sel [so="' + $opt.attr('value') + '"]', context));
        }
        else {
          $('#improvedselect-' + sid + ' .improvedselect_all', context).append($('#improvedselect-' + sid + ' .improvedselect_all [so="' + $opt.attr('value') + '"]', context));
        }
      }
    });
    // Don't use the $select variable here as it might be the clone.
    // Tell the ajax system the select has changed.
    $('#' + sid, context).trigger('change');
  }

})(jQuery, Drupal);
;
(function ($) {

Drupal.toolbar = Drupal.toolbar || {};

/**
 * Attach toggling behavior and notify the overlay of the toolbar.
 */
Drupal.behaviors.toolbar = {
  attach: function(context) {

    // Set the initial state of the toolbar.
    $('#toolbar', context).once('toolbar', Drupal.toolbar.init);

    // Toggling toolbar drawer.
    $('#toolbar a.toggle', context).once('toolbar-toggle').click(function(e) {
      Drupal.toolbar.toggle();
      // Allow resize event handlers to recalculate sizes/positions.
      $(window).triggerHandler('resize');
      return false;
    });
  }
};

/**
 * Retrieve last saved cookie settings and set up the initial toolbar state.
 */
Drupal.toolbar.init = function() {
  // Retrieve the collapsed status from a stored cookie.
  var collapsed = $.cookie('Drupal.toolbar.collapsed');

  // Expand or collapse the toolbar based on the cookie value.
  if (collapsed == 1) {
    Drupal.toolbar.collapse();
  }
  else {
    Drupal.toolbar.expand();
  }
};

/**
 * Collapse the toolbar.
 */
Drupal.toolbar.collapse = function() {
  var toggle_text = Drupal.t('Show shortcuts');
  $('#toolbar div.toolbar-drawer').addClass('collapsed');
  $('#toolbar a.toggle')
    .removeClass('toggle-active')
    .attr('title',  toggle_text)
    .html(toggle_text);
  $('body').removeClass('toolbar-drawer').css('paddingTop', Drupal.toolbar.height());
  $.cookie(
    'Drupal.toolbar.collapsed',
    1,
    {
      path: Drupal.settings.basePath,
      // The cookie should "never" expire.
      expires: 36500
    }
  );
};

/**
 * Expand the toolbar.
 */
Drupal.toolbar.expand = function() {
  var toggle_text = Drupal.t('Hide shortcuts');
  $('#toolbar div.toolbar-drawer').removeClass('collapsed');
  $('#toolbar a.toggle')
    .addClass('toggle-active')
    .attr('title',  toggle_text)
    .html(toggle_text);
  $('body').addClass('toolbar-drawer').css('paddingTop', Drupal.toolbar.height());
  $.cookie(
    'Drupal.toolbar.collapsed',
    0,
    {
      path: Drupal.settings.basePath,
      // The cookie should "never" expire.
      expires: 36500
    }
  );
};

/**
 * Toggle the toolbar.
 */
Drupal.toolbar.toggle = function() {
  if ($('#toolbar div.toolbar-drawer').hasClass('collapsed')) {
    Drupal.toolbar.expand();
  }
  else {
    Drupal.toolbar.collapse();
  }
};

Drupal.toolbar.height = function() {
  var $toolbar = $('#toolbar');
  var height = $toolbar.outerHeight();
  // In modern browsers (including IE9), when box-shadow is defined, use the
  // normal height.
  var cssBoxShadowValue = $toolbar.css('box-shadow');
  var boxShadow = (typeof cssBoxShadowValue !== 'undefined' && cssBoxShadowValue !== 'none');
  // In IE8 and below, we use the shadow filter to apply box-shadow styles to
  // the toolbar. It adds some extra height that we need to remove.
  if (!boxShadow && /DXImageTransform\.Microsoft\.Shadow/.test($toolbar.css('filter'))) {
    height -= $toolbar[0].filters.item("DXImageTransform.Microsoft.Shadow").strength;
  }
  return height;
};

})(jQuery);
;
