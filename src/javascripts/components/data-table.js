/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


/**
 * Data table
 */
class DataTable {

    static get Defaults () {
        return {
            elementSelector: '.js-data-table-element',
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        // this.ns = namespace();

        // ...

        // // Clean up global events to prevent memory leaks and errors, if pages are dynamically loaded using JS
        // // Needed only if attaching listeners to document, window, body or element outside the #ajax-page-loader-wrapper
        // // Requires util/jquery.destroyed.js */
        // $container.on('destroyed', this.destroy.bind(this));

        // // Global events
        // $(window).on(`resize.${ this.ns }`, this.handleResize.bind(this));

        this.update();
    }

    update () {
        const $elements = this.$container.find(this.options.elementSelector);
        const updates = [];

        for (let i = 0; i < $elements.length; i++) {
            const $element = $elements.eq(i);
            const $row = $element.closest('tr');
            
            const elementBox = $element.get(0).getBoundingClientRect();
            const rowBox = $row.get(0).getBoundingClientRect();
            
            updates.push([
                $element,
                'height',
                $row.height() + 1
            ]);
            updates.push([
                $element,
                'margin-top',
                `${ rowBox.top - elementBox.top }px`
            ]);
        }

        for (let i = 0; i < updates.length; i++) {
            updates[i][0].css(updates[i][1], updates[i][2]);
        }
    }

    // destroy () {
    //     // Cleanup global events
    //     $(window).add(document).off(`.${ this.ns }`);
    // }
}

$.fn.dataTable = createPlugin(DataTable);
