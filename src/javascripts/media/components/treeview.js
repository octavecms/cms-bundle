import $ from 'util/jquery';
import assign from 'lodash/assign';
import 'util/template/jquery.template';
import 'util/jquery.destroyed';
import namespace from 'util/namespace';
import debounce from 'media/util/debounce-raf';
import Sortable from 'sortablejs';
import DropInside from 'components/sortable/drop-inside';

import { createFolder, setSelectedFolder, toggleFolder, expandFolder, collapseFolder, moveFolder } from 'media/modules/actions-folders';
import { moveFiles } from 'media/modules/actions-files';


Sortable.mount(new DropInside());


const SELECTOR_ELEMENT = '.js-tree-view-item-element';
const SELECTOR_TOGGLER = '.js-tree-view-item-toggler';
const SELECTOR_TITLE = '.js-tree-view-item-title';
const SELECTOR_LIST = 'ol';

const SELECTOR_ADD_FOLDER = '.js-tree-view-add-folder';
const SELECTOR_ADD_FOLDER_FORM = '.js-tree-view-add-folder form';


/**
 * TreeView component
 */
export default class TreeView {

    static get Defaults () {
        return {
            store: null
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.store = options.store;
        this.ns = namespace();
        this.sortables = [];

        // Initialize template
        $container.template({'removeSiblings': true});

        // Render
        this.render();

        // Prevent multiple calls to render during since store change
        this.render = debounce(this.render.bind(this));

        this.events();

        // Clean up
        $container.on('destroyed', this.destroy.bind(this));
    }

    events () {
        const store = this.store;
        const $container = this.$container;
        const ns = this.ns;

        $container.on('submit', SELECTOR_ADD_FOLDER_FORM, this.handleAddFolderSubmit.bind(this));

        $container.on('click returnkey', SELECTOR_TOGGLER, this.handleTogglerClick.bind(this));
        $container.on('click returnkey', SELECTOR_ELEMENT, this.handleItemClick.bind(this));
        $container.on('keydown', SELECTOR_ELEMENT, this.handleItemKey.bind(this));

        // On folder list change re-render
        store.folders.list['*'].children.on(`change.${ ns }`, this.render.bind(this));

        store.folders.list['*'].on(`change.${ ns }`, (newValue, prevValue) => {
            if (newValue && prevValue) {
                if (prevValue.expanded !== newValue.expanded) {
                    this.getElement(newValue.id).toggleClass('tree__item--expanded', newValue.expanded);
                }
                if (prevValue.name !== newValue.name) {
                    this.getElement(newValue.id, SELECTOR_TITLE).text(newValue.name);
                }
                if (prevValue.disabled !== newValue.disabled) {
                    this.getElement(newValue.id).toggleClass('tree__item--disabled', newValue.disabled);
                }
                if (prevValue.loading !== newValue.loading) {
                    this.getElement(newValue.id, SELECTOR_ELEMENT).toggleClass('tree-item--loading', newValue.loading);
                }
            }
        });
        store.folders.selected.on(`change.${ ns }`, (newValue, prevValue) => {
            this.getElement(prevValue, SELECTOR_ELEMENT).removeClass('tree-item--active');
            this.getElement(newValue, SELECTOR_ELEMENT).addClass('tree-item--active');
        });
    }

    render () {
        const store = this.store;
        const rootId = store.folders.root.get();
        const showroot = store.showroot.get(false);
        const folders = showroot ? [rootId] : store.folders.list[rootId].children.get();

        this.$container.find(SELECTOR_LIST).eq(0).toggleClass('tree--with-root', showroot);

        this.$container.template('replace', {
            'store': store,
            'items': folders,
            'selected': store.folders.selected.get(),
            'root': true,
            'depth': 0
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
        return $($element).closest('.js-tree-view-item').data('id');
    }

    /**
     * Returns ids from image elements
     * 
     * @param {object} $element Image element
     * @returns {array} Image element ids
     */
    getImageIds ($element) {
        const $elements = $($element).closest('.js-image-list-item');

        if ($elements.length) {
            return store.files.selected.get();
            // Take ids from the data previously set by filelist
            // return $elements.data('multiselectIds') || [$elements.data('id')];
        } else {
            return null;
        }
    }

    /**
     * Returns element from id
     * 
     * @param {string} id Element id
     * @returns {object} Element
     */
    getElement (id, selector) {
        const $element = this.$container.find(`.js-tree-view-item[data-id="${ id }"]`);
        return selector ? $element.find(selector).eq(0) : $element;
    }


    /**
     * Keyboard navigation
     * ------------------------------------------------------------------------
     */

    /**
     * On toggler click toggle foldesr expanded state
     * 
     * @param {JQuery.ClickEvent} event Event
     * @protected
     */
    handleTogglerClick (event) {
        if (!event.isDefaultPrevented()) {
            const id = this.getId(event.target);
            toggleFolder(this.store, id);

            event.preventDefault();
        }
    }

    /**
     * On item click set that folder as selected and expand it
     * 
     * @param {JQuery.ClickEvent} event Event
     * @protected
     */
    handleItemClick (event) {
        if (!event.isDefaultPrevented()) {
            const id = this.getId(event.target);
            const isSelected = this.store.folders.selected.get(0) === id;

            if (isSelected) {
                // Folder already selected, toggle it
                toggleFolder(this.store, id);
            } else {
                setSelectedFolder(this.store, id);
                expandFolder(this.store, id);
            }
    
            event.preventDefault();
        }
    }

    /**
     * Handle key on item 
     * 
     * @param {JQuery.Event} event 
     */
    handleItemKey (event) {
        if (!event.isDefaultPrevented()) {
            const id = this.getId(event.target);
            
            if (event.key === 'ArrowRight') {
                expandFolder(this.store, id);
                event.preventDefault();
            } else if (event.key === 'ArrowLeft') {
                collapseFolder(this.store, id);
                event.preventDefault();
            } else if (event.key === ' ') {
                toggleFolder(this.store, id);
                event.preventDefault();
            }

            // } else if (event.key === 'ArrowDown') {
                // @TODO Keyboard navigation
            // } else if (event.key === 'ArrowUp') {
                // @TODO Keyboard navigation
            // }
        }
    }


    /**
     * Add folder form
     * ------------------------------------------------------------------------
     */


    /**
     * On form submit add folder
     * 
     * @param {JQuery.SubmitEvent} event Event
     * @protected
     */
    handleAddFolderSubmit (event) {
        event.preventDefault();

        const $dropdown = this.$container.find(SELECTOR_ADD_FOLDER);
        const $form = this.$container.find(SELECTOR_ADD_FOLDER_FORM);
        const name = $form.serializeObject().name;

        // Reset form
        $form.get(0).reset();

        // Hide dropdown
        $dropdown.dropdown('hide');

        // Add folder
        const parent = this.store.folders.selected.get(0);
        createFolder(this.store, name, parent);
    }


    /**
     * Drag and drop sortable
     * ------------------------------------------------------------------------
     */

     
    sortable () {
        const $lists = this.$container.find('.js-tree-view-list');
        const sortables = this.sortables = [];

        for (let i = 0; i < $lists.length; i++) {
            const $list = $lists.eq(i);
            const isRoot = i === 0;
            const sortable = new Sortable($list.get(0), {
                dragClass: 'is-dragging',
                ghostClass: 'is-ghost',
                dropInsideClass: 'is-tree-target',
                
                // CSS selector for elements which are draggable
                draggable: '.js-tree-view-item',
    
                // Animation duration
                animation: 150,
    
                // Allow dropping inside the element
                dropInside: true,
                holdTimeout: 500,
                dropBubble: true,

                group: {
                    name: 'tree',
                    put: false
                },
                fallbackOnBody: true,
                
                // Items are sorted in alphabetic order
                sort: false,

                onDropInside: isRoot ? (event) => {
                    const dragFolderId = this.getId(event.dragEl);
                    const dragImageIds = this.getImageIds(event.dragEl);
                    const targetFolderId = this.getId(event.dropInsideEl);
                    
                    if (dragFolderId && targetFolderId) {
                        // Move folder
                        moveFolder(this.store, dragFolderId, targetFolderId);
                    } else if (dragImageIds && targetFolderId) {
                        // Move files, but only if it has changed
                        if (store.folders.selected.get() !== targetFolderId) {
                            moveFiles(this.store, dragImageIds, targetFolderId);
                        }
                    }
                } : null,

                onDropHold: (event) => {
                    const targetFolderId = this.getId(event.dropInsideEl);
                    expandFolder(this.store, targetFolderId);
                },
            });

            sortables.push(sortable);
        }
    }

    destroySortable () {
        const sortables = this.sortables;
        this.sortables = [];

        for (let i = sortables.length - 1; i >= 0; i--) {
            sortables[i].destroy();
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