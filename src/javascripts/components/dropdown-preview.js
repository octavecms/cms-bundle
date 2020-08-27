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
            'itemPreviewHtmlAttr': 'data-preview-image'
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
            .on(`mouseenter.${this.namespace}`, this.options.itemSelector, this.handleShowPreview.bind(this));
    }

    handleShowPreview(event) {
        const $item = $(event.currentTarget);
        const imageSrc = $item.attr(this.options.itemPreviewHtmlAttr);
        if (imageSrc) {
            this.showPreview(imageSrc);
        }
        else {
            this.hidePreview();
        }
    }

    showPreview(imageSrc) {
        this.$preview.removeClass('d-none');
        this.$previewContainer.html(`<div class="dropdown__preview__img"><img src="${imageSrc}" alt=""></div>`);
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
