/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';

import createStore from '../utils/store';
import getInitialState from '../modules/get-initial-state';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


/**
 * Media library
 */
class MediaLibrary {

    static get Defaults () {
        return {
            'foldersSelector': '.js-media-treeview'
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

    create () {
        const store = this.store = createStore(getInitialState(this.options));
        
        // @TODO Remove, this is for debug only
        window.store = store;


    }

    store () {

    }

    // destroy () {
    //     // Cleanup global events
    //     $(window).add(document).off(`.${ this.ns }`);
    // }
}

$.fn.mediaLibrary = createPlugin(MediaLibrary);
