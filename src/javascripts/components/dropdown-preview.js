import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';
import namespace from 'util/namespace';

class DropdownPreview {

    static get Defaults() {
        return {

            // Selectors
            'previewSelector': '.dropdown__preview',
            'previewContainerSelector': '.dropdown__preview__container',
            'itemSelector': '.dropdown__item',

            // Item attribute with a preview html
            'itemPreviewHtmlAttr': 'data-collection-html'
        };
    }

    constructor($container, opts) {
        this.options = assign({}, this.constructor.Defaults, opts);
        this.namespace = namespace();

        this.$container = $container;
        this.$preview = this.$container.find(this.options.previewSelector);
        this.$previewContainer = this.$preview.find(this.options.previewContainerSelector);

        this.$container
            .on('destroyed', this.destroy.bind(this))
            .on(`mouseenter.${this.namespace}`, this.options.itemSelector, this.handleShowPreview.bind(this));
    }

    handleShowPreview(event) {
        const $item = $(event.currentTarget);
        const html = $item.attr(this.options.itemPreviewHtmlAttr);
        if (html) {
            this.showPreview(html);
        }
        else {
            this.hidePreview();
        }
    }

    showPreview(html) {
        this.$preview.removeClass('d-none');
        this.$previewContainer.html(html);
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
