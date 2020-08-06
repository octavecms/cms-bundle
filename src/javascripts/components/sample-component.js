/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


/**
 * Sample component
 */
class Sample {

    static get Defaults () {
        return {};
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
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

$.fn.sample = createPlugin(Sample);
