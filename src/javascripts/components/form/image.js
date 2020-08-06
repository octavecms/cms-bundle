/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';


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
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$edit = $container.find(SELECTOR_EDIT);
        this.$remove = $container.find(SELECTOR_REMOVE);

        this.$edit.ajaxModalTrigger({
            // Media library args
            'select': true,
            'multiselect': false,
            'onselect': this.handleImageSelect.bind(this),
            'filter': 'images'
        });

        this.$remove.on('click returnkey', this.remove.bind(this));
    }

    handleImageSelect (images) {
        this.setImage(images[0]);
    }

    remove (event) {
        if (event && !event.isDefaultPrevented()) {
            event.preventDefault();
        }

        this.setImage({});
    }

    setImage (image) {
        const $container = this.$container;
        const data = {
            id: '',
            fileName: '',
            thumbnail: '/assets/images/px.gif',
            url: null,
            width: 0,
            height: 0,
            ...image
        };

        $container.toggleClass('form-control-image--empty', !image.id);
        this.$remove.toggleClass('d-none', !image.id);

        const $id = $container.find(SELECTOR_ID);
        $id.val(data.id);

        const $img = $container.find(SELECTOR_THUMBNAIL);
        $img.attr('src', data.thumbnail || data.url);
        
        const $title = $container.find(SELECTOR_TITLE);
        $title.text(data.fileName);

        const $size = $container.find(SELECTOR_SIZE);
        $size.toggleClass('d-none', !data.width && !data.height);
        $size.text(`${ data.width }×${ data.height }`);

        const $preview = $container.find(SELECTOR_PREVIEW_LINK);
        $preview.toggleClass('d-none', !data.url);
        $preview.attr('href', data.url);
    }
}

$.fn.image = createPlugin(ImageInput);
