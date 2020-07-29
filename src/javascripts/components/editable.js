/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import 'components/dropdown';
import 'util/jquery.serializeobject';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


/**
 * Editable popup
 */
class Editable {

    static get Defaults () {
        return {
            // Target element selector
            'target': null,

            // Classname which is added to the toggle if saved form has values
            'toggleNotEmptyClassName': 'is-highlighted',
            
            // Input container CSS selector
            'inputContainer': null
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$popup = options.target ? $(options.target) : $($container.attr('href'))
        this.$inputContainer = options.inputContainer ? $container.closest(options.inputContainer) : $container.parent();
        this.visible = false;

        this.$popup.on('click', '.js-editable-close', this.close.bind(this));
        this.$popup.on('click', '.js-editable-save', this.save.bind(this));
        
        $container
            .dropdown({
                'toggle': $container,
                'offset': 24,
                'menu': this.$popup,
                'withOverlay': true,
                'autoClose': false,
                'container': '.modal, body',
                'placement': 'right-start',
            })
            .on('show.dropdown', this.onShow.bind(this))
            .on('shown.dropdown', this.onShown.bind(this))
            .on('hide.dropdown', this.onHide.bind(this));
    }

    /**
     * Returns all input names from editable form
     * 
     * @returns {array} List of input names
     */
    getInputNames () {
        const $inputs = this.$popup.find('input, textarea, select');
        const names = [];

        for (let i = 0; i < $inputs.length; i++) {
            names.push($inputs.eq(i).attr('name'));
        }

        return names;
    }

    /**
     * Returns editable input name related container inputs
     * 
     * @returns {object} List of editable input names with related inputs
     */
    getContainerInputs () {
        const names = this.getInputNames();
        const $inputs = this.$inputContainer.find('input, textarea, select');
        const inputs = {};

        for (let i = 0; i < names.length; i++) {
            const $input = $inputs.filter(`[name="${ names[i] }"], [name*="[${ names[i] }]"], [name~="${ names[i] }"]`).eq(0);

            if ($input.length) {
                inputs[names[i]] = $input;
            }
        }

        return inputs;
    }

    /**
     * Returns values from container
     */
    getContainerValues () {
        const inputs = this.getContainerInputs();
        const values = {};

        for (let name in inputs) {
            if (inputs[name].is(':radio,:checkbox')) {
                values[name] = inputs[name].prop('checked');
            } else {
                values[name] = inputs[name].val();
            }
        }

        return values;
    }

    /**
     * Returns editable form values
     * 
     * @protected
     */
    getEditableValues () {
        return this.$popup.serializeObject();
    }

    /**
     * Set editable form values from container form values
     * 
     * @protected
     */
    updateEditableForm () {
        const $popup = this.$popup;
        const values = this.getContainerValues();

        for (let key in values) {
            const $input = $popup.find(`[name="${ key }"]`);
            const value = values[key];

            this.setInputValue($input, value);
        }
    }

    /**
     * Set container form values using values from editable form
     * 
     * @protected
     */
    updateContainerForm () {
        const inputs = this.getContainerInputs();
        const values = this.getEditableValues();
        let hasValues = false;

        for (let key in values) {
            if (inputs[key]) {
                const $input = inputs[key];
                const value = values[key];

                if (value) {
                    hasValues = true;
                }

                this.setInputValue($input, value);
            }
        }

        // Add / remove classname from toggle depending if form has any values
        const className = this.options.toggleNotEmptyClassName;

        if (className) {
            this.$container.toggleClass(className, hasValues);
        }
    }

    /**
     * Set input value
     * 
     * @param {object} $input Input element
     * @param {any} value Input value
     * @protected
     */
    setInputValue ($input, value) {
        if ($input.is(':checkbox')) {
            $input.prop('checked', value === true || value === 'true' || value === '1' || value === 1 || value === 'on');
        } else if ($input.is(':radio')) {
            $input.prop('checked', $input.val() === value);
        } else {
            $input.val(value);
        }
    }

    /**
     * Close dropdown
     */
    close (event) {
        if (this.visible) {
            this.$container.dropdown('hide', event);
        }
    }

    /**
     * Save editable form values into container inputs
     */
    save (event) {
        if (this.visible) {
            this.updateContainerForm();
            this.$container.dropdown('hide', event);
        }
    }

    onShow () {
        this.visible = true;
        this.updateEditableForm();
    }

    onShown () {
        // Focus first input
        const $input = this.$popup.find('input, textarea, select').not(':disabled').eq(0);
        if ($input.length) {
            $input.get(0).focus();
        }
    }

    onHide () {
        this.visible = false;
    }
}

$.fn.editable = createPlugin(Editable);
