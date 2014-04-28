
/**
 * Creates a namespace.
 *
 * @return
 *   The created namespace object.
 */
function namespace () {
  var a=arguments, o=null, i, j, d;
  for (i=0; i<a.length; i=i+1) {
    d=a[i].split(".");
    o=window;
    for (j=0; j<d.length; j=j+1) {
      o[d[j]]=o[d[j]] || {};
      o=o[d[j]];
    }
  }
  return o;
};
;
/**
 * This is part of a patch to address a jQueryUI bug.  The bug is responsible
 * for the inability to scroll a page when a modal dialog is active. If the content
 * of the dialog extends beyond the bottom of the viewport, the user is only able
 * to scroll with a mousewheel or up/down keyboard keys.
 *
 * @see http://bugs.jqueryui.com/ticket/4671
 * @see https://bugs.webkit.org/show_bug.cgi?id=19033
 * @see views_ui.module
 * @see js/jquery.ui.dialog.min.js
 *
 * This javascript patch overwrites the $.ui.dialog.overlay.events object to remove
 * the mousedown, mouseup and click events from the list of events that are bound
 * in $.ui.dialog.overlay.create
 *
 * The original code for this object:
 * $.ui.dialog.overlay.events: $.map('focus,mousedown,mouseup,keydown,keypress,click'.split(','),
 *  function(event) { return event + '.dialog-overlay'; }).join(' '),
 *
 */

(function ($, undefined) {
  if ($.ui && $.ui.dialog) {
    $.ui.dialog.overlay.events = $.map('focus,keydown,keypress'.split(','),
                                 function(event) { return event + '.dialog-overlay'; }).join(' ');
  }
}(jQuery));
;
/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
;
/*
 * debug - v0.3 - 6/8/2009
 * http://benalman.com/projects/javascript-debug-console-log/
 *
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Licensed under the MIT license
 * http://benalman.com/about/license/
 *
 * With lots of help from Paul Irish!
 * http://paulirish.com/
 */
window.debug=(function(){var c=this,e=Array.prototype.slice,b=c.console,i={},f,g,j=9,d=["error","warn","info","debug","log"],m="assert clear count dir dirxml group groupEnd profile profileEnd time timeEnd trace".split(" "),k=m.length,a=[];while(--k>=0){(function(n){i[n]=function(){j!==0&&b&&b[n]&&b[n].apply(b,arguments)}})(m[k])}k=d.length;while(--k>=0){(function(n,o){i[o]=function(){var q=e.call(arguments),p=[o].concat(q);a.push(p);h(p);if(!b||!l(n)){return}b.firebug?b[o].apply(c,q):b[o]?b[o](q):b.log(q)}})(k,d[k])}function h(n){if(f&&(g||!b||!b.log)){f.apply(c,n)}}i.setLevel=function(n){j=typeof n==="number"?n:9};function l(n){return j>0?j>n:d.length+j<=n}i.setCallback=function(){var o=e.call(arguments),n=a.length,p=n;f=o.shift()||null;g=typeof o[0]==="boolean"?o.shift():false;p-=typeof o[0]==="number"?o.shift():n;while(p<n){h(a[p++])}};return i})();;

/**
 * @fileOverview Better Autocomplete is a flexible jQuery plugin which offers
 * rich text autocompletion, both from local and remote sources.
 *
 * @author Didrik Nordström, http://betamos.se/
 *
 * @version v1.0
 *
 * @requires
 *   <ul><li>
 *   jQuery 1.4+
 *   </li><li>
 *   IE7+ or any decent webkit/gecko-based web browser
 *   </li></ul>
 *
 * @preserve Better Autocomplete v1.0-dev
 * https://github.com/betamos/Better-Autocomplete
 *
 * Copyright 2011, Didrik Nordström, http://betamos.se/
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Requires jQuery 1.4+
 * http://jquery.com/
 */

