import map from 'lodash/map';
import each from 'lodash/each';
import difference from 'lodash/difference';
import { setCategory, fetchFiles, moveFiles, moveFolder } from '../modules/actions';

import { isDescendantOf, isChildOf } from '../utils/folders'
import microtemplate from '../utils/micro-template';
import uploader from './uploader';


let UID = 1;


export default class MediaTreeView {

    static get defaultOptions () {
        return {
            'className': 'media-tree-view',
            'instanceAttribute': 'data-treeview-instance',
            'itemSelector': '.sonata-tree__item',
            'store': null,

            'togglersSelector': '[data-treeview-toggler]',
            'toggledSelector':  '[data-treeview-toggled]',
            'toggledClassName': 'is-toggled',
            'activeClassName': 'is-active'
        };
    }

    constructor ($container, options) {
        this.$container = $container;
        this.template = microtemplate($container.find('script[type="text/template"]').remove().html());
        this.options = $.extend({}, this.constructor.defaultOptions, options);
        this.namespace = `mediagridlist${ ++UID }`;
        this.states = {};

        this.init();
    }

    init () {
        const $container = this.$container;
        const options    = this.options;
        const store      = this.store = options.store;
        const namespace  = this.namespace;

        $container
            .addClass(options.className)
            .attr(options.instanceAttribute, true);

        $container.on(`click.${ namespace }`, options.itemSelector + ' a', this.handleItemClick.bind(this));
        $container.on(`click.${ namespace }`, options.togglersSelector, this.handleTogglerClick.bind(this));

        this.unsubscribers = [
            store.subscribePath('categoryId', this.handleCategoryChange.bind(this)),
            store.subscribePath('tree.folders', this.handleFolderChange.bind(this))
        ];

        this.restoreTreeState();
    }

    destroy () {
        const $container = this.$container;
        const namespace  = this.namespace;
        const items      = this.mediaGridItems;

        $container.off(`.${ namespace }`);
        $container.find(this.options.itemSelector).each((index, item) => {
            this.cleanupItem($(item));
        });

        each(this.unsubscribers, unsubscribe => unsubscribe());

        this.unsubscribers = this.$container = this.template = this.options = this.store = this.states = null;
    }

    /**
     * On item click change active category
     */
    handleItemClick (e) {
        const $item = $(e.target).closest(this.options.itemSelector);
        const categoryId = $item.data('id');
        const store = this.store;

        e.preventDefault();

        store.dispatch(setCategory(categoryId));
        store.dispatch(fetchFiles(categoryId));
    }

    /**
     * On toggler click expand / collapse folder list
     */
    handleTogglerClick (e) {
        const options    = this.options;
        const $item      = $(e.target).closest(options.itemSelector);
        const categoryId = $item.data('id');
        const states     = this.states;

        e.preventDefault();

        $item.toggleClass(options.toggledClassName);
        $item.next('ul').slideToggle();

        states[categoryId] = !states[categoryId];
    }


    /*
     * Handle state change
     */


    handleCategoryChange (categoryId) {
        this.$container.find(this.options.itemSelector)
            .removeClass('is-active')
            .filter('[data-id="' + encodeURIComponent(categoryId) + '"]')
                .addClass('is-active');
    }

    handleFolderChange (folders, prevFolders) {
        this.renderTree();
    }


    /*
     * Drag and drop suppoer
     */


    setupDroppable ($element) {
        $element.draggable({
            scope   : 'mediaitem',
            helper  : 'clone',
            zIndex  : 999999,
            cursorAt: { left: -10, top: -10 },
            // start   : this.handleTreeItemDragStart.bind(this),
            // stop    : this.handleTreeItemDragEnd.bind(this),
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

    cleanupDroppable ($element) {
        $element.draggable('destroy');
        $element.droppable('destroy');
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
        const state = store.getState();
        const id = ui.draggable.data('id');
        const parent = $(e.target).data('id');

        if (id in store.getState().files) {
            // Files
            if (state.categoryId !== parent) {
                // Not dropping in same folder
                const files = store.getState().grid.dragging;
                store.dispatch(moveFiles(files, parent));
            }
        } else {
            // Folder
            if (!isDescendantOf(parent, id, state) && !isChildOf(id, parent, state)) {
                // Not dropping parent into child
                store.dispatch(moveFolder(id, parent));
            }
        }
    }


    /*
     * Tree rendering
     */

    generateTree (list) {
        if (list && list.length) {
            const folders = this.store.getState().tree.folders;
            const tree = [];

            for (let i = 0; i < list.length; i++) {
                let folder = folders[list[i]];

                tree.push($.extend({}, folder, {
                    'children': folder.children && this.generateTree(folder.children)
                }));
            }

            return tree;
        } else {
            return [];
        }
    }

    renderTree () {
        const $container = this.$container;
        const options = this.options;
        const state = this.store.getState();
        const folders = state.tree.folders;
        const folder = folders[state.tree.root];

        const root = $.extend({}, folder, {
            'children': folder.children && this.generateTree(folder.children)
        });

        const html = this.template({
            'data': root,
            'template': this.template,
            'root': true,
            'depth': 1,
            'currentCategoryId': state.categoryId
        });

        // Render
        this.cleanupTreeState();
        $container.html(html);
        this.restoreTreeState();
    }

    /*
     * Restore tree active element states
     */
    restoreTreeState () {
        const options = this.options;
        const $container = this.$container;
        const $active = $container.find('.' + options.activeClassName);
        const $lists = $active.parents('[' + options.instanceAttribute + '] ul, [' + options.instanceAttribute + ']');

        $lists.show();
        $lists.prev().addClass(options.toggledClassName);

        // Restore state
        const states = this.states;
        for (let id in states) {
            if (states[id]) {
                let $item = $container.find('[data-id="' + encodeURIComponent(id) + '"]');
                $item.addClass(this.options.toggledClassName);
                $item.next('ul').show();
            }
        }

        // Restore toggled elements
        const $toggled = $container.find(options.toggledSelector);
        $toggled.addClass(options.toggledClassName);
        $toggled.next('ul').show();

        // Enable drag and drop, file upload
        $container.find(options.itemSelector).each((index, item) => {
            this.setupItem($(item));
        });
    }

    cleanupTreeState () {
        const $items = this.$container.find(this.options.itemSelector);
        uploader.unregisterDropZone($items);
    }

    /**
     * Setup up drag and drop support for item
     *
     * @param {object} $item
     * @protected
     */
    setupItem ($item) {
        this.setupDroppable($item);

        uploader.registerDropZone($item, {
            'info': { 'parent': $item.data('id') }
        });

        // When item is removed from DOM, cleanup
        $item.one('remove', this.cleanupItem.bind(this, $item));
    }

    /**
     * Clean up item to allow garbage collection
     *
     * @param {object} $item
     * @protected
     */
    cleanupItem ($item) {
        $item.off('remove');
        this.cleanupDroppable($item);
        uploader.unregisterDropZone($item);
    }

}