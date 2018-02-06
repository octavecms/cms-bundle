import map from 'lodash/map';

import createStore from '../modules/store';

import MediaTreeView from '../components/treeview';
import MediaGridList from '../components/gridlist';
import uploader from '../components/uploader';
import ErrorMessage from '../components/error-message';

import { setGridList, fetchFiles, addFolder, deleteSelectedListItems } from '../modules/actions';


/**
 * Top level component
 */

const MEDIA_NAMESPACE = 'media';
const TRIGGER_NAMESPACE = 'mediaTrigger';

const SELECTOR_MEDIA_UPLOAD_FILE = '.js-media-upload-file';
const SELECTOR_MEDIA_REMOVE = '.js-media-remove';
const SELECTOR_MEDIA_SELECT_OPENED = '.js-media-select-opened';
const SELECTOR_MEDIA_SELECT_ALL = '.js-media-select-all';
const SELECTOR_ADD_FOLDER = '.js-media-add-folder';
const SELECTOR_TREE_VIEW = '[data-widget="media-treeview"]';
const SELECTOR_GRID_LIST = '[data-widget="media-gridlist"]';
const SELECTOR_ERROR = '[data-widget="error-message"]';


class MediaStandalone {

    static get defaultOptions () {
        return {
            // Allow selecting multiple files, default: true
            'multiselect': true,

            // Select mode
            'selectmode': false,

            // Select callback
            'onselect': null
        };
    }

    constructor (element, options) {
        this.$element = $(element);
        this.options = $.extend(true, this.constructor.defaultOptions, this.options, options);

        this._init();
    }

    _init () {
        const store = this.store = createStore({'multiselect': this.options.multiselect});
        const $element = this.$element;

        // @TODO Remove, this is for debug only
        window.store = store;

        const $treeView = this.$treeView = $element.find(SELECTOR_TREE_VIEW);
        this.treeView = new MediaTreeView($treeView, {'store': store});

        const $gridList = this.$gridList = $element.find(SELECTOR_GRID_LIST);
        this.gridList = new MediaGridList($gridList, {'store': store});

        // Error message
        new ErrorMessage($element.find(SELECTOR_ERROR), {'store': store});

        // Handle delete button click
        $element.on(`click.${ MEDIA_NAMESPACE }`, SELECTOR_MEDIA_REMOVE, this._handleRemoveClick.bind(this));

        // Handle select button click
        $element.on(`click.${ MEDIA_NAMESPACE }`, SELECTOR_MEDIA_SELECT_OPENED, this._handleSelectOpenedClick.bind(this));
        $element.on(`click.${ MEDIA_NAMESPACE }`, SELECTOR_MEDIA_SELECT_ALL, this._handleSelecAllClick.bind(this));

        // Handle add folder button click
        $element.on(`click.${ MEDIA_NAMESPACE }`, SELECTOR_ADD_FOLDER, this._handleAddFolderClick.bind(this));

        // Handle double click
        $element.on(`dblclick.${ MEDIA_NAMESPACE }`, this._handleItemDoubleClick.bind(this));

        // Upload
        uploader.init({'store': store});
        uploader.registerButton($element.find(SELECTOR_MEDIA_UPLOAD_FILE), this._getUploaderInfo());
        uploader.registerDropZone($gridList, this._getUploaderInfo());

        // On categoryId and category content change update grid list
        store.subscribePath('categoryId', this._handleCategoryChange.bind(this));
        store.subscribePath('categories', this._handleCategoryChange.bind(this));

        // Load grid info
        store.dispatch(fetchFiles(this._getCurrentFolderId()));
    }

    _getCurrentFolderId () {
        return this.store.getState().categoryId;
    }

    _getUploaderInfo () {
        return {
            'info': () => {
                return {
                    'parent': this._getCurrentFolderId()
                };
            }
        };
    }

    _handleRemoveClick () {
        this.store.dispatch(deleteSelectedListItems());
    }

    _handleAddFolderClick () {
        const name = prompt('Enter name of the folder');
        const parent = this._getCurrentFolderId();
        this.store.dispatch(addFolder(name, parent));
    }

    _handleCategoryChange () {
        const state = this.store.getState();
        const list  = state.categories[state.categoryId];

        if (list) {
            this.store.dispatch(setGridList([].concat(list)));
        }
    }

    _handleItemDoubleClick (e) {
        if (this.options.selectmode && typeof this.options.onselect === 'function') {
            const id = this.gridList.getItemId(e);

            if (id) {
                const state = this.store.getState();
                const files = [state.files[id]];

                this.options.onselect(files);
            }
        }
    }

    _handleSelectOpenedClick () {
        if (typeof this.options.onselect === 'function') {
            const state = this.store.getState();
            const files = state.opened ? [state.files[state.opened]] : [];

            this.options.onselect(files);
        }
    }

    _handleSelecAllClick () {
        if (typeof this.options.onselect === 'function') {
            const state = this.store.getState();
            const files = map(state.selected, (value, id) => state.files[id]);

            this.options.onselect(files);
        }
    }

    destroy () {
        uploader.unregisterButton(this.$element.find(SELECTOR_MEDIA_UPLOAD_FILE));
        uploader.unregisterDropZone(this.$gridList);

        this.treeView.destroy();
        this.gridList.destroy();
        this.$element.off(`.${ MEDIA_NAMESPACE }`).removeData(MEDIA_NAMESPACE);
        this.store.destroy();

        this.$treeView = this.$gridList = this.$element = void 0;
        this.treeView = this.gridList = this.store = this.options = void 0;
    }
}


$.bridget(MEDIA_NAMESPACE, MediaStandalone);