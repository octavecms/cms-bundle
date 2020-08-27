import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';
import namespace from 'util/namespace';

class DropdownPreview {

    static get Defaults() {
        return {

            // Selectors
            'previewSelector': '.dropdown__preview',
            'previewContainerSelector': '.dropdown__preview',
            'itemSelector': '.dropdown__item',

            // Item attribute with a preview html
            'itemPreviewImgAttr': 'data-preview-image',
            'itemPreviewAltAttr': 'data-preview-image',
        };
    }

    constructor($container, opts) {
        this.options = assign({}, this.constructor.Defaults, opts);
        this.namespace = namespace();

        this.$container = $container;
        this.$preview = this.$container.find(this.options.previewSelector);
        this.$previewContainer = this.$container.find(this.options.previewContainerSelector);

        this.$container
            .on('destroyed', this.destroy.bind(this))
            .on(`focus.${this.namespace}`, this.options.itemSelector, this.handleShowPreview.bind(this));
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
        this.$previewContainer.html(`
            <div class="dropdown__preview__img">
                <img src="${imageSrc}" alt="${imageAlt || ''}">
            </div>
        `);
    }

    hidePreview() {
        this.$preview.addClass('d-none');
        this.$previewContainer.html('');
    }

    destroy() {
        this.hidePreview();
        this.$container.off(`.${this.namespace}`);
    }
}

$.fn.dropdownPreview = createPlugin(DropdownPreview);
