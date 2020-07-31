import $ from 'util/jquery';
import 'util/template/jquery.template';
import namespace from 'util/namespace';
import debounce from 'media/utils/debounce-raf';

import { createFolder, setSelectedFolder, toggleFolder, expandFolder, collapseFolder } from 'media/modules/actions-folders';


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
        const folders = store.showroot.get() ? [rootId] : store.folders.list[rootId].children.get();

        this.$container.template('replace', {
            'store': store,
            'items': folders,
            'selected': store.folders.selected.get(),
            'root': true,
            'depth': 0
        });
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
     * @param {object} event Event
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
     * @param {object} event Event
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
     * @param {event} event 
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
     * @param {object} event Event
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

}