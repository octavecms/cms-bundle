/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import 'util/jquery.destroyed';
import namespace from 'util/namespace';
import { animateElement } from 'util/animation/element';
import setFormValues from 'util/form/set-form-values';


/**
 * Collection
 * Allows to add / remove items from the collection list
 */
class Collection {

    static get Defaults () {
        return {
            // Input name prefix
            'name': null,

            'listSelector': '.js-collection-list',
            'itemSelector': '.js-collection-item',
            'removeButtonSelector': '.js-collection-remove',
            'addButtonSelector': '.js-collection-add',

            'attributeType': 'data-collection-type',
            'attributeHtml': 'data-collection-html',

            'animationDuration': 200
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.ns = namespace();
        this.$container = $container;
        this.$list = $container.is(options.listSelector) ? $container : $container.find(options.listSelector).eq(0);
        this.counter = this.$list.children(options.itemSelector).length;
        this.$form = $container.closest('form');

        $container.on('destroyed', this.destroy.bind(this));
        this.$form.on(`reset.${ this.ns }`, this.handleFormReset.bind(this));

        this.refresh();
    }

    /**
     * Remove global event listeners
     */
    destroy () {
        if (this.$form) {
            this.$form.off(`reset.${ this.ns }`);
            this.$form = null;
        }
    }

    /**
     * Add events to the buttons
     */
    refresh () {
        const options = this.options;
        const ns = this.ns;
        const $container = this.$container;

        // Re-attach listeners since add / remove buttons can be in the dropdown which gets
        // moved outside the list by dropdowns popperjs
        $container.find(options.addButtonSelector).off(`.${ ns }`).on(`click.${ ns } returnkey.${ ns }`, this.handleAddClick.bind(this));
        $container.find(options.removeButtonSelector).off(`.${ ns }`).on(`click.${ ns } returnkey.${ ns }`, this.handleRemoveClick.bind(this));
    }

    /**
     * Add item to the collection
     *
     * @param {string} type Item type
     * @param {object|null} values Item values
     * @param {boolean} [silent] Don't trigger any events
     */
    add (type, values = null, silent = false) {
        const info = this.getTypeInfo(type);
        const index = this.counter++;
        const formatted = info.html.split('__name__').join(index);
        const $item = $(formatted).appendTo(this.$list);

        // Set values
        if (values) {
            const namePrefix = `${ this.options.name }[${ index }]`;
            setFormValues($item, values, namePrefix);
        }

        if (silent === false) {
            $item.app();
            this.$container.trigger('collection.add');
            this.refresh();

            // Animate element into view
            animateElement($item, {
                'from': {
                    'height': 0,
                },
                'duration': this.options.animationDuration
            });
        }

        return $item;
    }

    /**
     * Returns type info
     *
     * @param {string} type Item type
     * @returns {object} Item info with keys 'type' and 'html'
     */
    getTypeInfo (type) {
        const options = this.options;
        const $buttons = this.$container.find(options.addButtonSelector);
        let   $button = null;

        if (type || $buttons.length > 1) {
            $button = $buttons.filter(`[${ options.attributeType }="${ type }"]`);
        } else {
            $button = $buttons;
        }

        if ($button.length) {
            return {
                'type': type,
                'html': $button.attr(options.attributeHtml),
            };
        } else {
            return null;
        }
    }

    /**
     * Set collection values
     *
     * @param {array} values Values
     */
    setValues (values) {
        this.$list.empty();

        if (Array.isArray(values)) {
            for (let i = 0; i < values.length; i++) {
                // There could be empty values if collection items previously were
                // removed and input names have non-sequential names
                if (values[i]) {
                    this.add(values[i].type, values[i], true);
                }
            }
        }

        // Events
        this.$container.app();
        this.$container.trigger('collection.add').trigger('collection.remove');
        this.refresh();
    }


    /*
     * Event listeners
     * ----------------------------------------------------
     */


    /**
     * Reset collection when form is reset
     *
     * @param {JQuery.Event} event Event
     */
    handleFormReset () {
        this.setValues([]);
    }

    /**
     * Handle "Add item" button click
     *
     * @param {JQuery.ClickEvent} event Event
     */
    handleAddClick (event) {
        const $button = $(event.target).closest(this.options.addButtonSelector);
        const type = $button.attr(this.options.attributeType);

        this.add(type);
        event.preventDefault();
    }

    /**
     * Handle "Remove item" button click
     *
     * @param {JQuery.ClickEvent} event Event
     */
    handleRemoveClick (event) {
        const $link = $(event.target);
        const href = $link.attr('href');
        const $target = href && href[0] === '#' ? $($link.attr('href')) : $link;
        const $item = $target.closest(this.options.itemSelector);

        // Animate element into view
        animateElement($item, {
            'to': {
                'height': 0,
            },
            'duration': this.options.animationDuration
        }).then(() => {
            $item.remove();
            this.$container.trigger('collection.remove');
        });

        event.preventDefault();
    }
}

$.fn.collection = createPlugin(Collection);
