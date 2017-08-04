import map from 'lodash/map';
import difference from 'lodash/difference';
import { setCategory, fetchFilesIfNeeded, moveFiles, moveFolder } from '../modules/actions';

import microtemplate from '../utils/micro-template';


export default class MediaTreeView {

    static get defaultOptions () {
        return {
            'className': 'media-tree-view',
            'itemSelector': '.sonata-tree__item',
            'store': null
        };
    }

    constructor ($container, options) {
        this.$container = $container;
        this.template = microtemplate($container.find('script[type="text/template"]').remove().html());
        this.options = $.extend({}, this.constructor.defaultOptions, options);
        this.store = this.options.store;
        this.init();
    }

    init () {
        const $container = this.$container;
        const options    = this.options;

        $container.addClass(options.className);

        $container.on('click', options.itemSelector + ' a', this.handleItemClick.bind(this));

        $container.find(options.itemSelector).each((index, item) => this.setupDroppable($(item)));

        store.subscribePath('categoryId', this.handleCategoryChange.bind(this));
        store.subscribePath('tree.folders', this.handleFolderChange.bind(this));
    }

    handleItemClick (e) {
        const $item = $(e.target).closest(this.options.itemSelector);
        const categoryId = $item.data('id');
        const store = this.options.store;

        e.preventDefault();

        store.dispatch(setCategory(categoryId));
        store.dispatch(fetchFilesIfNeeded(categoryId));
    }

    handleCategoryChange (categoryId) {
        this.$container.find(this.options.itemSelector)
            .removeClass('is-active')
            .filter('[data-id="' + encodeURIComponent(categoryId) + '"]')
                .addClass('is-active');
    }

    handleFolderChange (folders, prevFolders) {
        const $container = this.$container;
        const foldersIDs = map(folders, folder => folder.id);
        const prevFoldersIDs = map(prevFolders, folder => folder.id);

        // // List of ids added / removed, these are objects {"fileIdA": 1, "fileIdB": 1}
        // const added   = reduce(difference(folders, prevFolders), (list, id) => { list[id] = 1; return list; }, {});
        // const removed = reduce(difference(prevFolders, folders), (list, id) => { list[id] = 1; return list; }, {});

        const added   = difference(foldersIDs, prevFoldersIDs);
        const removed = difference(prevFoldersIDs, foldersIDs);

        for (let i = 0; i < added.length; i++) {
            let folder = folders[added[i]];

            let $parent = $container.find('[data-id="' + encodeURIComponent(folder.parent) + '"]').parent();
            let $list   = $parent.find('ul').eq(0);

            if (!$list.length) {
                $list = $('<ul></ul>').appendTo($parent);
            }

            const $folder = $(this.template({'data': folder})).appendTo($list);
            this.setupDroppable($folder.find(this.options.itemSelector));
        }

        for (let i = 0; i < removed.length; i++) {
            let folder = folders[removed[i]];
            console.log('@TODO REMOVE SUBFOLDER...', folder);
        }
    }

    setupDroppable ($element) {
        $element.draggable({
            scope   : 'mediaitem',
            helper  : 'clone',
            zIndex  : 999999,
            cursorAt: { left: -10, top: -10 },
            start   : this.handleTreeItemDragStart.bind(this),
            stop    : this.handleTreeItemDragEnd.bind(this),
            appendTo: this.$container
        });

        $element.droppable({
            scope    : 'mediaitem',
            tolerance: 'pointer',
            drop     : this.handleDropDrop.bind(this),
            over     : this.handleDropOver.bind(this),
            out      : this.handleDropOut.bind(this)
        });
    }

    handleDropOver (e, ui) {
        $(e.target).addClass('ui-draggable-target');
    }

    handleDropOut (e, ui) {
        $(e.target).removeClass('ui-draggable-target');
    }

    handleDropDrop (e, ui) {
        this.handleDropOut(e, ui);

        const store = this.store;
        const id = ui.draggable.data('id');
        const parent = $(e.target).data('id');

        console.log(parent);

        if (id in store.getState().files) {
            // Files
            const files = store.getState().grid.dragging;
            store.dispatch(moveFiles(files, parent));
        } else {
            // Folder
            store.dispatch(moveFolder(id, parent));
        }
    }

    handleTreeItemDragStart () {

    }

    handleTreeItemDragEnd () {

    }

}