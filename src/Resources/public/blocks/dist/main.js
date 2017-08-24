(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BLOCKS_LIST_SELECTOR = '[data-widget="blocks-list"]';
var ADD_BLOCK_SELECTOR = '[data-widget="blocks-add"]';

var ORDER_INPUT_CSS_SELECTOR = 'input[type="hidden"][name*="[order]"]';

var BlocksList = function () {
    function BlocksList($container) {
        _classCallCheck(this, BlocksList);

        this.$container = $container;
        this.index = $container.find(ORDER_INPUT_CSS_SELECTOR).length;

        $container.addClass('blocks-list').sortable({
            placeholder: 'sort-highlight',
            handle: '.box-header',
            forcePlaceholderSize: true,
            zIndex: 999999,
            axis: 'y',
            update: this.handleBlockAdd.bind(this),
            stop: this.updateBlockOrder.bind(this)
        });

        $container.on('click', '[data-widget="block-remove"]', this.handleBlockRemove.bind(this));
    }

    _createClass(BlocksList, [{
        key: 'updateList',
        value: function updateList() {
            this.$container.sortable('refresh');
            this.updateBlockOrder();
        }
    }, {
        key: 'updateBlockOrder',
        value: function updateBlockOrder() {
            var $inputs = this.$container.find(ORDER_INPUT_CSS_SELECTOR);

            $inputs.each(function (index, input) {
                (0, _jquery2.default)(input).val(index);
            });
        }
    }, {
        key: 'generateBlockHTML',
        value: function generateBlockHTML(html) {
            var index = this.index++;
            return html.replace(/__name__/g, index);
        }
    }, {
        key: 'handleBlockAdd',
        value: function handleBlockAdd(event, ui) {
            var html = ui.item.data('prototype');
            if (ui.item.is(ADD_BLOCK_SELECTOR) && html) {
                var $html = this.generateBlockHTML(html);
                ui.item.replaceWith($html);
                Admin.shared_setup($html);
                this.updateList();
            }
        }
    }, {
        key: 'handleBlockRemove',
        value: function handleBlockRemove(event) {
            var $item = (0, _jquery2.default)(event.target).closest(this.$container.children());

            if ($item.length) {
                $item.slideUp('fast', function () {
                    $item.remove();
                    this.updateList();
                }.bind(this));
            }
        }
    }]);

    return BlocksList;
}();

(0, _jquery2.default)(function () {
    // Make blocks sortable Using jquery UI
    (0, _jquery2.default)(BLOCKS_LIST_SELECTOR).each(function () {
        new BlocksList((0, _jquery2.default)(this));
    });

    //
    (0, _jquery2.default)(ADD_BLOCK_SELECTOR).addClass('blocks-add').draggable({
        connectToSortable: (0, _jquery2.default)(BLOCKS_LIST_SELECTOR),
        helper: 'clone',
        placeholder: 'sort-highlight',
        zIndex: 999999
    });
});

},{"jquery":8}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NAMESPACE = 'gallery';

var mediaContent = null;

var GalleryWidget = function () {
    _createClass(GalleryWidget, null, [{
        key: 'defaultOptions',
        get: function get() {
            return {};
        }
    }]);

    function GalleryWidget(element, options) {
        _classCallCheck(this, GalleryWidget);

        this.$element = $(element);
        this.options = $.extend(true, this.constructor.defaultOptions, this.options, options);

        this._init();
    }

    _createClass(GalleryWidget, [{
        key: '_init',
        value: function _init() {
            var $element = this.$element;

            // Change button click
            // $element.find('.js-change').mediaTrigger({
            //     'onselect': this._handleImageChange.bind(this)
            // });

            // When this whole widget is removed from DOM trigger 'destroy'
            $element.on('remove.' + NAMESPACE, this.destroy.bind(this));
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.$element.off('.' + NAMESPACE);
            this.$element = this.options = null;
        }

        // _handleImageChange (images) {
        //     this.$image.removeClass('hidden').attr('src', images[0].image);
        //     this.$input.val(images[0].id);
        //     this.$caption.val(images[0].name);
        // }

    }]);

    return GalleryWidget;
}();

$.bridget(NAMESPACE, GalleryWidget);

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NAMESPACE = 'image';

var mediaContent = null;

