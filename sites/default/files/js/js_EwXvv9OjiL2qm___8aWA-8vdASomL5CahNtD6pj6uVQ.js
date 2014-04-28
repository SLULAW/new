(function ($) {
  // Override core JS so it works with "button" tags.
  /**
   * Attach behaviors to the file upload and remove buttons.
   */
  Drupal.behaviors.fileButtons = {
    attach: function (context) {
      $(':input.form-submit', context).bind('mousedown', Drupal.file.disableFields);
      $('div.form-managed-file :input.form-submit', context).bind('mousedown', Drupal.file.progressBar);
    },
    detach: function (context) {
      $(':input.form-submit', context).unbind('mousedown', Drupal.file.disableFields);
      $('div.form-managed-file :input.form-submit', context).unbind('mousedown', Drupal.file.progressBar);
    }
  };
  if (Drupal.file) {
    /**
     * Prevent file uploads when using buttons not intended to upload.
     */
    Drupal.file.disableFields = function (event){
      var clickedButton = this;

      // Only disable upload fields for Ajax buttons.
      if (!$(clickedButton).hasClass('ajax-processed')) {
        return;
      }

      // Check if we're working with an "Upload" button.
      var $enabledFields = [];
      if ($(this).closest('div.form-managed-file').length > 0) {
        $enabledFields = $(this).closest('div.form-managed-file').find(':input.form-file');
      }

      // Temporarily disable upload fields other than the one we're currently
      // working with. Filter out fields that are already disabled so that they
      // do not get enabled when we re-enable these fields at the end of behavior
      // processing. Re-enable in a setTimeout set to a relatively short amount
      // of time (1 second). All the other mousedown handlers (like Drupal's Ajax
      // behaviors) are excuted before any timeout functions are called, so we
      // don't have to worry about the fields being re-enabled too soon.
      // @todo If the previous sentence is true, why not set the timeout to 0?
      var $fieldsToTemporarilyDisable = $('div.form-managed-file :input.form-file').not($enabledFields).not(':disabled');
      $fieldsToTemporarilyDisable.attr('disabled', 'disabled');
      setTimeout(function (){
        $fieldsToTemporarilyDisable.attr('disabled', false);
      }, 1000);
    };
    /**
     * Add progress bar support if possible.
     */
    Drupal.file.progressBar = function (event) {
      var clickedButton = this;
      var $progressId = $(clickedButton).closest('div.form-managed-file').find(':input.file-progress');
      if ($progressId.length) {
        var originalName = $progressId.attr('name');

        // Replace the name with the required identifier.
        $progressId.attr('name', originalName.match(/APC_UPLOAD_PROGRESS|UPLOAD_IDENTIFIER/)[0]);

        // Restore the original name after the upload begins.
        setTimeout(function () {
          $progressId.attr('name', originalName);
        }, 1000);
      }
      // Show the progress bar if the upload takes longer than half a second.
      setTimeout(function () {
        $(clickedButton).closest('div.form-managed-file').find('div.ajax-progress-bar').slideDown();
      }, 500);
    };
  }
})(jQuery);
;
(function ($) {

/**
 * Attaches the autocomplete behavior to all required fields.
 */
Drupal.behaviors.autocomplete = {
  attach: function (context, settings) {
    var acdb = [];
    $('input.autocomplete', context).once('autocomplete', function () {
      var uri = this.value;
      if (!acdb[uri]) {
        acdb[uri] = new Drupal.ACDB(uri);
      }
      var $input = $('#' + this.id.substr(0, this.id.length - 13))
        .attr('autocomplete', 'OFF')
        .attr('aria-autocomplete', 'list');
      $($input[0].form).submit(Drupal.autocompleteSubmit);
      $input
        .after($('<span class="element-invisible" aria-live="assertive"></span>')
          .attr('id', $input.attr('id') + '-autocomplete-aria-live')
        );
      $input.parent().parent().attr('role', 'application');
      new Drupal.jsAC($input, acdb[uri]);
    });
  }
};

/**
 * Prevents the form from submitting if the suggestions popup is open
 * and closes the suggestions popup when doing so.
 */
Drupal.autocompleteSubmit = function () {
  return $('.form-autocomplete > .dropdown').each(function () {
    this.owner.hidePopup();
  }).length == 0;
};

/**
 * Highlights a suggestion.
 */
Drupal.jsAC.prototype.highlight = function (node) {
  if (this.selected) {
    $(this.selected).removeClass('active');
  }
  $(node).addClass('active');
  this.selected = node;
  $(this.ariaLive).html($(this.selected).html());
};

/**
 * Unhighlights a suggestion.
 */
Drupal.jsAC.prototype.unhighlight = function (node) {
  $(node).removeClass('active');
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Positions the suggestions popup and starts a search.
 */
Drupal.jsAC.prototype.populatePopup = function () {
  var $input = $(this.input);
  // Show popup.
  if (this.popup) {
    $(this.popup).remove();
  }
  this.selected = false;
  this.popup = $('<div class="dropdown"></div>')[0];
  this.popup.owner = this;
  $input.parent().after(this.popup);

  // Do search.
  this.db.owner = this;
  this.db.search(this.input.value);
};

/**
 * Fills the suggestion popup with any matches received.
 */
Drupal.jsAC.prototype.found = function (matches) {
  // If no value in the textfield, do not show the popup.
  if (!this.input.value.length) {
    return false;
  }

  // Prepare matches.
  var ul = $('<ul class="dropdown-menu"></ul>');
  var ac = this;
  ul.css({
    display: 'block',
    right: 0
  });
  for (var key in matches) {
    $('<li></li>')
      .html($('<a href="#"></a>').html(matches[key]).click(function (e) { e.preventDefault(); }))
      .mousedown(function () { ac.select(this); })
      .mouseover(function () { ac.highlight(this); })
      .mouseout(function () { ac.unhighlight(this); })
      .data('autocompleteValue', key)
      .appendTo(ul);
  }

  // Show popup with matches, if any.
  if (this.popup) {
    if (ul.children().length) {
      $(this.popup).empty().append(ul).show();
      $(this.ariaLive).html(Drupal.t('Autocomplete popup'));
    }
    else {
      $(this.popup).css({ visibility: 'hidden' });
      this.hidePopup();
    }
  }
};

Drupal.jsAC.prototype.setStatus = function (status) {
  var $throbber = $('.glyphicon-refresh, .autocomplete-throbber', $('#' + this.input.id).parent()).first();
  var throbbingClass = $throbber.is('.autocomplete-throbber') ? 'throbbing' : 'glyphicon-spin';
  switch (status) {
    case 'begin':
      $throbber.addClass(throbbingClass);
      $(this.ariaLive).html(Drupal.t('Searching for matches...'));
      break;
    case 'cancel':
    case 'error':
    case 'found':
      $throbber.removeClass(throbbingClass);
      break;
  }
};

})(jQuery);
;
(function ($) {

/**
 * Override Drupal's AJAX prototype beforeSend function so it can append the
 * throbber inside the pager links.
 */
Drupal.ajax.prototype.beforeSend = function (xmlhttprequest, options) {
  // For forms without file inputs, the jQuery Form plugin serializes the form
  // values, and then calls jQuery's $.ajax() function, which invokes this
  // handler. In this circumstance, options.extraData is never used. For forms
  // with file inputs, the jQuery Form plugin uses the browser's normal form
  // submission mechanism, but captures the response in a hidden IFRAME. In this
  // circumstance, it calls this handler first, and then appends hidden fields
  // to the form to submit the values in options.extraData. There is no simple
  // way to know which submission mechanism will be used, so we add to extraData
  // regardless, and allow it to be ignored in the former case.
  if (this.form) {
    options.extraData = options.extraData || {};

    // Let the server know when the IFRAME submission mechanism is used. The
    // server can use this information to wrap the JSON response in a TEXTAREA,
    // as per http://jquery.malsup.com/form/#file-upload.
    options.extraData.ajax_iframe_upload = '1';

    // The triggering element is about to be disabled (see below), but if it
    // contains a value (e.g., a checkbox, textfield, select, etc.), ensure that
    // value is included in the submission. As per above, submissions that use
    // $.ajax() are already serialized prior to the element being disabled, so
    // this is only needed for IFRAME submissions.
    var v = $.fieldValue(this.element);
    if (v !== null) {
      options.extraData[this.element.name] = v;
    }
  }

  // Disable the element that received the change to prevent user interface
  // interaction while the Ajax request is in progress. ajax.ajaxing prevents
  // the element from triggering a new request, but does not prevent the user
  // from changing its value.
  $(this.element).addClass('progress-disabled').attr('disabled', true);

  // Insert progressbar or throbber.
  if (this.progress.type == 'bar') {
    var progressBar = new Drupal.progressBar('ajax-progress-' + this.element.id, eval(this.progress.update_callback), this.progress.method, eval(this.progress.error_callback));
    if (this.progress.message) {
      progressBar.setProgress(-1, this.progress.message);
    }
    if (this.progress.url) {
      progressBar.startMonitoring(this.progress.url, this.progress.interval || 1500);
    }
    this.progress.element = $(progressBar.element).addClass('ajax-progress ajax-progress-bar');
    this.progress.object = progressBar;
    $(this.element).after(this.progress.element);
  }
  else if (this.progress.type == 'throbber') {
    this.progress.element = $('<div class="ajax-progress ajax-progress-throbber"><i class="glyphicon glyphicon-refresh glyphicon-spin"></i></div>');
    // If element is an input type, append after.
    if ($(this.element).is('input')) {
      if (this.progress.message) {
        $('.throbber', this.progress.element).after('<div class="message">' + this.progress.message + '</div>');
      }
      $(this.element).after(this.progress.element);
    }
    // Otherwise inject it inside the element.
    else {
      if (this.progress.message) {
        $('.throbber', this.progress.element).append('<div class="message">' + this.progress.message + '</div>');
      }
      $(this.element).append(this.progress.element);
    }
  }
};

})(jQuery);
;
