
(function ($) {
  Drupal.Panels = Drupal.Panels || {};

  Drupal.Panels.autoAttach = function() {
    if ($.browser.msie) {
      // If IE, attach a hover event so we can see our admin links.
      $("div.panel-pane").hover(
        function() {
          $('div.panel-hide', this).addClass("panel-hide-hover"); return true;
        },
        function() {
          $('div.panel-hide', this).removeClass("panel-hide-hover"); return true;
        }
      );
      $("div.admin-links").hover(
        function() {
          $(this).addClass("admin-links-hover"); return true;
        },
        function(){
          $(this).removeClass("admin-links-hover"); return true;
        }
      );
    }
  };

  $(Drupal.Panels.autoAttach);
})(jQuery);
;
(function ($) {

/**
 * Attaches double-click behavior to toggle full path of Krumo elements.
 */
Drupal.behaviors.devel = {
  attach: function (context, settings) {

    // Add hint to footnote
    $('.krumo-footnote .krumo-call').before('<img style="vertical-align: middle;" title="Click to expand. Double-click to show path." src="' + Drupal.settings.basePath + 'misc/help.png"/>');

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

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;
(function ($) {

/**
 * Attaches sticky table headers.
 */
Drupal.behaviors.tableHeader = {
  attach: function (context, settings) {
    if (!$.support.positionFixed) {
      return;
    }

    $('table.sticky-enabled', context).once('tableheader', function () {
      $(this).data("drupal-tableheader", new Drupal.tableHeader(this));
    });
  }
};

/**
 * Constructor for the tableHeader object. Provides sticky table headers.
 *
 * @param table
 *   DOM object for the table to add a sticky header to.
 */
Drupal.tableHeader = function (table) {
  var self = this;

  this.originalTable = $(table);
  this.originalHeader = $(table).children('thead');
  this.originalHeaderCells = this.originalHeader.find('> tr > th');
  this.displayWeight = null;

  // React to columns change to avoid making checks in the scroll callback.
  this.originalTable.bind('columnschange', function (e, display) {
    // This will force header size to be calculated on scroll.
    self.widthCalculated = (self.displayWeight !== null && self.displayWeight === display);
    self.displayWeight = display;
  });

  // Clone the table header so it inherits original jQuery properties. Hide
  // the table to avoid a flash of the header clone upon page load.
  this.stickyTable = $('<table class="sticky-header"/>')
    .insertBefore(this.originalTable)
    .css({ position: 'fixed', top: '0px' });
  this.stickyHeader = this.originalHeader.clone(true)
    .hide()
    .appendTo(this.stickyTable);
  this.stickyHeaderCells = this.stickyHeader.find('> tr > th');

  this.originalTable.addClass('sticky-table');
  $(window)
    .bind('scroll.drupal-tableheader', $.proxy(this, 'eventhandlerRecalculateStickyHeader'))
    .bind('resize.drupal-tableheader', { calculateWidth: true }, $.proxy(this, 'eventhandlerRecalculateStickyHeader'))
    // Make sure the anchor being scrolled into view is not hidden beneath the
    // sticky table header. Adjust the scrollTop if it does.
    .bind('drupalDisplaceAnchor.drupal-tableheader', function () {
      window.scrollBy(0, -self.stickyTable.outerHeight());
    })
    // Make sure the element being focused is not hidden beneath the sticky
    // table header. Adjust the scrollTop if it does.
    .bind('drupalDisplaceFocus.drupal-tableheader', function (event) {
      if (self.stickyVisible && event.clientY < (self.stickyOffsetTop + self.stickyTable.outerHeight()) && event.$target.closest('sticky-header').length === 0) {
        window.scrollBy(0, -self.stickyTable.outerHeight());
      }
    })
    .triggerHandler('resize.drupal-tableheader');

  // We hid the header to avoid it showing up erroneously on page load;
  // we need to unhide it now so that it will show up when expected.
  this.stickyHeader.show();
};

/**
 * Event handler: recalculates position of the sticky table header.
 *
 * @param event
 *   Event being triggered.
 */
Drupal.tableHeader.prototype.eventhandlerRecalculateStickyHeader = function (event) {
  var self = this;
  var calculateWidth = event.data && event.data.calculateWidth;

  // Reset top position of sticky table headers to the current top offset.
  this.stickyOffsetTop = Drupal.settings.tableHeaderOffset ? eval(Drupal.settings.tableHeaderOffset + '()') : 0;
  this.stickyTable.css('top', this.stickyOffsetTop + 'px');

  // Save positioning data.
  var viewHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  if (calculateWidth || this.viewHeight !== viewHeight) {
    this.viewHeight = viewHeight;
    this.vPosition = this.originalTable.offset().top - 4 - this.stickyOffsetTop;
    this.hPosition = this.originalTable.offset().left;
    this.vLength = this.originalTable[0].clientHeight - 100;
    calculateWidth = true;
  }

  // Track horizontal positioning relative to the viewport and set visibility.
  var hScroll = document.documentElement.scrollLeft || document.body.scrollLeft;
  var vOffset = (document.documentElement.scrollTop || document.body.scrollTop) - this.vPosition;
  this.stickyVisible = vOffset > 0 && vOffset < this.vLength;
  this.stickyTable.css({ left: (-hScroll + this.hPosition) + 'px', visibility: this.stickyVisible ? 'visible' : 'hidden' });

  // Only perform expensive calculations if the sticky header is actually
  // visible or when forced.
  if (this.stickyVisible && (calculateWidth || !this.widthCalculated)) {
    this.widthCalculated = true;
    var $that = null;
    var $stickyCell = null;
    var display = null;
    var cellWidth = null;
    // Resize header and its cell widths.
    // Only apply width to visible table cells. This prevents the header from
    // displaying incorrectly when the sticky header is no longer visible.
    for (var i = 0, il = this.originalHeaderCells.length; i < il; i += 1) {
      $that = $(this.originalHeaderCells[i]);
      $stickyCell = this.stickyHeaderCells.eq($that.index());
      display = $that.css('display');
      if (display !== 'none') {
        cellWidth = $that.css('width');
        // Exception for IE7.
        if (cellWidth === 'auto') {
          cellWidth = $that[0].clientWidth + 'px';
        }
        $stickyCell.css({'width': cellWidth, 'display': display});
      }
      else {
        $stickyCell.css('display', 'none');
      }
    }
    this.stickyTable.css('width', this.originalTable.outerWidth());
  }
};

})(jQuery);
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
