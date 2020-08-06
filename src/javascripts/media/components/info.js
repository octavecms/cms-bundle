import $ from 'util/jquery';
import 'util/template/jquery.template';
import map from 'lodash/map';
import namespace from 'util/namespace';
import debounce from 'media/util/debounce-raf';

import { deleteFiles } from 'media/modules/actions-files';
import { deleteFolder, setSelectedFolder } from 'media/modules/actions-folders';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


const SELECTOR_DELETE = '.js-media-info-delete';


/**
 * Info component
 */
export default class Info {

    static get Defaults () {
        return {
            store: null
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.store = options.store;
        this.ns = namespace();

        // Initialize template
        $container.template({'removeSiblings': true});

        // Render
        this.render();

        // Prevent multiple calls to render during since store change
        this.render = debounce(this.render.bind(this));

        this.events();
    }

    events () {
        const store = this.store;
        const $container = this.$container;
        const ns = this.ns;

        // On file list change re-render
        // store.files.grid.on(`change.${ ns }`, this.render.bind(this));
        
        // store.files.loading.on(`change.${ ns }`, (loading) => {
        //     if (loading) {
        //         this.render();
        //     }
        // });

        // store.files.list['*'].on(`change.${ ns }`, (newValue, prevValue) => {
        //     if (newValue && prevValue) {
        //         if (prevValue.expanded !== newValue.expanded) {
        //             this.getElement(newValue.id).toggleClass('tree__item--expanded', newValue.expanded);
        //         }
        //         if (prevValue.name !== newValue.name) {
        //             this.getElement(newValue.id, SELECTOR_TITLE).text(newValue.name);
        //         }
        //         if (prevValue.disabled !== newValue.disabled) {
        //             this.getElement(newValue.id).toggleClass('tree__item--disabled', newValue.disabled);
        //         }
        //     }
        // });

        $container.on('click returnkey', SELECTOR_DELETE, () => {
            const files = store.files.selected.get();
            const folder = store.folders.selected.get();

            if (files.length) {
                deleteFiles(store, files);
            } else {
                deleteFolder(store, folder);
            }
        });

        store.folders.selected.on(`change.${ ns }`, this.render);
        store.files.selected.on(`change.${ ns }`, this.render);
        store.files.loading.on(`change.${ ns }`, this.render);
    }

    render () {
        const store = this.store;
        const allowselect = store.select.get();
        const multiselect = allowselect && store.multiselect.get();
        const loading = store.files.loading.get();
        const folder = store.folders.selected.get();
        const files = store.files.selected.get();
        
        let   type = 'empty'
        let   data = null;
        let   fileList = null;
        let   allFilesAreImages = true;
        let   allowDelete = true;
        
        if (files.length === 1) {
            type = 'file';
            data = store.files.list[files[0]].get();
            allFilesAreImages = !!data.isImage;

            if (data.disabled) {
                allowDelete = false;
            }
        } else if (files.length > 1) {
            type = 'files';
            fileList = map(files, (id) => store.files.list[id].get());
            data = fileList;
        } else if (folder) {
            type = 'folder';
            fileList = map(store.files.grid.get(), (id) => store.files.list[id].get());
            data = store.folders.list[folder].get();

            // Can't delete disabled folder or root folder
            if (data.disabled || data.id === store.folders.root.get()) {
                allowDelete = false;
            }
        }

        if (fileList) {
            for (let i = 0; i < fileList.length; i++) {
                if (!fileList[i].isImage) {
                    allFilesAreImages = false;
                    break;
                }
            }
        }
        
        this.$container.template('replace', {
            'select': allowselect,
            'multiselect': multiselect,

            'type': type,
            'data': data,
            'files': fileList,
            'allFilesAreImages': allFilesAreImages,
            'allowDelete': allowDelete,

            'loading': type !== 'empty' && loading,
        });
    }

    destroy () {
        if (this.store) {
            if (this.store.off) {
                this.store.off(`.${ this.ns }`);
            }
            this.store = null;
        }
    }
}