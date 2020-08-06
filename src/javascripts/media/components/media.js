import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import createStore from 'media/util/store';
import getInitialState from 'media/modules/get-initial-state';

import TreeView from 'media/components/treeview';
import FileListView from 'media/components/filelist';
import Info from 'media/components/info';
import Search from 'media/components/search';
import getSelectedFiles from 'media/modules/get-selected-files';

import 'util/jquery.destroyed';


const SELECTOR_TREEVIEW = '.js-media-treeview';
const SELECTOR_FILELIST = '.js-media-filelist';
const SELECTOR_INFO = '.js-media-info';
const SELECTOR_SEARCH = '.js-media-file-search';


/**
 * Media library
 */
class MediaLibrary {

    static get Defaults () {
        return {
            // Callback when 
            'onselect': null,

            // Allow file selection
            'select': false,

            // Allow multi-select
            'multiselect': true,

            // Load only files by type, eg. 'images'
            'filter': null
        };
    }

    constructor ($container, opts) {
        this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;

        $container.on('destroyed', this.destroy.bind(this));

        this.create();
    }

    /**
     * Magic function from `createPlugin`, it's called if plugin
     * is called again after it has already been initialized
     * 
     * @param {object} options Media library options
     */
    setOptions (options) {
        assign(this.options, options);

        if (this.store) {
            for (let key in options) {
                if (this.store[key].has()) {
                    this.store[key].set(options[key]);
                }
            }
        }
    }

    create () {
        const store = this.store = createStore(getInitialState(this.options));

        // Tree
        const $tree = this.$container.find(SELECTOR_TREEVIEW);
        this.tree = new TreeView($tree, {store: store});

        // File list
        const $filelist = this.$container.find(SELECTOR_FILELIST);
        this.filelist = new FileListView($filelist, {store: store, onselect: this.handleSelect.bind(this) });

        // Info
        const $info = this.$container.find(SELECTOR_INFO);
        this.info = new Info($info, {store: store, onselect: this.handleSelect.bind(this)});

        // Search
        const $search = this.$container.find(SELECTOR_SEARCH);
        this.search = new Search($search, {store: store});

        // @TODO Remove, this is for debug only
        window.store = store;
    }

    destroy () {
        if (this.store) {
            this.store.destroy();
            this.store = null;
        }

        if (this.tree && this.tree.destroy) {
            this.tree.destroy();
        }
        if (this.filelist && this.filelist.destroy) {
            this.filelist.destroy();
        }
        if (this.info && this.info.destroy) {
            this.info.destroy();
        }
        if (this.search && this.search.destroy) {
            this.search.destroy();
        }

        this.tree = null;
        this.filelist = null;
        this.info = null;
        this.search = null;
    }

    handleSelect () {
        if (this.options.onselect) {
            let selected = getSelectedFiles(this.store);
            this.options.onselect(selected);

            this.$container.modal('hide');
        }
    }
}

$.fn.mediaLibrary = createPlugin(MediaLibrary);
