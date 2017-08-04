import difference from 'lodash/difference';
import reduce from 'lodash/reduce';
import uniq from 'lodash/uniq';
import filter from 'lodash/filter';

import MediaGridListItem from './gridlist-item';
import microtemplate from '../utils/micro-template';

import { addSelectedItems, removeSelectedItems, unsetAllSelectedListItems, setOpenedListItem } from '../modules/actions';


export default class MediaGridList {

    static get defaultOptions () {
        return {
            'className': 'media-grid-list',
            'itemSelector': '.media-gridlist-box',
            'store': null
        };
    }

    constructor ($container, options) {
        this.$container = $container;
        this.template = microtemplate($container.find('script[type="text/template"]').remove().html());
        this.options = $.extend({}, this.constructor.defaultOptions, options);

        this.mediaGridItems = {};
        this.init();
    }

    init () {
        const $container = this.$container;
        const options    = this.options;
        const store      = this.store      = options.store;

        $container.addClass(this.options.className);

        $container.on('mousedown', this.handleUnselectAllItems.bind(this));

        $container.selectable({})
            .on('selectableselecting', this.handleSelectItem.bind(this))
            .on('selectableselected', this.handleSelectItem.bind(this))
            .on('selectableunselecting', this.handleUnselectItem.bind(this))
            .on('selectableunselected', this.handleUnselectItem.bind(this));


        store.subscribePath('grid.files', this.handleGridChange.bind(this));
        store.subscribePath('grid.loading', this.handleGridLoading.bind(this));
    }

    handleGridChange (newFiles, prevFiles) {
        const state        = this.store.getState();

        // List of ids added / removed, these are objects {"fileIdA": 1, "fileIdB": 1}
        const added        = reduce(difference(newFiles, prevFiles), (list, id) => { list[id] = 1; return list; }, {});
        const removed      = reduce(difference(prevFiles, newFiles), (list, id) => { list[id] = 1; return list; }, {});

        // List of all files
        const files        = filter(uniq([].concat(newFiles, prevFiles)));
        const items        = this.mediaGridItems;
        let prevItem;

        for (let i = 0; i < files.length; i++) {
            let id = files[i];
            let file = state.files[id];

            if (id in added) {
                let $element = $(this.template({'data': file}));

                if (prevItem) {
                    prevItem.$container.after($element);
                } else {
                    this.$container.prepend($element);
                }

                prevItem = items[file.id] = new MediaGridListItem($element, {store: store, id: id});
            } else if (id in removed) {
                items[id].remove();
                delete(items[id]);
            } else {
                prevItem = items[id];
            }
        }
    }

    handleGridLoading (loading) {
        this.$container.toggleClass('is-loading', !!loading);
    }


    handleSelectItem (e, ui) {
        const id = this.getItemId({'target': ui.selected || ui.selecting});
        store.dispatch(addSelectedItems([id]));
    }

    handleUnselectItem (e, ui) {
        const id = this.getItemId({'target': ui.unselected || ui.unselecting});
        store.dispatch(removeSelectedItems([id]));
    }

    handleUnselectAllItems (e) {
        const id = this.getItemId(e);

        if (!id) {
            store.dispatch(unsetAllSelectedListItems());
            store.dispatch(setOpenedListItem(null));
        }
    }


    getItemId (e) {
        if (e && e.target) {
            return this.getItemElement(e).data('id');
        } else if (e instanceof jQuery) {
            return e.data('id');
        } else if (typeof e === 'string') {
            return e;
        }
    }

    getItemElement (e) {
        if (e && e.target) {
            return $(e.target).closest(this.options.itemSelector);
        } else if (e instanceof jQuery) {
            return e;
        } else if (typeof e === 'string') {
            return this.$container.children('[data-id="' + encodeURIComponent(id) + '"]');
        }
    }

}