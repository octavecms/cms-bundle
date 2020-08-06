import $ from 'util/jquery';
import assign from 'lodash/assign';
import 'util/template/jquery.template';
import each from 'lodash/each';
import namespace from 'util/namespace';
import debounce from 'media/util/debounce-raf';
import Sortable from 'sortablejs';

import { loadFiles } from 'media/modules/actions-files';
import { addSelectedFile, setSelectedFile, toggleSelectedFile, expandSelectedFileList } from 'media/modules/actions-selection';


const IMAGE_ITEM_SELECTOR = '.js-image-list-item';


/**
 * File list component
 */
export default class MediaFileList {

    static get Defaults () {
        return {
            store: null,
            onselect: null,
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
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

        // Re-render when loading state changes
        store.files.loading.on(`change.${ ns }`, this.render.bind(this));

        // On file list change re-render
        store.files.grid.on(`change.${ ns }`, (newValue, prevValue) => {
            // Check for add, re-render if new items are added
            for (let i = 0; i < newValue.length; i++) {
                if (prevValue.indexOf(newValue[i]) === -1) {
                    this.render();
                    return;
                }
            }

            // Check for delete, remove items which were removed
            for (let i = 0; i < prevValue.length; i++) {
                if (newValue.indexOf(prevValue[i]) === -1) {
                    this.getElement(prevValue[i]).remove();
                }
            }
        });

        // File info change
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

        // Selected file change
        store.files.selected.on(`change.${ ns }`, (newValue, prevValue) => {
            each(prevValue, (id) => {
                this.getElement(id).removeClass('is-selected');
            });
            each(newValue, (id) => {
                this.getElement(id).addClass('is-selected');
            });
        });

        // Empty file list message
        store.files.grid.on(`change.${ ns }`, (newValue) => {
            $container.find('.js-image-list-empty').toggleClass('d-none', !!newValue.length);
        });

        // Empty search results message
        store.files.hasSearchResults.on(`change.${ ns }`, (hasSearchResults) => {
            $container.find('.js-image-list-empty-search').toggleClass('d-none', hasSearchResults);
        });

        $container.on('dragstart', IMAGE_ITEM_SELECTOR, this.handleDragSelect.bind(this));
        $container.on('click', IMAGE_ITEM_SELECTOR, this.handleClickSelect.bind(this));
        $container.on('dblclick', IMAGE_ITEM_SELECTOR, this.handleDoubleClickSelect.bind(this));
        $container.on('click', this.handleClickDeselect.bind(this));
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


    /**
     * Clicking on file should select it
     * Holding control or shift keys allows to select multiple files
     * 
     * @param {object} e Event
     * @protected
     */
    handleClickSelect (e) {
        const multiselect = this.isMultiSelectEvent(e);
        const id = this.getId(e.target);
        
        if (multiselect == 'item') {
            // Selecting single item
            toggleSelectedFile(this.store, id);
        } else if (multiselect == 'list') {
            // Selecting list of items using shift key
            expandSelectedFileList(this.store, id);
        } else {
            setSelectedFile(this.store, id);
        }

        e.preventDefault();
    }

    /**
     * Doublce clicking on file should select it and close media library
     * 
     * @param {object} e Event
     * @protected
     */
    handleDoubleClickSelect (e) {
        if (this.options.onselect) {
            this.options.onselect();
        }
        
        e.preventDefault();
    }

    /**
     * Clicking outside any item deselect files
     * 
     * @param {object} e Event
     * @protected
     */
    handleClickDeselect (e) {
        if ($(e.target).closest(IMAGE_ITEM_SELECTOR).length === 0) {
            const multiselect = this.isMultiSelectEvent(e);

            if (!multiselect) {
                this.store.files.selected.set([]);
            }
        }
    }

    /**
     * When starting to drag select the file
     * 
     * @param {object} e Event
     * @protected
     */
    handleDragSelect (e) {
        const multiselect = this.isMultiSelectEvent(e);
        const id = this.getId(e.target);
        const selected = this.store.files.selected.get();

        // Don't deselect
        if (selected.indexOf(id) === -1) {
            if (multiselect == 'item') {
                // Selecting single item
                addSelectedFile(this.store, id);
            } else if (multiselect == 'list') {
                // Selecting list of items using shift key
                expandSelectedFileList(this.store, id);
            } else {
                setSelectedFile(this.store, id);
            }
        }
    }

    /**
     * Retursn true if event if for multiple file selection
     * 
     * @param {object} e Event
     * @returns {boolean} True if event is for file multi-select, otherwise false
     * @protected
     */
    isMultiSelectEvent (e) {
        if (this.store.multiselect.get()) {
            const isOSX = navigator.platform.toLowerCase().indexOf('mac') >= 0;
            if ((isOSX && e.metaKey) || (!isOSX && e.ctrlKey)) {
                return 'item';
            } else if (e.shiftKey) {
                return 'list';
            }
        }

        return false;
    }

    /**
     * Set transferable data, this for example allow to drag item from the
     * list into the browser url and full size image will be opened in the browser
     * 
     * @protected
     */
    setDataTransferData (dataTransfer, dragEl) {
        const $link = $(dragEl).find('a[href]');
        const $image = $(dragEl).find('img');
        const $header = $(dragEl).find('h1, h2, h3, h4, p');
        let url = null;

        if ($image.length) {
            const $image = $(dragEl).find('img');
            url = $image.attr('data-full-image-url') || $image.attr('src');
        } else if ($link.length) {
            url = $link.attr('href');
        }

        if (url && url.indexOf('://') === -1 && url.indexOf('//') === -1) {
            url = document.location.origin + url;
        }
        
        if (url) {
            dataTransfer.setData('text/uri-list', url);
            dataTransfer.setData('text/plain', url);
        } else {
            dataTransfer.setData('text/plain', $header.eq(0).text());
        }
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

            setData: this.setDataTransferData.bind(this),

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
            this.sortableInstance = null;
        }
    }

    destroy () {
        this.destroySortable();
        
        if (this.store) {
            if (this.store.off) {
                this.store.off(`.${ this.ns }`);
            }
            this.store = null;
        }
    }
}