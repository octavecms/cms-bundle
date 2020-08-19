/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import 'util/jquery.destroyed';
import namespace from 'util/namespace';

const SELECTOR_ID = '.js-image-id';
const SELECTOR_EDIT = '.js-image-edit';
const SELECTOR_THUMBNAIL = '.js-image-thumbnail';
const SELECTOR_TITLE = '.js-image-title';
const SELECTOR_SIZE = '.js-image-size';
const SELECTOR_PREVIEW_LINK = '.js-image-preview-link';
const SELECTOR_REMOVE = '.js-image-delete';


/**
 * Image input
 */
class ImageInput {

    static get Defaults () {
        return {};
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.ns = namespace();
        this.$container = $container;
        this.$edit = $container.find(SELECTOR_EDIT);
        this.$remove = $container.find(SELECTOR_REMOVE);
        this.$form = $container.closest('form');

        // Raw value
        this.value = null;

        this.$edit.ajaxModalTrigger({
            // Media library args
            'select': true,
            'multiselect': false,
            'onselect': this.handleImageSelect.bind(this),
            'filter': 'images'
        });

        this.$remove.on('click returnkey', this.remove.bind(this));

        $container.on('destroyed', this.destroy.bind(this));
        this.$form.on(`reset.${ this.ns }`, this.handleFormReset.bind(this));
    }

    /**
     * Remove global event listeners
     */
    destroy () {
        if (this.$form) {
            this.$form.off(`reset.${ this.ns }`);
            this.$form = null;
        }
    }

    /**
     * Remove image
     *
     * @param {object} [event] Event
     */
    remove (event) {
        if (!event || event && !event.isDefaultPrevented()) {
            if (event) {
                event.preventDefault();
            }

            this.setValue({});
        }
    }

    /**
     * Set image value
     *
     * @param {object} image Image value
     */
    setValue (image) {
        const $container = this.$container;
        const data = {
            id: '',
            filename: '',
            thumbnail: '',
            url: null,
            width: 0,
            height: 0,
            isImage: true,
            ...image
        };

        $container.toggleClass('form-control-image--empty', !image.id);
        this.$remove.toggleClass('d-none', !image.id);

        const $id = $container.find(SELECTOR_ID);
        $id.val(data.id);

        const $img = $container.find(SELECTOR_THUMBNAIL);
        $img.attr('src', data.thumbnail || data.url || '/assets/images/px.gif');

        const $title = $container.find(SELECTOR_TITLE);
        $title.text(data.filename);

        const $size = $container.find(SELECTOR_SIZE);
        $size.toggleClass('d-none', !data.width && !data.height);
        $size.text(`${ data.width }×${ data.height }`);

        const $preview = $container.find(SELECTOR_PREVIEW_LINK);
        $preview.toggleClass('d-none', !data.url);
        $preview.attr('href', data.url);

        this.value = data;
    }

    /**
     * Get image value
     *
     * @returns {object} Image value
     */
    getValue () {
        if (this.value) {
            return this.value;
        } else {
            // Try getting value from the DOM elements
            const $container = this.$container;
            const $id = $container.find(SELECTOR_ID);
            const id = $id.val();

            if (id) {
                const $img = $container.find(SELECTOR_THUMBNAIL);
                const $title = $container.find(SELECTOR_TITLE);
                const $preview = $container.find(SELECTOR_PREVIEW_LINK);

                const $size = $container.find(SELECTOR_SIZE);
                const size = $size.text().split('×');

                return {
                    id: $id.val(),
                    filename: $title.text(),
                    thumbnail: $img.attr('src'),
                    url: $preview.attr('href'),
                    width: parseInt(size[0]) || 0,
                    height: parseInt(size[1]) || 0,
                    isImage: true,
                };
            } else {
                return {
                    id: '',
                    filename: '',
                    thumbnail: '',
                    url: null,
                    width: 0,
                    height: 0,
                    isImage: true,
                };
            }
        }
    }


    /*
     * Event listeners
     * ----------------------------------------------------
     */


    /**
     * Reset collection when form is reset
     *
     * @param {JQuery.Event} event Event
     */
    handleFormReset () {
        this.setValue({});
    }

    /**
     * Handle media library image selection
     *
     * @param {array} images List of images
     * @protected
     */
    handleImageSelect (images) {
        // If not an image, then remove the image
        const image = images[0].isImage === false ? {} : images[0];
        this.setValue(image);
    }
}

$.fn.image = createPlugin(ImageInput);
