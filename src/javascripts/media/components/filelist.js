import $ from 'util/jquery';
import 'util/template/jquery.template';
import without from 'lodash/without';
import each from 'lodash/each';
import namespace from 'util/namespace';
import debounce from 'media/util/debounce-raf';
import Sortable from 'sortablejs';

import { loadFiles } from 'media/modules/actions-files';


// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


const IMAGE_ITEM_SELECTOR = '.js-image-list-item';


/**
 * File list component
 */
export default class MediaFileList {

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
        this.reload();
    }

    events () {
        const store = this.store;
        const $container = this.$container;
        const ns = this.ns;

        // On file list change re-render
        store.files.grid.on(`add.${ ns }`, this.render.bind(this));
        store.files.loading.on(`change.${ ns }`, this.render.bind(this));

        store.files.grid.on(`change.${ ns }`, (newValue, prevValue) => {
            // Check for add
            for (let i = 0; i < newValue.length; i++) {
                if (prevValue.indexOf(newValue[i]) === -1) {
                    this.render();
                    return;
                }
            }
            
            // Check for delete
            for (let i = 0; i < prevValue.length; i++) {
                if (newValue.indexOf(prevValue[i]) === -1) {
                    this.getElement(prevValue[i]).remove();
                }
            }
        });

        store.files.list['*'].on(`change.${ ns }`, (newValue, prevValue) => {
            if (newValue && prevValue) {
                if (prevValue.loading !== newValue.loading) {
                    this.getElement(newValue.id).toggleClass('is-loading', newValue.loading);
                }
                if (prevValue.disabled !== newValue.disabled) {
                    this.getElement(newValue.id).toggleClass('is-disabled', newValue.disabled);
                }
                if (prevValue.searchMatch !== newValue.searchMatch) {
                    this.getElement(newValue.id).toggleClass('d-none', !newValue.searchMatch);
                }
            }
        });

        store.files.selected.on(`change.${ ns }`, (newValue, prevValue) => {
            each(prevValue, (id) => {
                this.getElement(id).removeClass('is-selected');
            });
            each(newValue, (id) => {
                this.getElement(id).addClass('is-selected');
            });
        });

        store.files.grid.on(`change.${ ns }`, (newValue) => {
            $container.find('.js-image-list-empty').toggleClass('d-none', newValue.length);
        });

        store.files.hasSearchResults.on(`change.${ ns }`, (hasSearchResults) => {
            $container.find('.js-image-list-empty-search').toggleClass('d-none', hasSearchResults);
        });

        $container.on('click', IMAGE_ITEM_SELECTOR, this.handleClickSelect.bind(this));
        $container.on('dragstart', IMAGE_ITEM_SELECTOR, this.handleDragSelect.bind(this));
    }

    reload () {
        loadFiles(this.store, this.store.folders.selected.get());
    }

    render () {
        const store = this.store;
        const files = store.files.grid.get();
        
        this.$container.template('replace', {
            'store': store,
            'items': files,
            'selected': store.files.selected.get(),
            'loading': store.files.loading.get(),
        });

        this.destroySortable();
        this.sortable();
    }

    /**
     * Returns id from element
     * 
     * @param {object} $element Element
     * @returns {string} Element id
     */
    getId ($element) {
        return $($element).closest(IMAGE_ITEM_SELECTOR).data('id');
    }

    /**
     * Returns element from id
     * 
     * @param {string} id Element id
     * @returns {object} Element
     */
    getElement (id, selector) {
        const $element = this.$container.find(`${ IMAGE_ITEM_SELECTOR }[data-id="${ id }"]`);
        return selector ? $element.find(selector).eq(0) : $element;
    }


    /**
     * File selection / deselection
     * ------------------------------------------------------------------------
     */


    handleClickSelect (e) {
        const multiselect = this.isMultiSelectEvent(e);
        const id = this.getId(e.target);
        const isDisabled = this.store.files.list[id].disabled.get();
        
        if (!isDisabled) {
            if (multiselect) {
                let selected = [].concat(this.store.files.selected.get());
    
                if (selected.indexOf(id) !== -1) {
                    selected = without(selected, id);
                } else {
                    selected.push(id);
                }
    
                this.store.files.selected.set(selected);
            } else {
                this.store.files.selected.set([id]);
            }
        }
    }

    handleDragSelect (e) {
        const multiselect = this.isMultiSelectEvent(e);
        const id = this.getId(e.target);
        const selected = this.store.files.selected.get();
        const isDisabled = this.store.files.list[id].disabled.get();
        
        if (!isDisabled) {
            if (multiselect) {
                if (selected.indexOf(id) === -1) {
                    const selected = this.store.files.selected.get();
                    this.store.files.selected.set([id].concat(selected));
                }
            } else if (selected.indexOf(id) === -1) {
                this.store.files.selected.set([id]);
            }
        }
    }

    isMultiSelectEvent (e) {
        if (this.store.multiselect.get()) {
            const isOSX = navigator.platform.toLowerCase().indexOf('mac') >= 0;
            if ((isOSX && e.metaKey) || (!isOSX && e.ctrlKey)) {
                return true;
            }
        }

        return false;
    }


    /**
     * Drag and drop sortable
     * ------------------------------------------------------------------------
     */

    setSortableMultiSelectIds (elements) {
        const ids = [];

        $(elements).each((_, el) => {
            ids.push($(el).data('id'));
        });

        store.files.selected.set(ids);
        // $(elements).data('multiselectIds', ids);
    }

    sortable () {
        const $list = this.$container.find('.js-image-list-list');
        const isOSX = navigator.platform.toLowerCase().indexOf('mac') >= 0;
        const multiselect = this.store.multiselect.get();

        this.sortableInstance = new Sortable($list.get(0), {
            dragClass: 'is-dragging',
            ghostClass: 'is-ghost',
            selectedClass: 'is-selected',

            // multiDrag: multiselect,
            // multiDragKey: isOSX ? 'Meta' : 'Ctrl',            

            // CSS selector for elements which are draggable
            draggable: IMAGE_ITEM_SELECTOR,

            // Animation duration
            animation: 150,

            // Allow dropping inside the element
            dropInside: false,

            group: {
                name: 'tree',
                put: false
            },
            
            // Items are sorted in alphabetic order
            sort: false,

            onSelect: (e) => {
                this.setSortableMultiSelectIds(e.items);
            },
            onDeselect: (e) => {
                // $(e.item).removeData('multiselectIds');
                this.setSortableMultiSelectIds(e.items);
            },
        });
    }

    destroySortable () {
        if (this.sortableInstance) {
            this.sortableInstance.destroy();
        }
    }

    destroy () {
        this.destroySortable();
        this.store.off(`.${ this.ns }`);
        this.store = null;
    }
}