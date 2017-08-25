import difference from 'lodash/difference';
import reduce from 'lodash/reduce';
import uniq from 'lodash/uniq';
import filter from 'lodash/filter';
import each from 'lodash/each';

import MediaGridListItem from './gridlist-item';
import microtemplate from '../utils/micro-template';
import formatSize from '../utils/format-size';

import { addSelectedItems, removeSelectedItems, unsetAllSelectedListItems, setOpenedListItem } from '../modules/actions';


let UID = 1;


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
        this.namespace = `mediagridlist${ ++UID }`;

        this.mediaGridItems = {};
        this.init();
    }

    init () {
        const $container = this.$container;
        const options    = this.options;
        const store      = this.store      = options.store;
        const namespace  = this.namespace;

        $container.addClass(this.options.className);

        $container.on(`mousedown.${ namespace }`, this.handleUnselectAllItems.bind(this));
        $(document).on(`mousedown.${ namespace }`, this.handleCloseListItem.bind(this));
        $(document).on(`keydown.${ namespace }`, this.handleCloseListItemKey.bind(this));

        $container.selectable({})
            .on(`selectableselecting.${ namespace }`, this.handleSelectItem.bind(this))
            .on(`selectableselected.${ namespace }`, this.handleSelectItem.bind(this))
            .on(`selectableunselecting.${ namespace }`, this.handleUnselectItem.bind(this))
            .on(`selectableunselected.${ namespace }`, this.handleUnselectItem.bind(this));

        this.unsubscribers = [
            store.subscribePath('grid.files', this.handleGridChange.bind(this)),
            store.subscribePath('grid.loading', this.handleGridLoading.bind(this)),
            store.subscribePath('files', this.handleFilesChange.bind(this))
        ];
    }

    destroy () {
        const $container = this.$container;
        const namespace  = this.namespace;
        const items      = this.mediaGridItems;

        $(document).off(`.${ namespace }`);

        $container.off(`.${ namespace }`);
        $container.selectable('destroy');

        each(items, item => item.destroy());
        each(this.unsubscribers, unsubscribe => unsubscribe());

        this.mediaGridItems = this.unsubscribers = this.$container = this.template = this.options = this.store = null;
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
                let $element = $(this.template({
                    'data': file,
                    'formatSize': formatSize
                }));

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
                        let $element = $(this.template({
                            'data': newFile,
                            'formatSize': formatSize
                        }));

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

    handleCloseListItem (e) {
        const id = this.getItemId(e);

        if (!id) {
            this.store.dispatch(setOpenedListItem(null));
        }
    }

    handleCloseListItemKey (e) {
        if (e.which == 27 && !$(e.target).is('input, select, textarea')) { // Escape key
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