var ImageWidget = function () {
    _createClass(ImageWidget, null, [{
        key: 'defaultOptions',
        get: function get() {
            return {};
        }
    }]);

    function ImageWidget(element, options) {
        _classCallCheck(this, ImageWidget);

        this.$element = $(element);
        this.options = $.extend(true, this.constructor.defaultOptions, this.options, options);

        this._init();
    }

    _createClass(ImageWidget, [{
        key: '_init',
        value: function _init() {
            var $element = this.$element;

            // Change button click
            $element.find('.js-change').mediaTrigger({
                'onselect': this._handleImageChange.bind(this)
            });

            // Remove button click
            $element.find('.js-reset').on('click', this._reset.bind(this));

            // When this whole widget is removed from DOM trigger 'destroy'
            $element.on('remove.' + NAMESPACE, this.destroy.bind(this));

            this.$input = $element.find('input[type="hidden"]');
            this.$caption = $element.find('input[type="text"]');
            this.$image = $element.find('img');
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.$element.off('.' + NAMESPACE);
            this.$element = this.options = null;
        }
    }, {
        key: '_handleImageChange',
        value: function _handleImageChange(images) {
            this.$image.removeClass('hidden').attr('src', images[0].image);
            this.$input.val(images[0].id);
            // this.$caption.val(images[0].name || images[0].title || '');
        }
    }, {
        key: '_reset',
        value: function _reset() {
            this.$image.addClass('hidden').attr('src', '');
            this.$input.val('');
            this.$caption.val('');
        }
    }]);

    return ImageWidget;
}();

$.bridget(NAMESPACE, ImageWidget);

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * jQuery plugin which adds remaining character count to the inputs
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * with maxlength attribute
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NAMESPACE = 'maxlength';
var INPUT_SELECTOR = 'input[maxlength], textarea[maxlength]';

var InputMaxLengthCounter = function () {
    function InputMaxLengthCounter(element, options) {
        _classCallCheck(this, InputMaxLengthCounter);

        this.$element = (0, _jquery2.default)(element);
        this.options = _jquery2.default.extend(true, {
            maxlength: parseInt(this.$element.attr('maxlength'), 10) || 512
        }, this.options, options);

        this._init();
    }

    _createClass(InputMaxLengthCounter, [{
        key: '_init',
        value: function _init() {
            var $element = this.$element;
            $element.on('input change', this.update.bind(this));

            // When input is removed from DOM destroy this plugin
            $element.one('remove', this.destroy.bind(this));

            this._render();
        }
    }, {
        key: '_render',
        value: function _render() {
            var remaining = this.options.maxlength - this.$element.val().length;
            this.$group = (0, _jquery2.default)('<div class="input-group"></div>');
            this.$addon = (0, _jquery2.default)('<span class="input-group-addon" style="width: 1%;"></span>').text(remaining);

            this.$group.insertAfter(this.$element).append(this.$element).append(this.$addon);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.$element.off('.' + NAMESPACE).removeData(NAMESPACE);
        }
    }, {
        key: 'update',
        value: function update() {
            var remaining = this.options.maxlength - this.$element.val().length;
            this.$addon.text(remaining);
        }
    }]);

    return InputMaxLengthCounter;
}();

// Create jQuery plugin


_jquery2.default.bridget(NAMESPACE, InputMaxLengthCounter);

// Initialize + observe when new inputs are added and intialize plugin
(0, _jquery2.default)(function () {
    (0, _jquery2.default)(INPUT_SELECTOR).initialize(function () {
        (0, _jquery2.default)(this)[NAMESPACE]();
    });
});

},{"jquery":8}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MEDIA_NAMESPACE = 'media';
var TRIGGER_NAMESPACE = 'mediaTrigger';

