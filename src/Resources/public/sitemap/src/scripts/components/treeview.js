import map from 'lodash/map';
import each from 'lodash/each';
import difference from 'lodash/difference';
import { movePage, deletePage, addTemporaryPage, removeTemporaryPage } from '../modules/actions';

import { isDescendantOf, isChildOf } from '../utils/hierarchy'
import microtemplate from '../utils/micro-template';


const EDIT_LINK_SELSECTOR = '.sonata-tree__item__edit';

let UID = 1;


export default class SitemapTreeView {

    static get defaultOptions () {
        return {
            'className': 'sitemap-tree-view',
            'instanceAttribute': 'data-treeview-instance',
            'itemSelector': '.sonata-tree__item',
            'removeSelector': '.sonata-tree__item__remove',

            'togglersSelector': '[data-treeview-toggler]',
            'toggledSelector':  '[data-treeview-toggled]',
            'toggledClassName': 'is-toggled',
            'activeClassName': 'is-active',

            'store': null,
            'temporaryform': null
        };
    }

    constructor ($container, options) {
        this.$container = $container;
        this.template = microtemplate($container.find('script[type="text/template"]').remove().html());
        this.options = $.extend({}, this.constructor.defaultOptions, options);
        this.namespace = `sitemap${ ++UID }`;
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
            .attr(options.instanceAttribute, true)
            .data('treeview', this);

        $container.on(`click.${ namespace }`, options.togglersSelector, this.handleTogglerClick.bind(this));
        $container.on(`click.${ namespace }`, options.removeSelector, this.handleRemoveClick.bind(this));

        this.unsubscribers = [
            store.subscribePath('tree.pages', this.handlePageChange.bind(this))
        ];

        this.restoreTreeState();
        this.temporaryform = this.options.temporaryform;
    }

    destroy () {
        const $container = this.$container;
        const namespace  = this.namespace;

        $container.off(`.${ namespace }`);
        $container.find(this.options.itemSelector).each((index, item) => {
            this.cleanupItem($(item));
        });

        each(this.unsubscribers, unsubscribe => unsubscribe());

        this.unsubscribers = this.$container = this.template = this.options = this.store = this.states = null;
    }

    expand ($item) {
        const options = this.options;
        const id      = $item.data('id');
        const states  = this.states;

        if (!states[id]) {
            $item.addClass(options.toggledClassName);
            $item.next('ul').slideDown(this.updateItemDragOffsets.bind(this, $item));
            window.$item = $item;

            states[id] = true;
        }
    }

    collapse ($item) {
        const options = this.options;
        const id      = $item.data('id');
        const states  = this.states;

        if (states[id]) {
            $item.removeClass(options.toggledClassName);
            $item.next('ul').slideUp();

            states[id] = false;
        }
    }

    /**
     * On toggler click expand / collapse folder list
     */
    handleTogglerClick (e) {
        const options = this.options;
        const $item   = $(e.target).closest(options.itemSelector);
        const id      = $item.data('id');

        e.preventDefault();
        store.dispatch(removeTemporaryPage());

        if (this.states[id]) {
            this.collapse($item);
        } else {
            this.expand($item);
        }
    }


    /*
     * Handle remove click
     */

    handleRemoveClick (e) {
        const options = this.options;
        const $item   = $(e.target).closest(options.itemSelector);
        const id      = $item.data('id');

        e.preventDefault();
        store.dispatch(deletePage(id));
        store.dispatch(removeTemporaryPage());
    }


    /*
     * Handle state change
     */

    handlePageChange (pages, prevPages) {
        this.renderTree();
    }



    /*
     * Drag and drop suppoer
     */


    setupDroppable ($element) {
        const id = $element.data('id');
        const state = store.getState();
        const page = state.tree.pages[id];

        if (!page.readonly) {
            $element.draggable({
                scope   : 'sitemapitem',
                helper  : 'clone',
                zIndex  : 999999,
                cursorAt: { left: -10, top: -10 },
                // start   : this.handleTreeItemDragStart.bind(this),
                // stop    : this.handleTreeItemDragEnd.bind(this),
                appendTo: this.$container
            });
        }

        $element.droppable({
            accept   : this.filterDraggable.bind(this),
            scope    : 'sitemapitem',
            tolerance: 'pointer',
            drop     : this.handleDropDrop.bind(this),
            over     : this.handleDropOver.bind(this),
            out      : this.handleDropOut.bind(this)
        });
    }

    filterDraggable ($element) {
        return $element.is('[data-widget="sitemap-add"], ' + this.options.itemSelector);
    }

    cleanupDroppable ($element) {
        $element.draggable('destroy');
        $element.droppable('destroy');
    }

    handleDropOver (e, ui) {
        const $item = $(e.target);

        $item.addClass('ui-draggable-target');
        this.expand($item);
    }

    handleDropOut (e, ui) {
        $(e.target).removeClass('ui-draggable-target');
    }

    handleDropDrop (e, ui) {
        this.handleDropOut(e, ui);

        const store = this.store;
        const state = store.getState();
        const parent = $(e.target).data('id');
        const id = ui.draggable.data('id');
        const type = ui.draggable.data('sitemapAddType');

        if (type) {
            // New page
            this.states[parent] = true;
            store.dispatch(addTemporaryPage(parent, type));
        } else if (!isDescendantOf(parent, id, state) && !isChildOf(id, parent, state)) {
            // Not dropping parent into child
            store.dispatch(movePage(id, parent));
        }
    }


    /*
     * Tree rendering
     */

    generateTree (list) {
        if (list && list.length) {
            const pages = this.store.getState().tree.pages;
            const tree = [];

            for (let i = 0; i < list.length; i++) {
                let page = pages[list[i]];

                tree.push($.extend({}, page, {
                    'children': page.children && this.generateTree(page.children)
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
        const pages = state.tree.pages;
        const page = pages[state.tree.root];

        const root = $.extend({}, page, {
            'children': page.children && this.generateTree(page.children)
        });

        const html = this.template({
            'data': root,
            'template': this.template,
            'root': true,
            'depth': 1,
            'currentPageId': null
        });

        // Render
        $container.html(html);
        this.restoreTreeState();
    }

    getEditUrl (data) {
        const html = this.template({
            'data': data,
            'template': this.template,
            'root': true,
            'depth': 1,
            'currentPageId': null
        });

        return $(html).find(EDIT_LINK_SELSECTOR).attr('href');
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

    /**
     * Setup up drag and drop support for item
     *
     * @param {object} $item
     * @protected
     */
    setupItem ($item) {
        const id = $item.data('id');

        if (id === 'temporary') {
            this.temporaryform.show($item);
        } else {
            this.setupDroppable($item);
        }

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
        const id = $item.data('id');

        if (id === 'temporary') {
            this.temporaryform.hide($item);
        }

        $item.off('remove');
        this.cleanupDroppable($item);
    }

    updateItemDragOffsets ($item) {
        const draggable = $item.data('ui-draggable');

        if (draggable) {
            $.ui.ddmanager.prepareOffsets(draggable, null);
        }
    }

}