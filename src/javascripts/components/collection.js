/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import namespace from 'util/namespace';
import { animateElement } from 'util/animation/element';


/**
 * Collection
 * Allows to add / remove items from the collection list
 */
class Collection {

    static get Defaults () {
        return {
            'listSelector': '.js-collection-list',
            'itemSelector': '.js-collection-item',
            'removeButtonSelector': '.js-collection-remove',
            'addButtonSelector': '.js-collection-add',

            'animationDuration': 200
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.ns = namespace();
        this.$container = $container;
        this.$list = $container.is(options.listSelector) ? $container : $container.find(options.listSelector).eq(0);
        this.counter = this.$list.children(options.itemSelector).length;

        this.refresh();
    }

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
     * Handle "Add item" button click
     * 
     * @param {JQuery.ClickEvent} event 
     */
    handleAddClick (event) {
        const $button = $(event.target).closest(this.options.addButtonSelector);
        const html = $button.attr('data-collection-html');
        const formatted = html.split('__name__').join(this.counter++);
        const $item = $(formatted).appendTo(this.$list);

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

        event.preventDefault();
    }

    /**
     * Handle "Remove item" button click
     * 
     * @param {JQuery.ClickEvent} event 
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
