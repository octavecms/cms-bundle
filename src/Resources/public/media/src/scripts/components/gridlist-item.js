import each from 'lodash/each';
import map from 'lodash/map';

import {
    setOpenedListItem, toggleOpenedListItem,
    setSelectedListItem, toggleSelectedListItem, addSelectedListItems,
    setDraggingListItems
} from '../modules/actions';


export default class MediaGridListItem {

    static get defaultOptions () {
        return {
            'store': null
        };
    }

    constructor ($container, options) {
        this.$container  = $container;
        this.options     = $.extend({
            'id': $container.data('id')
        }, this.constructor.defaultOptions, options);
        this.store = this.options.store;

        this.popoverHTML = '<div class="media-gridlist-popover">' + $container.find('.media-gridlist-popover').html() + '</div>';

        this.init();
    }

    init () {
        const $container = this.$container;
        const options    = this.options;
        const store      = this.store;

        this.hasPopover = false;

        this.unsubscribers = [
            store.subscribePath('opened', this.handleOpenedChange.bind(this)),
            store.subscribePath('selected', this.handleSelectedChange.bind(this)),
            store.subscribePath('grid.dragging', this.handleDraggingChange.bind(this))
        ];

        // Drag & drop
        $container.draggable({
            helper  : 'clone',
            zIndex  : 999999,
            cursorAt: { left: -10, top: -10 },
            start   : this.handleMoveStart.bind(this),
            stop    : this.handleMoveEnd.bind(this),
            scope   : 'mediaitem',
        });

        // Popover
        $container.on('click', this.handleClick.bind(this));
    }

    /**
     * Remove grid list item from the list
     */
    remove () {
        if (this.hasPopover) {
            this.hasPopover = false;
            this.$container.popover('hide').popover('destroy');
        }

        this.$container.remove();
        this.destroy();
    }

    /**
     * Destroy grid list item instance
     */
    destroy () {
        each(this.unsubscribers, unsubscribe => unsubscribe());
        this.unsubscribers = this.$container = this.options = this.store = null;
    }


    handleClick (e) {
        const id = this.options.id;
        const store = this.store;

        if (e.metaKey || e.ctrlKey) {
            // Selecting multiple nonconsecutive files
            store.dispatch(toggleSelectedListItem(id));
            store.dispatch(setOpenedListItem(null));
        } else if (e.shiftKey) {
            // Selecting multiple consecutive files
            const state    = store.getState();
            const files    = state.categories[state.categoryId] || [];
            let   lastSelected = files[0];
            let   selected = [id];
            let   started = false;
            let   ended = false;

            for (let id in state.selected) {
                if (state.selected[id]) {
                    lastSelected = id;
                }
            }

            for (let i = 0; i < files.length; i++) {
                if (!started && (files[i] === lastSelected || files[i] === id)) {
                    started = true;
                } else if (started && !ended) {
                    if (files[i] === id || files[i] === lastSelected) {
                        ended = true;
                    } else {
                        selected.push(files[i]);
                    }
                }
            }

            selected.push(id);
            selected.push(lastSelected);

            store.dispatch(addSelectedListItems(selected));
            store.dispatch(setOpenedListItem(null));
        } else {
            // Toggle opened item
            store.dispatch(setSelectedListItem(id));
            store.dispatch(toggleOpenedListItem(id));
        }
    }

    handleOpenedChange (opened, prevOpened) {
        if (!this.options) return;
        const id = this.options.id;

        if (opened === id) {
            if (!this.hasPopover) {
                this.hasPopover = true;

                this.$container.popover({
                    trigger: 'null',
                    html: true,
                    placement: 'bottom',
                    content: () => this.popoverHTML
                });
            }

            this.$container.popover('show').addClass('is-active');
        } else if (prevOpened === id) {
            this.$container.popover('hide').removeClass('is-active');
        }
    }

    handleSelectedChange (selected, prevSelected) {
        if (!this.options) return;
        const id = this.options.id;

        const wasSelected = !!prevSelected[id];
        const isSelected  = !!selected[id];

        if (isSelected !== wasSelected) {
            this.$container.toggleClass('is-selected', isSelected);
        }
    }

    handleDraggingChange (dragging) {
        if (!this.options) return;
        const id = this.options.id;

        this.$container.toggleClass('is-dragging', dragging.indexOf(id) !== -1);
    }


    /*
     * Drag and drop
     */

    handleMoveStart (event, ui) {
        const selected = this.store.getState().selected;
        const id = this.options.id;
        let   list = [id];

        if (id in selected) {
            list = map(selected, (item, id) => id);

            if (list.length > 1) {
                ui.helper.append('<span class="label bg-blue">' + list.length + '</span>');
            }
        } else {
            store.dispatch(setSelectedListItem(id));
        }

        store.dispatch(setDraggingListItems(list));
        store.dispatch(setOpenedListItem(null));
    }

    handleMoveEnd (event, ui) {
        store.dispatch(setDraggingListItems([]));
    }

}