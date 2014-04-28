(function ($) {

 /**
   * UI Improvements for the Content Editing Form
   */
 Drupal.behaviors.panopolyAdmin = {
   attach: function (context, settings) {
     var width = $('#node-edit #edit-title').width() - $('#node-edit .form-item-path-alias label').width() - 5;
     $('#node-edit .form-item-path-alias input').css('width', width);

     if ($('#node-edit .form-item-body-und-0-value label').html() == 'Body <span class="form-required" title="This field is required.">*</span>') {
       $('#node-edit .form-item-body-und-0-value label').html('');
       $('#node-edit .form-item-body-und-0-value label').css('text-align', 'right');
     }

     if ($('#node-edit .form-item-field-featured-image-und-0-alt label')) {
       $('#node-edit .form-item-field-featured-image-und-0-alt label').html('Alt Text');
     }
   }
 }

 /**
   * Automatically Upload Files/Images Attached
   */
 Drupal.behaviors.panopolyAutoUpload = {
    attach: function (context, settings) {
      $('#node-edit input#edit-field-featured-image-und-0-upload').next('input[type="submit"]').hide();
      $('form', context).delegate('#node-edit input#edit-field-featured-image-und-0-upload', 'change', function() {  
        $(this).next('input[type="submit"]').mousedown();
      }); 
    }
  };
})(jQuery);
;
(function ($) {

 Drupal.behaviors.panopolyMagic = {
   attach: function (context, settings) {

     /**
      * Title Hax for Panopoly
      *
      * Replaces the markup of a node title pane with
      * the h1.title page element
      */
     if ($.trim($('.pane-node-title .pane-content').html()) == $.trim($('h1.title').html())) {
       $('.pane-node-title .pane-content').html('');
       $('h1.title').hide().clone().prependTo('.pane-node-title .pane-content');
       $('.pane-node-title h1.title').show();
     }

   }
 }

})(jQuery);

(function ($) {

  /**
   * Improves the Auto Submit Experience for CTools Modals
   */
  Drupal.behaviors.panopolyMagicAutosubmit = {
    attach: function (context, settings) {
      // 'this' references the form element
      function triggerSubmit (e) {
        var $this = $(this);
        if (!$this.hasClass('ctools-ajaxing')) {
          $this.addClass('ctools-ajaxing');
          $this.find('.ctools-auto-submit-click').click();
        }
      }

      function triggerDisable (e) {
        var $this = $(this);
        $this.find(':submit:not(.ctools-auto-submit-click)').val(Drupal.t('Updating...')).addClass('form-disabled').attr('disabled', 'disabled');
      }

      // e.keyCode: key
      var discardKeyCode = [
        16, // shift
        17, // ctrl
        18, // alt
        20, // caps lock
        33, // page up
        34, // page down
        35, // end
        36, // home
        37, // left arrow
        38, // up arrow
        39, // right arrow
        40, // down arrow
         9, // tab
        13, // enter
        27  // esc
      ];

      // Disable save button and update label on auto submit. 
      $(':submit.ctools-auto-submit-click', context)
      .once('ctools-auto-submit')
      .bind('click', function (e) {
        triggerDisable.call(e.target.form);
      });

      // Special handling for link field widgets. This ensures content which is ahah'd in still properly autosubmits.
      $('.field-widget-link-field input:text', context).addClass('panopoly-textfield-autosubmit').addClass('ctools-auto-submit-exclude');

      // Handle title fields.
      var timer;
      $('.panopoly-textfield-autosubmit', context)
      .once('ctools-auto-submit')
      .bind('keyup keydown blur', function (e) {
        var $element;
        $element = $('.widget-preview .pane-title', context);

        // Special handling for title elements.
        if (($element.length || !$.inArray(e.keycode, discardKeyCode)) && $(e.target).parent().hasClass('form-item-title')) {

          // If all text was removed, remove the existing title markup from the dom.
          if (!$(e.target).val().length) {
            $('.widget-preview .pane-title', context).remove();
          }
          // Insert as link title text if the title is a link.
          else if ($('a', $element).length) {
            $('a', $element).html($(e.target).val());
          }
          // Otherwise just insert the form value as-is.
          else {
            $element.html($(e.target).val());
          }
        } 
        // Automatically submit the field on blur. This won't happen if title markup is already present.
        else if (e.type == 'blur') {
          clearTimeout(timer);
          triggerSubmit.call(e.target.form)
        }
        // If all else fails, just trigger a timer to submit the form a second after the last activity.
        else {
          clearTimeout(timer);
          timer = setTimeout(function () { triggerSubmit.call(e.target.form); }, 1000)
        }
      });
  
      // Handle autocomplete fields.
      $('.panopoly-autocomplete-autosubmit', context)
      .once('ctools-auto-submit')
      .blur(function (e) {
        triggerSubmit.call(e.target.form);
      });

      // Handle textarea fields.
      $('.panopoly-textarea-autosubmit', context)
      .once('ctools-auto-submit')
      .bind('keyup keydown blur', function (e) {
        // On blur just autosubmit the form.
        if (e.type == 'blur') {
          clearTimeout(timer);
          triggerSubmit.call(e.target.form)
        }
        // Otherwise set a 1 second delay on anything that's a valid keypress.
        else {
          clearTimeout(timer);
          timer = setTimeout(function () { triggerSubmit.call(e.target.form); }, 1000)
        }
      });

      // Prevent ctools auto-submit from firing when changing text formats.
      $(':input.filter-list').addClass('ctools-auto-submit-exclude');

    }
  }
})(jQuery);
;
(function ($) {

 Drupal.behaviors.PanelsAccordionStyle = {
   attach: function (context, settings) {
     for ( region_id in Drupal.settings.accordion ) {
    		var accordion = Drupal.settings.accordion[region_id] ;
		    jQuery('#'+region_id).accordion(accordion.options);
  	 }
   }
  }

})(jQuery);
;
/**
 * @file
 * JavaScript integrations between the Caption Filter module and particular
 * WYSIWYG editors. This file also implements Insert module hooks to respond
 * to the insertion of content into a WYSIWYG or textarea.
 */
