/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';

import each from 'lodash/each';
import responsive from 'util/responsive';
import namespace from 'util/namespace';
import 'util/jquery.destroyed';


/**
 * Component which is enabled / disabled on specific resolutions
 */

export default class ResponsiveComponent {

    static get Defaults () {
        return {
            // Media query for which component is enabled, null if enabled for all resolutions
            // Eg. 'md-up'
            'enableMq': null
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.mediaListeners = [];
        this.enabled = false;
        this.ns = namespace();

        this.init();

        if (options.enableMq) {
            this.mediaListeners = this.mediaListeners.concat([
                // 'enter' and 'leave' returns detach function
                responsive.enter(options.enableMq, this.enable.bind(this)),
                responsive.leave(options.enableMq, this.disable.bind(this))
            ]);
        } else {
            this.enable();
        }

        // Clean up global events to prevent memory leaks and errors, if pages are dynamically loaded using JS
        // Needed only if attaching listeners to document, window, body or element outside the #ajax-page-loader-wrapper
        // Requires util/jquery.destroyed.js */
        $container.on('destroyed', this.destroy.bind(this));
    }

    init () {
    }

    destroy () {
        this.disable();

        each(this.mediaListeners, (fn) => fn());
        this.mediaListeners = this.options = this.$container = null;
    }

    enable () {
        if (this.enabled) return;
        this.enabled = true;
        return true;
    }

    disable () {
        if (!this.enabled) return;
        this.enabled = false;
        return true;
    }
}