var MediaTrigger = function () {
    _createClass(MediaTrigger, null, [{
        key: 'defaultOptions',
        get: function get() {
            return {
                'onselect': null
            };
        }
    }]);

    function MediaTrigger(element, options) {
        _classCallCheck(this, MediaTrigger);

        this.$element = $(element);
        this.options = $.extend(true, this.constructor.defaultOptions, this.options, options);

        this._init();
    }

    _createClass(MediaTrigger, [{
        key: '_init',
        value: function _init() {
            this.$element.on('click.' + TRIGGER_NAMESPACE, this.open.bind(this));
            this.$modal = null;
            this.initialized = false;
        }
    }, {
        key: '_getModal',
        value: function _getModal() {
            if (!this.$modal) {
                this.$modal = $('\n                <div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">\n                    <div class="modal-dialog modal-lg">\n                        <div class="modal-content">\n                            <div class="modal-header">\n                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n                                <h4 class="modal-title"></h4>\n                            </div>\n                            <div class="modal-body js-modal-body">\n                            </div>\n                        </div>\n                    </div>\n                </div>').appendTo('body');
            }

            return this.$modal;
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.$element.off('.' + TRIGGER_NAMESPACE).removeData(TRIGGER_NAMESPACE);
            this.$element = this.options = null;
        }
    }, {
        key: '_getMediaContent',
        value: function _getMediaContent() {
            var _this = this;

            var mediaContent = $.Deferred();

            $.ajax('/admin/media/list?select_mode=1', {
                'dataType': 'html'
            }).done(function (html) {
                var $html = $(html);
                var $content = $html.filter(':not(link, script, text)');
                var $meta = $html.filter('link, script');

                if (!_this.initialized) {
                    // Add CSS / JS only once
                    _this.initialized = true;
                    $('head').append($meta);
                }

                mediaContent.resolve($content);
            });

            return mediaContent.promise();
        }
    }, {
        key: '_handleFileSelect',
        value: function _handleFileSelect(info) {
            this.$modal.modal('hide');

            if (typeof this.options.onselect === 'function') {
                this.options.onselect(info);
            }
        }
    }, {
        key: 'open',
        value: function open() {
            var _this2 = this;

            this._getMediaContent().done(function ($html) {
                var $modal = _this2._getModal();
                var $body = $modal.find('.js-modal-body');
                var $content = $html.clone();
                var $footer = $content.find('.modal-footer').remove();

                $body.append($content);
                $footer.insertAfter($body);

                $modal.modal();

                $modal.media({
                    'multiselect': false,
                    'selectmode': true,
                    'onselect': _this2._handleFileSelect.bind(_this2)
                });

                // When modal is closed destroy media
                $modal.one('hidden.bs.modal', function () {
                    $modal.media('destroy');
                    $content.remove();
                    $footer.remove();
                });
            });
        }
    }]);

    return MediaTrigger;
}();

$.bridget(TRIGGER_NAMESPACE, MediaTrigger);

},{}],6:[function(require,module,exports){
'use strict';

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_jquery2.default.cleanData = function (originalCleanData) {
    return function (elements) {
        var element = void 0;

        for (var i = 0; (element = elements[i]) != null; i++) {
            try {
                // Only trigger remove when necessary to save time
                var events = _jquery2.default._data(element, 'events');
                if (events && events.remove) {
                    (0, _jquery2.default)(element).triggerHandler('remove');
                }

                // http://bugs.jquery.com/ticket/8235
            } catch (e) {}
        }
        originalCleanData(elements);
    };
}(_jquery2.default.cleanData);

},{"jquery":8}],7:[function(require,module,exports){
"use strict";

/*!
 * jQuery initialize - v1.0.0 - 12/14/2016
 * https://github.com/adampietrasiak/jquery.initialize
 *
 * Copyright (c) 2015-2016 Adam Pietrasiak
 * Released under the MIT license
 * https://github.com/timpler/jquery.initialize/blob/master/LICENSE
 */
;(function ($) {

    "use strict";

    // MutationSelectorObserver represents a selector and it's associated initialization callback.

    var MutationSelectorObserver = function MutationSelectorObserver(selector, callback) {
        this.selector = selector;
        this.callback = callback;
    };

    // List of MutationSelectorObservers.
    var msobservers = [];
    msobservers.initialize = function (selector, callback) {

        // Wrap the callback so that we can ensure that it is only
        // called once per element.
        var seen = [];
        var callbackOnce = function callbackOnce() {
            if (seen.indexOf(this) == -1) {
                seen.push(this);
                $(this).each(callback);
            }
        };

        // See if the selector matches any elements already on the page.
        $(selector).each(callbackOnce);

        // Then, add it to the list of selector observers.
        this.push(new MutationSelectorObserver(selector, callbackOnce));
    };

    // The MutationObserver watches for when new elements are added to the DOM.
    var observer = new MutationObserver(function (mutations) {

        // For each MutationSelectorObserver currently registered.
        for (var j = 0; j < msobservers.length; j++) {
            $(msobservers[j].selector).each(msobservers[j].callback);
        }
    });

    // Observe the entire document.
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

    // Deprecated API (does not work with jQuery >= 3.1.1):
    $.fn.initialize = function (callback) {
        msobservers.initialize(this.selector, callback);
    };
    $.initialize = function (selector, callback) {
        msobservers.initialize(selector, callback);
    };
})(jQuery);

},{}],8:[function(require,module,exports){
"use strict";

// Shim for jQuery
module.exports = window.jQuery;

},{}],9:[function(require,module,exports){
'use strict';

require('./lib/jquery.clean-data');

require('./lib/jquery.initialize');

require('./components/input.max-length');

require('./components/block-list');

require('./components/media-trigger');

require('./components/image-widget');

require('./components/gallery-widget');

},{"./components/block-list":1,"./components/gallery-widget":2,"./components/image-widget":3,"./components/input.max-length":4,"./components/media-trigger":5,"./lib/jquery.clean-data":6,"./lib/jquery.initialize":7}]},{},[9])

//# sourceMappingURL=main.js.map
