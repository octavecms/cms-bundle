/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


/**
 * Tooltip component
 */
class Tooltip {

    static get Defaults () {
        return {
            // Popper placement
            'placement': '',

            // Allow HTML in the tooltip
            'html': false,

            // Tooltip template
            'template': '<div class="tooltip" role="tooltip"><div class="tooltip__arrow"></div><div class="tooltip__inner"></div></div>'
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
    }

    // destroy () {
    //     // Cleanup global events
    //     $(window).add(document).off(`.${ this.ns }`);
    // }
}

$.fn.tooltip = createPlugin(Tooltip);