(function ($) {

$(document).bind('insertIntoActiveEditor', function(event, options) {
  if (options['fields']['title'] && Drupal.settings.captionFilter.widgets[options['widgetType']]) {
    options['content'] = '[caption]' + options['content'] + options['fields']['title'] + '[/caption]';
  }
});

Drupal.captionFilter = Drupal.captionFilter || {};

Drupal.captionFilter.toHTML = function(co, editor) {
  return co.replace(/(?:<p>)?\[caption([^\]]*)\]([\s\S]+?)\[\/caption\](?:<\/p>)?[\s\u00a0]*/g, function(a,b,c){
    var id, cls, w, tempClass;

    b = b.replace(/\\'|\\&#39;|\\&#039;/g, '&#39;').replace(/\\"|\\&quot;/g, '&quot;');
    c = c.replace(/\\&#39;|\\&#039;/g, '&#39;').replace(/\\&quot;/g, '&quot;');
    id = b.match(/id=['"]([^'"]+)/i);
    cls = b.match(/align=['"]([^'"]+)/i);
    w = c.match(/width=['"]([0-9]+)/);

    id = ( id && id[1] ) ? id[1] : '';
    cls = ( cls && cls[1] ) ? 'caption-' + cls[1] : '';
    w = ( w && w[1] ) ? w[1] : '';

    if (editor == 'tinymce')
      tempClass = (cls == 'caption-center') ? 'mceTemp mceIEcenter' : 'mceTemp';
    else if (editor == 'ckeditor')
      tempClass = (cls == 'caption-center') ? 'mceTemp mceIEcenter' : 'mceTemp';
    else
      tempClass = '';

    return '<div class="caption ' + cls + ' ' + tempClass + ' draggable"><div class="caption-inner" style="width: '+(parseInt(w))+'px">' + c + '</div></div>';
  });
};

Drupal.captionFilter.toTag = function(co) {
  return co.replace(/(<div class="caption [^"]*">)\s*<div[^>]+>(.+?)<\/div>\s*<\/div>\s*/gi, function(match, captionWrapper, contents) {
    var align;
    align = captionWrapper.match(/class=.*?caption-(left|center|right)/i);
    align = (align && align[1]) ? align[1] : '';

    return '[caption' + (align ? (' align="' + align + '"') : '') + ']' + contents + '[/caption]';
  });
};

})(jQuery);
;
