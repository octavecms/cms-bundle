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
            'className': 'media-gridlist',
            'itemSelector': '.media-gridlist-box',
            'popoverSelector': '.popover',
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
        store.subscribePath('files', this.handleFilesChange.bind(this));
    }

    handleGridChange (newFiles, prevFiles) {
        const store   = this.store;
        const state   = store.getState();

        // List of ids added / removed, these are objects {"fileIdA": 1, "fileIdB": 1}
        const added   = reduce(difference(newFiles, prevFiles), (list, id) => { list[id] = 1; return list; }, {});
        const removed = reduce(difference(prevFiles, newFiles), (list, id) => { list[id] = 1; return list; }, {});

        // List of all files
        const files   = filter(uniq([].concat(newFiles, prevFiles)));
        const items   = this.mediaGridItems;
        let prevItem;

        for (let i = 0; i < files.length; i++) {
            let id = files[i];
            let file = state.files[id];

            if (id in added) {
                // New items which were added
                let $element = $(this.template({'data': file}));

                if (prevItem) {
                    prevItem.$container.after($element);
                } else {
                    this.$container.prepend($element);
                }

                prevItem = items[file.id] = new MediaGridListItem($element, {store: store, id: id});
            } else if (id in removed) {
                // Items which were removed
                items[id].remove();
                delete(items[id]);
            } else {
                prevItem = items[id];
            }
        }
    }

    handleFilesChange (newFiles, prevFiles) {
        const items = this.mediaGridItems;
        const store = this.store;

        for (let id in newFiles) {
            let newFile  = newFiles[id];
            let prevFile = prevFiles[id];

            if (prevFile && prevFile !== newFile) {
                for (let key in newFile) {
                    if (newFile[key] !== prevFile[key]) {
                        // Replace item
                        let prevItem = items[newFile.id];
                        let $element = $(this.template({'data': newFile}));

                        prevItem.$container.after($element);
                        items[newFile.id].remove();
                        items[newFile.id] = new MediaGridListItem($element, {store: store, id: newFile.id});

                        break;
                    }
                }
            }
        }
    }

    handleGridLoading (loading) {
        this.$container.toggleClass('is-loading', !!loading);
    }


    handleSelectItem (e, ui) {
        const id = this.getItemId({'target': ui.selected || ui.selecting});
        if (id) {
            this.store.dispatch(addSelectedItems([id]));
        }
    }

    handleUnselectItem (e, ui) {
        const id = this.getItemId({'target': ui.unselected || ui.unselecting});
        if (id) {
            this.store.dispatch(removeSelectedItems([id]));
        }
    }

    handleUnselectAllItems (e) {
        const id = this.getItemId(e);

        if (!id) {
            this.store.dispatch(unsetAllSelectedListItems());
            this.store.dispatch(setOpenedListItem(null));
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
            const $item = $(e.target).closest(this.options.itemSelector);

            if ($item.length) {
                return $item;
            } else {
                const $popover = $(e.target).closest(this.options.popoverSelector);

                if ($popover.length) {
                    return $popover.prev(this.options.itemSelector);
                } else {
                    return $();
                }
            }
        } else if (e instanceof jQuery) {
            return e;
        } else if (typeof e === 'string') {
            return this.$container.children('[data-id="' + encodeURIComponent(id) + '"]');
        }
    }

}