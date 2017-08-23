/**
 * jQuery plugin which adds remaining character count to the inputs
 * with maxlength attribute
 */
import $ from 'jquery';

const NAMESPACE = 'maxlength';
const INPUT_SELECTOR = 'input[maxlength], textarea[maxlength]';


class InputMaxLengthCounter {

    constructor (element, options) {
        this.$element = $(element);
        this.options = $.extend(true, {
            maxlength: parseInt(this.$element.attr('maxlength'), 10) || 512
        }, this.options, options);

        this._init();
    }

    _init () {
        const $element = this.$element;
        $element.on('input change', this.update.bind(this));

        // When input is removed from DOM destroy this plugin
        $element.one('remove', this.destroy.bind(this));

        this._render();
    }

    _render () {
        const remaining = this.options.maxlength - this.$element.val().length;
        this.$group = $('<div class="input-group"></div>')
        this.$addon = $('<span class="input-group-addon" style="width: 1%;"></span>').text(remaining);

        this.$group.insertAfter(this.$element)
            .append(this.$element)
            .append(this.$addon);
    }

    destroy () {
        this.$element.off(`.${ NAMESPACE }`).removeData(NAMESPACE);
    }

    update () {
        const remaining = this.options.maxlength - this.$element.val().length;
        this.$addon.text(remaining)
    }
}


// Create jQuery plugin
$.bridget(NAMESPACE, InputMaxLengthCounter);


// Initialize + observe when new inputs are added and intialize plugin
$(function () {
    $(INPUT_SELECTOR).initialize(function () {
        $(this)[NAMESPACE]();
    });
});