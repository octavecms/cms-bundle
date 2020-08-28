import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

class DropdownPreview {

    static get Defaults() {
        return {

            // Selectors
            'previewSelector': '.js-dropdown-preview',
            'itemSelector': '.dropdown__item',

            // Item attribute with a preview html
            'itemPreviewImgAttr': 'data-preview-image',
            'itemPreviewAltAttr': 'data-preview-alt'
        };
    }

    constructor($container, opts) {
        this.options = assign({}, this.constructor.Defaults, opts);

        this.$container = $container;
        this.$preview = this.$container.find(this.options.previewSelector);
        this.$image = this.$preview.find('img');

        this.$container
            .on('focus', this.options.itemSelector, this.handleShowPreview.bind(this))
            .on('hidden.dropdown', this.hidePreview.bind(this));
    }

    handleShowPreview(event) {
        const $item = $(event.currentTarget);
        const imageSrc = $item.attr(this.options.itemPreviewImgAttr);
        const imageAlt = $item.attr(this.options.itemPreviewAltAttr);
        if (imageSrc) {
            this.showPreview(imageSrc, imageAlt);
        }
        else {
            this.hidePreview();
        }
    }

    showPreview(imageSrc, imageAlt) {
        this.$preview.removeClass('d-none');
        this.$image
            .attr('src', imageSrc)
            .attr('alt', imageAlt || '');
    }

    hidePreview() {
        this.$preview.addClass('d-none');
    }
}

$.fn.dropdownPreview = createPlugin(DropdownPreview);
