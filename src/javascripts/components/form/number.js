/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


function parseNumber (str, defaultValue) {
    const num = parseFloat(str);
    if (!isNaN(num)) {
        return num;
    } else {
        return defaultValue;
    }
}


/**
 * Number input component
 */
class NumberInput {

    static get Defaults () {
        return {};
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$input = $container.find('input');
        this.$add = $container.find('.js-number-add');
        this.$subtract = $container.find('.js-number-subtract');

        this.min = parseNumber(this.$input.attr('min'), -Infinity);
        this.max = parseNumber(this.$input.attr('max'), Infinity);
        this.step = parseNumber(this.$input.attr('step'), 1);

        this.$add.on('click returnkey', this.add.bind(this));
        this.$subtract.on('click returnkey', this.subtract.bind(this));
    }

    add () {
        const value = this.getValue() + 1;
        const clamped = Math.min(this.max, Math.max(this.min, value));

        this.$input.val(clamped);
        this.update();
    }
    subtract () {
        const value = this.getValue() - 1;
        const clamped = Math.min(this.max, Math.max(this.min, value));

        this.$input.val(clamped);
        this.update();
    }

    getValue () {
        return parseNumber(this.$input.val(), 0);
    }

    /**
     * Update button UI
     */
    update () {
        const value = this.getValue();

        if (value === this.max) {
            this.$add.addClass('is-disabled').removeAttr('tabindex');
        } else {
            this.$add.removeClass('is-disabled').attr('tabindex', '0');
        }

        if (value === this.min) {
            this.$subtract.addClass('is-disabled').removeAttr('tabindex');
        } else {
            this.$subtract.removeClass('is-disabled').attr('tabindex', '0');
        }
    }
}

$.fn.number = createPlugin(NumberInput);
