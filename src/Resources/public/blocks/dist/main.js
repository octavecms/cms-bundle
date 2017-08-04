(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = jQuery;

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
                $(input).val(index);
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
                ui.item.replaceWith(this.generateBlockHTML(html));
                this.updateList();
            }
        }
    }, {
        key: 'handleBlockRemove',
        value: function handleBlockRemove(event) {
            var $item = $(event.target).closest(this.$container.children());

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

$(function () {
    // Make blocks sortable Using jquery UI
    $(BLOCKS_LIST_SELECTOR).each(function () {
        new BlocksList($(this));
    });

    //
    $(ADD_BLOCK_SELECTOR).addClass('blocks-add').draggable({
        connectToSortable: $(BLOCKS_LIST_SELECTOR),
        helper: 'clone',
        placeholder: 'sort-highlight',
        zIndex: 999999
    });
});

},{}]},{},[1])

//# sourceMappingURL=main.js.map
