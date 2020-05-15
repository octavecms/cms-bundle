import each from 'lodash/each';
import map from 'lodash/map';

import {
    setOpenedListItem, toggleOpenedListItem,
    setSelectedListItem, toggleSelectedListItem, addSelectedListItems,
    setDraggingListItems
} from 'modules/actions';

import uploader from './uploader';


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

        this.$popover    = $container.find('.media-gridlist-popover');
        this.$replace    = null;

        this.$popover.attr('data-id', this.options.id);

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

        // Already should be opened
        if (store.getState().opened === this.options.id) {
            this.handleOpenedChange(this.options.id, null);
        }

        // Drag & drop
        const $cloneContainer = $container.closest('.modal');

        $container.draggable({
            helper  : 'clone',
            appendTo: $cloneContainer.length ? $cloneContainer : 'body',
            zIndex  : 999999,
            cursorAt: { left: -10, top: -10 },
            start   : this.handleMoveStart.bind(this),
            stop    : this.handleMoveEnd.bind(this),
            scope   : 'mediaitem',
        });

        // Popover
        $container.on('click', this.handleClick.bind(this));
    }

    initPopover () {
        // "Replace" button
        this.$replace = this.$popover.find('.js-media-replace');
        uploader.registerButton(this.$replace, {
            'multiple': false,
            'info': {
                'replace': this.options.id
            }
        });
    }

    /**
     * Remove grid list item from the list
     */
    remove () {
        const $container = this.$container;

        if (this.hasPopover) {
            this.hasPopover = false;

            $container
                .popover('hide')
                .popover('destroy');
        }

        this.destroy();
        $container.remove();
    }

    /**
     * Destroy grid list item instance
     */
    destroy () {
        uploader.unregisterButton(this.$replace || $());

        this.$container.draggable('destroy');
        this.$container.off('click');

        each(this.unsubscribers, unsubscribe => unsubscribe());
        this.unsubscribers = this.$container = this.$replace = this.options = this.store = null;
    }


    handleClick (e) {
        const id = this.options.id;
        const store = this.store;
        const state = store.getState();

        if ((e.metaKey || e.ctrlKey) && state.multiselect) {
            // Selecting multiple nonconsecutive files
            store.dispatch(toggleSelectedListItem(id));
            store.dispatch(setOpenedListItem(null));
        } else if (e.shiftKey && state.multiselect) {
            // Selecting multiple consecutive files
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
                    content: this.$popover.removeClass('hidden'),
                    container: this.$container.closest('.media-gridlist').parent()
                });

                this.initPopover();
            }

            this.$container.popover('show').addClass('is-active');
            this.$popover

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
        const store    = this.store;
        const selected = store.getState().selected;

        const id       = this.options.id;
        let   list     = [id];

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
        this.store.dispatch(setDraggingListItems([]));
    }

}
