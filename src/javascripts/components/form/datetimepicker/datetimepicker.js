/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import 'util/jquery.inview';
import createPlugin from 'jquery-plugin-generator';
import flatpickr from 'flatpickr';
import moment from 'moment';

// Expose globally to allow loading locales
window.moment = moment;

// import convertMomentToFlatPickrFormat from './format-converter';

/**
 * DateTime picker
 */
class DateTimePicker {

    static get Defaults () {
        return {
            // 'minDate': '1/1/1900',
            // 'maxDate': null,

            // Use strict mode when validating date
            'useStrict': false,

            // Allow user input
            'allowInput': true,

        };
    }

    constructor ($container, opts) {
        this.$container = $container;
        this.$input = $container.find('input').addBack('input');

        this.options = this.transformOptions($.extend({
            'dateFormat': this.$input.data('dateFormat')
        }, this.constructor.Defaults, opts));

        $container.on('destroyed', this.destroy.bind(this));

        $container.inview({
            enter: this.createDatePicker.bind(this),
            destroyOnEnter: true,
            destroyOnLeave: true,
        });
    }

    transformOptions (options) {
        const translate = {
            'minDate': 'minDate',
            'maxDate': 'maxDate',
            'minuteStepping': 'minuteIncrement',

            'pickTime': 'enableTime',
            'useSeconds': 'enableSeconds',
            // 'useMinutes': '',

            'disabledDates': 'disable',
            'enabledDates': 'enable',
            'defaultDate': 'defaultDate',

            'calendarWeeks': 'weekNumbers',

            // 'useCurrent': true,
            // 'showToday': true,

            'allowInput': 'allowInput',
        };

        const transformed = {
            // Disable calendar
            'noCalendar': !options.pickDate
        };
        
        // Date format
        if (options.format || options.dateFormat) {
            transformed.dateFormat = options.format || options.dateFormat;
        }

        // Language, localization file is loaded on window[locale]
        if (window[options.language] && window[options.language].default && window[options.language].default[options.language]) {
            transformed.locale = window[options.language].default[options.language];
        }

        // Transform options
        for (let key in translate) {
            if (key in options) {
                transformed[translate[key]] = options[key];
            }
        }

        // Disable daysOfWeekDisabled
        if (options.daysOfWeekDisabled && options.daysOfWeekDisabled.length) {
            transformed.disable = transformed.disable || [];
            transformed.disable.push((date) => {
                return options.daysOfWeekDisabled.indexOf(date.getDay()) !== -1;
            });
        }
        
        // Add moment.js
        transformed.parseDate = (datestr, format) => {
            return moment(datestr, format, options.useStrict).toDate();
        },
        transformed.formatDate = (date, format, locale) => {
            if (options.language) {
                moment.locale(options.language);
            }
            return moment(date).format(format);
        }

        return transformed;
    }

    createDatePicker () {
        this.picker = flatpickr(this.$input.get(0), this.options);
    }

    destroy () {
        if (this.picker) {
            this.picker.destroy();
            this.picker = null;
        }
    }
}

$.fn.datetimepicker = createPlugin(DateTimePicker);
