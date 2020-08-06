/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';


const SELECTOR_INPUT_ID = 'input[type="hidden"][name*="[id]"]';
const SELECTOR_ITEM = '.js-image-list-item';

const SELECTOR_ADD = '.js-image-list-add';
const SELECTOR_EDIT = '.js-image-list-edit';
const SELECTOR_THUMBNAIL = '.js-image-list-thumbnail';
const SELECTOR_REMOVE = '.js-image-list-delete';


/**
 * Image list input
 */
class ImageList {

    static get Defaults () {
        return {};
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$add = $container.find(SELECTOR_ADD);
        this.$remove = $container.find(SELECTOR_REMOVE);
        this.$template = $container.template();

        this.$add.ajaxModalTrigger({
            // Media library args
            'select': true,
            'multiselect': true,
            'onselect': this.addImages.bind(this),
            'filter': 'images'
        });

        $container.on('click', SELECTOR_EDIT, this.handleReplaceClick.bind(this));
        $container.on('click', SELECTOR_REMOVE, this.handleRemoveClick.bind(this));
    }

    /**
     * Handle replace button click
     * 
     * @param {object} event Event
     * @protected
     */
    handleReplaceClick (event) {
        // Set settings on first click on replace, on repeated clicks
        // ajaxModalTrigger will prevent default and show media library
        // on its own
        if (!event.isDefaultPrevented()) {
            event.preventDefault();
    
            const id = this.getId(event);
            const $link = $(event.target).closest(SELECTOR_EDIT);
    
            // Set media library settings
            $link.ajaxModalTrigger({
                'select': true,
                'multiselect': false,
                'onselect': this.replaceImage.bind(this, id),
                'filter': 'images'
            });
    
            // Open media library
            $link.ajaxModalTrigger('open');
        }
    }

    /**
     * Handle remove button click
     * 
     * @param {object} event Event
     * @protected
     */
    handleRemoveClick (event) {
        event.preventDefault();
        const id = this.getId(event);
        this.removeImage(id);
    }

    /**
     * Returns true if image list has an image with given id
     * 
     * @param {string|number} id Image id
     * @returns {boolean} True if list has image, otherwise false
     */
    hasImage (id) {
        return this.getItemElement(id).length;
    }

    /**
     * Add images to the list
     * 
     * @param {array} images List of images
     */
    addImages (images) {
        let changed = false;

        for (let i = 0; i < images.length; i++) {
            const image = images[i];

            if (!this.hasImage(image.id) && image.isImage !== false) {
                changed = true;

                this.$template.template('append', {
                    index: 0, // index will be updated by sortableList
                    ...image
                });
            }
        }

        // Update indexes
        if (changed) {
            this.updateSortable();
        }
    }

    /**
     * Replace image
     * 
     * @param {string|number} id Image id
     * @param {object} image New image data
     */
    replaceImage (id, images) {
        // Media library returns a list
        const image = images[0];

        if(!this.hasImage(image.id)) {
            const $item = this.getItemElement(id);
            const $thumbnail = $item.find(SELECTOR_THUMBNAIL);
            
            $thumbnail.attr('alt', image.fileName);
            $thumbnail.attr('src', image.thumbnail || image.src);
            
            $item.attr('data-id', image.id).data('id', image.id);
            this.setItemPropertyValue(id, 'id', image.id);
        } else {
            // Image with this id already exists, remove this one
            this.removeImage(id);
        }
    }

    /**
     * Remove image
     * 
     * @param {string|number} id Image id
     */
    removeImage (id) {
        this.getItemElement(id).remove();
        this.updateSortable();
    }

    /**
     * Returns list item id
     * 
     * @param {object} $element Element or an event
     * @returns {string} Id
     */
    getId ($element) {
        let $actualElement = $element instanceof $.Event ? $($element.target) : $actualElement;
        return $actualElement.closest(SELECTOR_ITEM).data('id');
    }

    /**
     * Returns list item element
     * 
     * @param {string|number} id Item id
     * @returns {object} Item element
     */
    getItemElement (id) {
        return this.$container.find(`${ SELECTOR_ITEM }[data-id="${ id }"]`);
    }

    /**
     * Returns list item property input from element
     * 
     * @param {string|number} $element Item element
     * @param {string} property Property name
     * @returns {object} Property input
     */
    getItemElementPropertyInput ($element, property) {
        return $element.find(`input[type="hidden"][name*="[${ property }]"]`);
    }

    /**
     * Returns list item value
     * 
     * @param {string|number} id Item id
     * @param {string} property Property name
     * @returns {string} Property value
     */
    getItemPropertyValue (id, property) {
        const $element = this.getItemElement(id);
        return this.getItemElementPropertyInput($element, property).val();
    }

    /**
     * Sets list item value
     * 
     * @param {string|number} id Item id
     * @param {string} property Property name
     * @param {string} value Property value
     */
    setItemPropertyValue (id, property, value) {
        const $element = this.getItemElement(id);
        this.getItemElementPropertyInput($element, property).val(value);
    }

    /**
     * Update sortable
     */
    updateSortable () {
        this.$container.sortableList('onChange');
    }
}

$.fn.imageList = createPlugin(ImageList);
