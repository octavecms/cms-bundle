import $ from 'util/jquery';
import 'util/template/jquery.template';
import assign from 'lodash/assign';
import map from 'lodash/map';
import each from 'lodash/each';
import namespace from 'util/namespace';
import debounce from 'media/util/debounce-raf';
import Sortable from 'sortablejs';

import isIntersecting from 'media/util/is-intersecting';
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

    /**
     * Constructor
     * 
     * @param {JQuery} $container Container element
     * @param {object} opts Media file list options
     */
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

    /**
     * Initialize events
     * 
     * @protected
     */
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

        // Click and drag file selection
        $container.on('mousedown', this.dragSelectionStart.bind(this));

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

    /**
     * Reload file list
     * 
     * @protected
     */
    reload () {
        loadFiles(this.store, this.store.folders.selected.get());
    }

    /**
     * Render file list
     * 
     * @protected
     */
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
     * Destructor
     * 
     * @protected
     */
    destroy () {
        this.destroySortable();
        this.destroyDragSelection();
        
        if (this.store) {
            if (this.store.off) {
                this.store.off(`.${ this.ns }`);
            }
            this.store = null;
        }
    }


    /**
     * Helper functions
     * ------------------------------------------------------------------------
     */


    /**
     * Returns id from element
     * 
     * @param {JQuery} $element Element
     * @returns {string} Element id
     */
    getId ($element) {
        return $($element).closest(IMAGE_ITEM_SELECTOR).data('id');
    }

    /**
     * Returns element from id
     * 
     * @param {string} id Element id
     * @returns {JQuery} Element
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
     * @param {JQuery.ClickEvent} e Event
     * @protected
     */
    handleClickSelect (event) {
        const eventType = this.isMultiSelectEvent(event);
        const id = this.getId(event.target);
        
        if (eventType == 'item') {
            // Selecting single item
            toggleSelectedFile(this.store, id);
        } else if (eventType == 'list') {
            // Selecting list of items using shift key
            expandSelectedFileList(this.store, id);
        } else {
            setSelectedFile(this.store, id);
        }

        event.preventDefault();
    }

    /**
     * Doublce clicking on file should select it and close media library
     * 
     * @param {JQuery.DoubleClickEvent} event Event
     * @protected
     */
    handleDoubleClickSelect (event) {
        if (this.options.onselect) {
            this.options.onselect();
        }
        
        event.preventDefault();
    }

    /**
     * Clicking outside any item deselect files
     * 
     * @param {JQuery.ClickEvent} event Event
     * @protected
     */
    handleClickDeselect (event) {
        if ($(event.target).closest(IMAGE_ITEM_SELECTOR).length === 0) {
            const multiselect = this.isMultiSelectEvent(event);

            if (!multiselect && !this.dragSelectionActive) {
                this.store.files.selected.set([]);
            }
        }
    }

    /**
     * When starting to drag select the file
     * 
     * @param {JQuery.DragStartEvent} event Event
     * @protected
     */
    handleDragSelect (event) {
        const eventType = this.isMultiSelectEvent(event);
        const id = this.getId(event.target);
        const selected = this.store.files.selected.get();

        // Don't deselect
        if (selected.indexOf(id) === -1) {
            if (eventType == 'item') {
                // Selecting single item
                addSelectedFile(this.store, id);
            } else if (eventType == 'list') {
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
     * @param {JQuery.Event} event Event
     * @returns {boolean} True if event is for file multi-select, otherwise false
     * @protected
     */
    isMultiSelectEvent (event) {
        const isOSX = navigator.platform.toLowerCase().indexOf('mac') >= 0;
        if ((isOSX && event.metaKey) || (!isOSX && event.ctrlKey)) {
            return 'item';
        } else if (event.shiftKey) {
            return 'list';
        } else {
            return false;
        }
    }

    /**
     * Set transferable data, this for example allow to drag item from the
     * list into the browser url and full size image will be opened in the browser
     * 
     * @param {object} dataTransfer Data transfer object
     * @param {HTMLElement} dragEl Element which is dragged
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
     * File selection using click and drag
     * ------------------------------------------------------------------------
     */


     /**
      * Validate drag selection event
      * Mouse down on item is for dragging item, ignore it
      * 
      * @param {JQuery.Event} event Event
      * @returns {boolean} True if event is valid, otherwise false
      * @protected
      */
    validateDragSelectionEvent (event) {
        if ($(event.target).closest(IMAGE_ITEM_SELECTOR).length) {
            return false;
        } else {
            return true;
        }
    }


    /**
     * Start drag selection
     * 
     * @param {JQuery.MouseDownEvent} event Event
     * @protected
     */
    dragSelectionStart (event) {
        if (this.validateDragSelectionEvent(event)) {
            const containerBox = this.$container.get(0).getBoundingClientRect();

            let selected = [].concat(this.store.files.selected.get());

            this.dragSelectionMultiSelectEvent = !!this.isMultiSelectEvent(event);
            this.dragSelectionActive = true;
            this.dragSelectionInitial = selected;
            this.dragSelectionMouse = [
                event.clientX - containerBox.left,
                event.clientY - containerBox.top
            ];

            // If not multi selection event then reset selection
            if (!this.dragSelectionMultiSelectEvent) {
                selected = this.dragSelectionInitial = [];
                this.store.files.selected.set([]);
            }

            // Find all targets
            this.dragSelectionTargets = map(this.$container.find(IMAGE_ITEM_SELECTOR).toArray(), (item) => {
                const $item = $(item);
                const id = this.getId($item);
                const box = item.getBoundingClientRect();

                return {
                    element: $item,
                    id: id,
                    x: box.left - containerBox.left,
                    y: box.top - containerBox.top,
                    width: box.width,
                    height: box.height,
                    selected: selected.indexOf(id) !== -1
                };
            });

            // Preview
            this.$dragSelectionPreview = $('<div class="media-filelist-drag-selection-preview"></div>').prependTo(this.$container);
            this.dragSelectionPreviewOffset = [0, 0];

            $(document)
                .on(`mousemove.${ this.ns }`, this.dragSelectionMove.bind(this))
                .on(`mouseup.${ this.ns }`, debounce(this.destroyDragSelection.bind(this)));

            event.preventDefault();
        }
    }


    /**
     * Handle drag selection mouse event
     * 
     * @param {JQuery.MouseMoveEvent} event Event
     * @protected
     */
    dragSelectionMove (event) {
        const containerBox = this.$container.get(0).getBoundingClientRect();
        const mouseTo = [event.clientX - containerBox.left, event.clientY - containerBox.top];
        const mouseFrom = [].concat(this.dragSelectionMouse);
        const targets = this.dragSelectionTargets;
        const selected = [].concat(this.dragSelectionInitial);

        // Normalize x/y so that from is < than to
        if (mouseTo[0] < mouseFrom[0]) {
            let mouseTemp = mouseTo[0];
            mouseTo[0] = mouseFrom[0];
            mouseFrom[0] = mouseTemp;
        }
        if (mouseTo[1] < mouseFrom[1]) {
            let mouseTemp = mouseTo[1];
            mouseTo[1] = mouseFrom[1];
            mouseFrom[1] = mouseTemp;
        }

        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];

            if (!target.selected) {
                if (
                    isIntersecting(mouseFrom, mouseTo, [target.x, target.y]) ||
                    isIntersecting(mouseFrom, mouseTo, [target.x + target.width, target.y]) ||
                    isIntersecting(mouseFrom, mouseTo, [target.x, target.y + target.height]) ||
                    isIntersecting(mouseFrom, mouseTo, [target.x + target.width, target.y + target.height])
                ) {
                    selected.push(target.id);
                }
            }
        }

        // Preview
        const offset = this.dragSelectionPreviewOffset;
        this.$dragSelectionPreview.css('transform', `translate(${ mouseFrom[0] + offset[0] }px, ${ mouseFrom[1] + offset[1] }px) scale(${ (mouseTo[0] - mouseFrom[0]) / 1000 }, ${ (mouseTo[1] - mouseFrom[1]) / 1000 })`)

        store.files.selected.set(selected);
    }

    /**
     * Handle drag selection end event
     * 
     * @protected
     */
    destroyDragSelection () {
        if (this.$dragSelectionPreview) {
            this.$dragSelectionPreview.remove();
            this.$dragSelectionPreview = null;
        }

        this.dragSelectionActive = false;
        this.dragSelectionMouse = null;
        this.dragSelectionTargets = null;
        this.dragSelectionTargets = null;
        this.dragSelectionPreviewOffset = null;
        $(document).off(`mouseup.${ this.ns } mousemove.${ this.ns }`);
    }


    /**
     * Drag and drop sortable
     * ------------------------------------------------------------------------
     */


    /**
     * Create sortable
     * 
     * @protected
     */
    sortable () {
        const $list = this.$container.find('.js-image-list-list');

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

            onSelect: (event) => {
                this.setSortableMultiSelectIds(event.items);
            },
            onDeselect: (event) => {
                this.setSortableMultiSelectIds(event.items);
            },
        });
    }

    /**
     * On sortable selection change mark items selected / deselected
     * 
     * @param {HTMLElement[]} elements Selected elements
     * @protected
     */
    setSortableMultiSelectIds (elements) {
        const ids = [];

        $(elements).each((_, el) => {
            ids.push($(el).data('id'));
        });

        store.files.selected.set(ids);
        // $(elements).data('multiselectIds', ids);
    }

    /**
     * Destroy sortable
     * 
     * @protected
     */
    destroySortable () {
        if (this.sortableInstance) {
            this.sortableInstance.destroy();
            this.sortableInstance = null;
        }
    }
}