/**
 * Create or alter an autocomplete object instance that belongs to
 * the elements in the selection. Make sure there are only text field elements
 * in the selection.
 *
 * @constructor
 *
 * @name jQuery.betterAutocomplete
 *
 * @param {String} method
 *   Should be one of the following:
 *   <ul><li>
 *     init: Initiate Better Autocomplete instances on the text input elements
 *     in the current jQuery selection. They are enabled by default. The other
 *     parameters are then required.
 *   </li><li>
 *     enable: In this jQuery selection, reenable the Better Autocomplete
 *     instances.
 *   </li><li>
 *     disable: In this jQuery selection, disable the Better Autocomplete
 *     instances.
 *   </li><li>
 *     destroy: In this jQuery selection, destroy the Better Autocomplete
 *     instances. It will not be possible to reenable them after this.
 *   </li></ul>
 *
 * @param {String|Object} [resource]
 *   If String, it will become the path for a remote resource. If not, it will
 *   be treated like a local resource. The path should provide JSON objects
 *   upon HTTP requests.
 *
 * @param {Object} [options]
 *   An object with configurable options:
 *   <ul><li>
 *     charLimit: (default=3 for remote or 1 for local resource) The minimum
 *     number of chars to do an AJAX call. A typical use case for this limit is
 *     to reduce server load.
 *   </li><li>
 *     delay: (default=350) The time in ms between last keypress and AJAX call.
 *     Typically used to prevent looking up irrelevant strings while the user
 *     is still typing. Only relevant for remote resources.
 *   </li><li>
 *     caseSensitive: (default=false) If the search should be case sensitive.
 *     If false, query strings will be converted to lowercase.
 *   </li><li>
 *     cacheLimit: (default=256 for remote or 0 for local resource) The maximum
 *     number of result objects to store in the cache. This option reduces
 *     server load if the user deletes characters to check back on previous
 *     results. To disable caching of previous results, set this option to 0.
 *   </li><li>
 *     remoteTimeout: (default=10000) The timeout for remote (AJAX) calls.
 *   </li><li>
 *     crossOrigin: (default=false) Set to true if cross origin requests will
 *     be performed, i.e. that the remote URL has a different domain. This will
 *     force Internet Explorer to use "jsonp" instead of "json" as datatype.
 *   </li><li>
 *     selectKeys: (default=[9, 13]) The key codes for keys which will select
 *     the current highlighted element. The defaults are tab, enter.
 *   </li></ul>
 *
 * @param {Object} [callbacks]
 *   An object containing optional callback functions on certain events. See
 *   {@link callbacks} for details. These callbacks should be used when
 *   customization of the default behavior of Better Autocomplete is required.
 *
 * @returns {Object}
 *   The jQuery object with the same element selection, for chaining.
 */

