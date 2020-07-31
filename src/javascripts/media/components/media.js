import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';

import createStore from 'media/utils/store';
import getInitialState from 'media/modules/get-initial-state';

import TreeView from 'media/components/treeview';
import FileListView from 'media/components/filelist';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


const SELECTOR_TREEVIEW = '.js-media-treeview';
const SELECTOR_FILELIST = '.js-media-filelist';


/**
 * Media library
 */
class MediaLibrary {

    static get Defaults () {
        return {
            'treeViewSelector': '.js-media-treeview',
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
        $container.on('destroyed', this.destroy.bind(this));

        // // Global events
        // $(window).on(`resize.${ this.ns }`, this.handleResize.bind(this));

        this.create();
    }

    create () {
        const store = this.store = createStore(getInitialState(this.options));

        // Tree
        const $tree = this.$container.find(SELECTOR_TREEVIEW);
        this.tree = new TreeView($tree, {store: store});

        // File list
        const $filelist = this.$container.find(SELECTOR_FILELIST);
        this.filelist = new FileListView($filelist, {store: store});

        // @TODO Remove, this is for debug only
        window.store = store;
    }

    destroy () {
        this.store.destroy();
        this.store = null;

        // Cleanup global events
        // $(window).add(document).off(`.${ this.ns }`);
    }
}

$.fn.mediaLibrary = createPlugin(MediaLibrary);
