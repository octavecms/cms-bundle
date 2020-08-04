import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';

import createStore from 'media/util/store';
import getInitialState from 'media/modules/get-initial-state';

import TreeView from 'media/components/treeview';
import FileListView from 'media/components/filelist';
import Info from 'media/components/info';
import Search from 'media/components/search';

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
        return {};
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;

        $container.on('destroyed', this.destroy.bind(this));

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

        // Info
        const $info = this.$container.find(SELECTOR_INFO);
        this.info = new Info($info, {store: store});

        // Search
        const $search = this.$container.find(SELECTOR_SEARCH);
        this.search = new Search($search, {store: store});

        // @TODO Remove, this is for debug only
        window.store = store;
    }

    destroy () {
        this.store.destroy();
        this.store = null;

        if (this.tree.destroy) {
            this.tree.destroy();
        }
        if (this.filelist.destroy) {
            this.filelist.destroy();
        }
        if (this.info.destroy) {
            this.info.destroy();
        }
        if (this.search.destroy) {
            this.search.destroy();
        }

        this.tree = null;
        this.filelist = null;
        this.info = null;
        this.search = null;
    }
}

$.fn.mediaLibrary = createPlugin(MediaLibrary);
