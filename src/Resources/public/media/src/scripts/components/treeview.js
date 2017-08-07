import map from 'lodash/map';
import difference from 'lodash/difference';
import { setCategory, fetchFilesIfNeeded, moveFiles, moveFolder } from '../modules/actions';

import microtemplate from '../utils/micro-template';


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
        this.store = this.options.store;
        this.states = {};

        this.init();
    }

    init () {
        const $container = this.$container;
        const options    = this.options;

        $container
            .addClass(options.className)
            .attr(options.instanceAttribute, true);

        $container.on('click', options.itemSelector + ' a', this.handleItemClick.bind(this));
        $container.on('click', options.togglersSelector, this.handleTogglerClick.bind(this));

        store.subscribePath('categoryId', this.handleCategoryChange.bind(this));
        store.subscribePath('tree.folders', this.handleFolderChange.bind(this));

        this.restoreTreeState();
    }

    /**
     * On item click change active category
     */
    handleItemClick (e) {
        const $item = $(e.target).closest(this.options.itemSelector);
        const categoryId = $item.data('id');
        const store = this.options.store;

        e.preventDefault();

        store.dispatch(setCategory(categoryId));
        store.dispatch(fetchFilesIfNeeded(categoryId));
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


    /*
     * Tree rendering
     */

    generateTree (list) {
        if (list && list.length) {
            const folders = store.getState().tree.folders;
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
            'currentCategoryId': store.getState().categoryId
        });

        // Render
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

        // Enable drag and drop
        $container.find(options.itemSelector).each((index, item) => this.setupDroppable($(item)));
    }

}