(function($) {

$.fn.betterAutocomplete = function(method) {

  /*
   * Each method expects the "this" object to be a valid DOM text input node.
   * The methods "enable", "disable" and "destroy" expects an instance of a
   * BetterAutocomplete object as their first argument.
   */
  var methods = {
    init: function(resource, options, callbacks) {
      var $input = $(this),
        bac = new BetterAutocomplete($input, resource, options, callbacks);
      $input.data('better-autocomplete', bac);
      bac.enable();
    },
    enable: function(bac) {
      bac.enable();
    },
    disable: function(bac) {
      bac.disable();
    },
    destroy: function(bac) {
      bac.destroy();
    }
  }, args = Array.prototype.slice.call(arguments, 1);

  // Method calling logic
  this.each(function() {
    switch (method) {
    case 'init':
      methods[method].apply(this, args);
      break;
    case 'enable':
    case 'disable':
    case 'destroy':
      var bac = $(this).data('better-autocomplete');
      if (bac instanceof BetterAutocomplete) {
        methods[method].call(this, bac);
      }
      break;
    default:
      $.error(['Method', method,
          'does not exist in jQuery.betterAutocomplete.'].join(' '));
    }
  });

  // Maintain chainability
  return this;
};

/**
 * The BetterAutocomplete constructor function. Returns a BetterAutocomplete
 * instance object.
 *
 * @private @constructor
 * @name BetterAutocomplete
 *
 * @param {Object} $input
 *   A single input element wrapped in jQuery.
 */
var BetterAutocomplete = function($input, resource, options, callbacks) {

  var lastRenderedQuery = '',
    cache = {}, // Key-valued caching of search results
    cacheOrder = [], // Array of query strings, in the order they are added
    cacheSize = 0, // Keep count of the cache's size
    timer, // Used for options.delay
    activeRemoteCalls = [], // A flat array of query strings that are pending
    disableMouseHighlight = false, // Suppress the autotriggered mouseover event
    inputEvents = {},
    isLocal = ($.type(resource) != 'string'),
    $results = $('<ul />').addClass('better-autocomplete'),
    hiddenResults = true, // $results are hidden
    preventBlurTimer = null; // IE bug workaround, see below in code.

  options = $.extend({
    charLimit: isLocal ? 1 : 3,
    delay: 350, // milliseconds
    caseSensitive: false,
    cacheLimit: isLocal ? 0 : 256, // Number of result objects
    remoteTimeout: 10000, // milliseconds
    crossOrigin: false,
    selectKeys: [9, 13] // [tab, enter]
  }, options);

  callbacks = $.extend({}, defaultCallbacks, callbacks);

  callbacks.insertSuggestionList($results, $input);

  inputEvents.focus = function() {
    // If the blur timer is active, a redraw is redundant.
    preventBlurTimer || redraw(true);
  };

  inputEvents.blur = function() {
    // If the blur prevention timer is active, refocus the input, since the
    // blur event can not be cancelled.
    if (preventBlurTimer) {
      $input.focus();
    }
    else {
      // The input has already lost focus, so redraw the suggestion list.
      redraw();
    }
  };

  inputEvents.keydown = function(event) {
    var index = getHighlighted();
    // If an arrow key is pressed and a result is highlighted
    if ($.inArray(event.keyCode, [38, 40]) >= 0 && index >= 0) {
      var newIndex,
        size = $('.result', $results).length;
      switch (event.keyCode) {
      case 38: // Up arrow
        newIndex = Math.max(0, index - 1);
        break;
      case 40: // Down arrow
        newIndex = Math.min(size - 1, index + 1);
        break;
      }
      disableMouseHighlight = true;
      setHighlighted(newIndex, true);
      return false;
    }
    // A select key has been pressed
    else if ($.inArray(event.keyCode, options.selectKeys) >= 0 &&
             !event.shiftKey && !event.ctrlKey && !event.altKey &&
             !event.metaKey) {
      select();
      return event.keyCode == 9; // Never cancel tab
    }
  };

  inputEvents.keyup = inputEvents.click = reprocess;

  $('.result', $results[0]).live({
    // When the user hovers a result with the mouse, highlight it.
    mouseover: function() {
      if (disableMouseHighlight) {
        return;
      }
      setHighlighted($('.result', $results).index($(this)));
    },
    mousemove: function() {
      // Enable mouseover again.
      disableMouseHighlight = false;
    },
    mousedown: function() {
      select();
      return false;
    }
  });

  // Prevent blur when clicking on group titles, scrollbars etc.,
  // This event is triggered after the others because of bubbling.
  $results.mousedown(function() {
    // Bug in IE where clicking on scrollbar would trigger a blur event for the
    // input field, despite using preventDefault() on the mousedown event.
    // This workaround locks the blur event on the input for a small time.
    clearTimeout(preventBlurTimer);
    preventBlurTimer = setTimeout(function() {
      preventBlurTimer = null;
    }, 50);
    return false;
  });

  /*
   * PUBLIC METHODS
   */

  /**
   * Enable this instance.
   */
  this.enable = function() {
    // Turn off the browser's autocompletion
    $input
      .attr('autocomplete', 'OFF')
      .attr('aria-autocomplete', 'list');
    $input.bind(inputEvents);
  };

  /**
   * Disable this instance.
   */
  this.disable = function() {
    $input
      .removeAttr('autocomplete')
      .removeAttr('aria-autocomplete');
    $results.hide();
    $input.unbind(inputEvents);
  };

  /**
   * Disable and remove this instance. This instance should not be reused.
   */
  this.destroy = function() {
    $results.remove();
    $input.unbind(inputEvents);
    $input.removeData('better-autocomplete');
  };

  /*
   * PRIVATE METHODS
   */

  /**
   * Add an array of results to the cache. Internal methods always reads from
   * the cache, so this method must be invoked even when caching is not used,
   * e.g. when using local results. This method automatically clears as much of
   * the cache as required to fit within the cache limit.
   *
   * @param {String} query
   *   The query to set the results to.
   *
   * @param {Array[Object]} results
   *   The array of results for this query.
   */
  var cacheResults = function(query, results) {
    cacheSize += results.length;
    // Now reduce size until it fits
    while (cacheSize > options.cacheLimit && cacheOrder.length) {
      var key = cacheOrder.shift();
      cacheSize -= cache[key].length;
      delete cache[key];
    }
    cacheOrder.push(query);
    cache[query] = results;
  };

  /**
   * Set highlight to a specific result item
   *
   * @param {Number} index
   *   The result's index, starting at 0.
   *
   * @param {Boolean} [autoScroll]
   *   (default=false) If scrolling of the results list should be automated.
   */
  var setHighlighted = function(index, autoScroll) {
    // Scrolling upwards
    var up = index == 0 || index < getHighlighted(),
      $scrollTo = $('.result', $results)
        .removeClass('highlight')
        .eq(index).addClass('highlight');

    if (!autoScroll) {
      return;
    }
    // Scrolling up, then make sure to show the group title
    if ($scrollTo.prev().is('.group') && up) {
      $scrollTo = $scrollTo.prev();
    }
    // Is $scrollTo partly above the visible region?
    if ($scrollTo.position().top < 0) {
      $results.scrollTop($scrollTo.position().top + $results.scrollTop());
    }
    // Or is it partly below the visible region?
    else if (($scrollTo.position().top + $scrollTo.outerHeight()) >
              $results.height()) {
      $results.scrollTop($scrollTo.position().top + $results.scrollTop() +
          $scrollTo.outerHeight() - $results.height());
    }
  };

  /**
   * Retrieve the index of the currently highlighted result item
   *
   * @returns {Number}
   *   The result's index or -1 if no result is highlighted.
   */
  var getHighlighted = function() {
    return $('.result', $results).index($('.result.highlight', $results));
  };

  /**
   * Select the current highlighted element, if any.
   */
  var select = function() {
    var $result = $('.result', $results).eq(getHighlighted());
    if (!$result.length) {
      return; // No selectable element
    }
    var result = $result.data('result');
    callbacks.select(result, $input);
    // Redraw again, if the callback changed focus or content
    reprocess();
  };

  /**
   * Fetch results asynchronously via AJAX.
   * Errors are ignored.
   *
   * @param {String} query
   *   The query string.
   */
  var fetchResults = function(query) {
    // Synchronously fetch local data
    if (isLocal) {
      cacheResults(query, callbacks.queryLocalResults(query, resource,
                                                      options.caseSensitive));
      redraw();
    }
    // Asynchronously fetch remote data
    else {
      activeRemoteCalls.push(query);
      var url = callbacks.constructURL(resource, query);
      callbacks.beginFetching($input);
      callbacks.fetchRemoteData(url, function(data) {
        var searchResults = callbacks.processRemoteData(data);
        if (!$.isArray(searchResults)) {
          searchResults = [];
        }
        cacheResults(query, searchResults);
        // Remove the query from active remote calls, since it's finished
        activeRemoteCalls = $.grep(activeRemoteCalls, function(value) {
          return value != query;
        });
        if (!activeRemoteCalls.length) {
          callbacks.finishFetching($input);
        }
        redraw();
      }, options.remoteTimeout, options.crossOrigin);
    }
  };

  /**
   * Reprocess the contents of the input field, fetch data and redraw if
   * necessary.
   */
  function reprocess() {
    var query = callbacks.canonicalQuery($input.val(), options.caseSensitive);
    clearTimeout(timer);
    // Indicate that timer is inactive
    timer = null;
    redraw();
    if (query.length >= options.charLimit && !$.isArray(cache[query]) &&
        $.inArray(query, activeRemoteCalls) == -1) {
      // Fetching is required
      $results.empty();
      if (isLocal) {
        fetchResults(query);
      }
      else {
        timer = setTimeout(function() {
          fetchResults(query);
          timer = null;
        }, options.delay);
      }
    }
  };

  /**
   * Redraws the autocomplete list based on current query and focus.
   *
   * @param {Boolean} [focus]
   *   (default=false) Force to treat the input element like it's focused.
   */
  var redraw = function(focus) {
    var query = callbacks.canonicalQuery($input.val(), options.caseSensitive);

    // The query does not exist in db
    if (!$.isArray(cache[query])) {
      lastRenderedQuery = null;
      $results.empty();
    }
    // The query exists and is not already rendered
    else if (lastRenderedQuery !== query) {
      lastRenderedQuery = query;
      renderResults(cache[query]);
      setHighlighted(0);
    }
    // Finally show/hide based on focus and emptiness
    if (($input.is(':focus') || focus) && !$results.is(':empty')) {
      $results.filter(':hidden').show() // Show if hidden
        .scrollTop($results.data('scroll-top')); // Reset the lost scrolling
      if (hiddenResults) {
        hiddenResults = false;
        callbacks.afterShow($results);
      }
    }
    else if ($results.is(':visible')) {
      // Store the scrolling position for later
      $results.data('scroll-top', $results.scrollTop())
        .hide(); // Hiding it resets it's scrollTop
      if (!hiddenResults) {
        hiddenResults = true;
        callbacks.afterHide($results);
      }
    }
  };

  /**
   * Regenerate the DOM content within the results list for a given set of
   * results. Heavy method, use only when necessary.
   *
   * @param {Array[Object]} results
   *   An array of result objects to render.
   */
  var renderResults = function(results) {
    $results.empty();
    var groups = {}; // Key is the group name, value is the heading element.

    $.each(results, function(index, result) {
      if ($.type(result) != 'object') {
        return; // Continue
      }

      var output = callbacks.themeResult(result);
      if ($.type(output) != 'string') {
        return; // Continue
      }

      // Add the group if it doesn't exist
      var group = callbacks.getGroup(result);
      if ($.type(group) == 'string' && !groups[group]) {
        var $groupHeading = $('<li />').addClass('group')
          .append($('<h3 />').html(group))
          .appendTo($results);
        groups[group] = $groupHeading;
      }

      var $result = $('<li />').addClass('result')
        .append(output)
        .data('result', result) // Store the result object on this DOM element
        .addClass(result.addClass);

      // First groupless item
      if ($.type(group) != 'string' &&
          !$results.children().first().is('.result')) {
        $results.prepend($result);
        return; // Continue
      }
      var $traverseFrom = ($.type(group) == 'string') ?
                          groups[group] : $results.children().first();
      var $target = $traverseFrom.nextUntil('.group').last();
      $result.insertAfter($target.length ? $target : $traverseFrom);
    });
  };
};

/*
 * CALLBACK METHODS
 */

/**
 * These callbacks are supposed to be overridden by you when you need
 * customization of the default behavior. When you are overriding a callback
 * function, it is a good idea to copy the source code from the default
 * callback function, as a skeleton.
 *
 * @name callbacks
 * @namespace
 */
var defaultCallbacks = {
  /**
   * @lends callbacks.prototype
   */

  /**
   * Gets fired when the user selects a result by clicking or using the
   * keyboard to select an element.
   *
   * <br /><br /><em>Default behavior: Inserts the result's title into the
   * input field.</em>
   *
   * @param {Object} result
   *   The result object that was selected.
   *
   * @param {Object} $input
   *   The input DOM element, wrapped in jQuery.
   */
  select: function(result, $input) {
    $input.val(result.title);
  },

  /**
   * Given a result object, theme it to HTML.
   *
   * <br /><br /><em>Default behavior: Wraps result.title in an h4 tag, and
   * result.description in a p tag. Note that no sanitization of malicious
   * scripts is done here. Whatever is within the title/description is just
   * printed out. May contain HTML.</em>
   *
   * @param {Object} result
   *   The result object that should be rendered.
   *
   * @returns {String}
   *   HTML output, will be wrapped in a list element.
   */
  themeResult: function(result) {
    var output = [];
    if ($.type(result.title) == 'string') {
      output.push('<h4>', result.title, '</h4>');
    }
    if ($.type(result.description) == 'string') {
      output.push('<p>', result.description, '</p>');
    }
    return output.join('');
  },

  /**
   * Retrieve local results from the local resource by providing a query
   * string.
   *
   * <br /><br /><em>Default behavior: Automatically handles arrays, if the
   * data inside each element is either a plain string or a result object.
   * If it is a result object, it will match the query string against the
   * title and description property. Search is not case sensitive.</em>
   *
   * @param {String} query
   *   The query string, unescaped. May contain any UTF-8 character.
   *   If case insensitive, it already is lowercased.
   *
   * @param {Object} resource
   *   The resource provided in the {@link jQuery.betterAutocomplete} init
   *   constructor.
   *
   * @param {Boolean} caseSensitive
   *   From options.caseSensitive, the searching should be case sensitive.
   *
   * @returns {Array[Object]}
   *   A flat array containing pure result objects. May be an empty array.
   */
  queryLocalResults: function(query, resource, caseSensitive) {
    if (!$.isArray(resource)) {
      // Per default Better Autocomplete only handles arrays
      return [];
    }
    var results = [];
    $.each(resource, function(i, value) {
      switch ($.type(value)) {
      case 'string': // Flat array of strings
        if ((caseSensitive ? value : value.toLowerCase())
            .indexOf(query) >= 0) {
          // Match found
          results.push({ title: value });
        }
        break;
      case 'object': // Array of result objects
        if ($.type(value.title) == 'string' &&
            (caseSensitive ? value.title : value.title.toLowerCase())
            .indexOf(query) >= 0) {
          // Match found in title field
          results.push(value);
        }
        else if ($.type(value.description) == 'string' &&
                 (caseSensitive ? value.description :
                 value.description.toLowerCase()).indexOf(query) >= 0) {
          // Match found in description field
          results.push(value);
        }
        break;
      }
    });
    return results;
  },

  /**
   * Fetch remote result data and return it using completeCallback when
   * fetching is finished. Must be asynchronous in order to not freeze the
   * Better Autocomplete instance.
   *
   * <br /><br /><em>Default behavior: Fetches JSON data from the url, using
   * the jQuery.ajax() method. Errors are ignored.</em>
   *
   * @param {String} url
   *   The URL to fetch data from.
   *
   * @param {Function} completeCallback
   *   This function must be called, even if an error occurs. It takes zero
   *   or one parameter: the data that was fetched.
   *
   * @param {Number} timeout
   *   The preferred timeout for the request. This callback should respect
   *   the timeout.
   *
   * @param {Boolean} crossOrigin
   *   True if a cross origin request should be performed.
   */
  fetchRemoteData: function(url, completeCallback, timeout, crossOrigin) {
    $.ajax({
      url: url,
      dataType: crossOrigin && !$.support.cors ? 'jsonp' : 'json',
      timeout: timeout,
      success: function(data, textStatus) {
        completeCallback(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        completeCallback();
      }
    });
  },

  /**
   * Process remote fetched data by extracting an array of result objects
   * from it. This callback is useful if the fetched data is not the plain
   * results array, but a more complicated object which does contain results.
   *
   * <br /><br /><em>Default behavior: If the data is defined and is an
   * array, return it. Otherwise return an empty array.</em>
   *
   * @param {mixed} data
   *   The raw data recieved from the server. Can be undefined.
   *
   * @returns {Array[Object]}
   *   A flat array containing result objects. May be an empty array.
   */
  processRemoteData: function(data) {
    if ($.isArray(data)) {
      return data;
    }
    else {
      return [];
    }
  },

  /**
   * From a given result object, return it's group name (if any). Used for
   * grouping results together.
   *
   * <br /><br /><em>Default behavior: If the result has a "group" property
   * defined, return it.</em>
   *
   * @param {Object} result
   *   The result object.
   *
   * @returns {String}
   *   The group name, may contain HTML. If no group, don't return anything.
   */
  getGroup: function(result) {
    if ($.type(result.group) == 'string') {
      return result.group;
    }
  },

  /**
   * Called when remote fetching begins.
   *
   * <br /><br /><em>Default behavior: Adds the CSS class "fetching" to the
   * input field, for styling purposes.</em>
   *
   * @param {Object} $input
   *   The input DOM element, wrapped in jQuery.
   */
  beginFetching: function($input) {
    $input.addClass('fetching');
  },

  /**
   * Called when fetching is finished. All active requests must finish before
   * this function is called.
   *
   * <br /><br /><em>Default behavior: Removes the "fetching" class.</em>
   *
   * @param {Object} $input
   *   The input DOM element, wrapped in jQuery.
   */
  finishFetching: function($input) {
    $input.removeClass('fetching');
  },

  /**
   * Executed after the suggestion list has been shown.
   *
   * @param {Object} $results
   *   The suggestion list UL element, wrapped in jQuery.
   *
   * <br /><br /><em>Default behavior: Does nothing.</em>
   */
  afterShow: function($results) {},

  /**
   * Executed after the suggestion list has been hidden.
   *
   * @param {Object} $results
   *   The suggestion list UL element, wrapped in jQuery.
   *
   * <br /><br /><em>Default behavior: Does nothing.</em>
   */
  afterHide: function($results) {},

  /**
   * Construct the remote fetching URL.
   *
   * <br /><br /><em>Default behavior: Adds "?q=query" to the path. The query
   * string is URL encoded.</em>
   *
   * @param {String} path
   *   The path given in the {@link jQuery.betterAutocomplete} constructor.
   *
   * @param {String} query
   *   The raw query string. Remember to URL encode this to prevent illegal
   *   character errors.
   *
   * @returns {String}
   *   The URL, ready for fetching.
   */
  constructURL: function(path, query) {
    return path + '?q=' + encodeURIComponent(query);
  },

  /**
   * To ease up on server load, treat similar strings the same.
   *
   * <br /><br /><em>Default behavior: Trims the query from leading and
   * trailing whitespace.</em>
   *
   * @param {String} rawQuery
   *   The user's raw input.
   *
   * @param {Boolean} caseSensitive
   *   Case sensitive. Will convert to lowercase if false.
   *
   * @returns {String}
   *   The canonical query associated with this string.
   */
  canonicalQuery: function(rawQuery, caseSensitive) {
    var query = $.trim(rawQuery);
    if (!caseSensitive) {
      query = query.toLowerCase();
    }
    return query;
  },

  /**
   * Insert the results list into the DOM and position it properly.
   *
   * <br /><br /><em>Default behavior: Inserts suggestion list directly
   * after the input element and sets an absolute position using
   * jQuery.position() for determining left/top values. Also adds a nice
   * looking box-shadow to the list.</em>
   *
   * @param {Object} $results
   *   The UL list element to insert, wrapped in jQuery.
   *
   * @param {Object} $input
   *   The text input element, wrapped in jQuery.
   */
  insertSuggestionList: function($results, $input) {
    $results.width($input.outerWidth() - 2) // Subtract border width.
      .css({
        position: 'absolute',
        left: $input.position().left,
        top: $input.position().top + $input.outerHeight(),
        zIndex: 10,
        maxHeight: '330px',
        // Visually indicate that results are in the topmost layer
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
      })
      .hide()
      .insertAfter($input);
  }
};

/*
 * jQuery focus selector, required by Better Autocomplete.
 *
 * @see http://stackoverflow.com/questions/967096/using-jquery-to-test-if-an-input-has-focus/2684561#2684561
 */
var filters = $.expr[':'];
if (!filters.focus) {
  filters.focus = function(elem) {
    return elem === document.activeElement && (elem.type || elem.href);
  };
}

})(jQuery);
;
