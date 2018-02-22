import each from 'lodash/each';

const NAMESPACE = 'gallery';

const IMAGE_WIDGET_SELECTOR = '.form-control-image';
const ORDER_INPUT_CSS_SELECTOR = 'input[type="hidden"][name*="[galleryorder]"]';


class GalleryWidget {

    static get defaultOptions () {
        return {};
    }

    constructor (element, options) {
        this.$element = $(element);
        this.options = $.extend(true, this.constructor.defaultOptions, this.options, options);

        this._init();
    }

    _init () {
        const $element = this.$element;
        const $list    = this.$list    = $element.find('.js-gallery-list');
        const $button  = this.$button  = $element.find('.js-gallery-add');

        // Item counter
        this.index = $list.find(ORDER_INPUT_CSS_SELECTOR).length;

        // Sortable list
        $list
            .sortable({
                placeholder         : 'form-control-gallery__highlight',
                // handle              : '.form-control-image__preview',
                forcePlaceholderSize: true,
                zIndex              : 999999,
                stop                : this._updateBlockOrder.bind(this)
            });

        // "Add" button click
        $button.mediaTrigger({
            'onselect': this._handleImagesAdd.bind(this),
            'multiselect': true
        });

        // "Remove" button click
        $list.on(`click.${ NAMESPACE }`, '.js-image-reset', this._handleRemoveItem.bind(this));

        // When this whole widget is removed from DOM trigger 'destroy'
        $element.on(`remove.${ NAMESPACE }`, this.destroy.bind(this));

    }

    destroy () {
        this.$element.off(`.${ NAMESPACE }`);
        this.$list.off(`.${ NAMESPACE }`);

        this.$element = this.$list = this.options = null;
    }


    /**
     * Order
     */

    _updateList () {
        this.$list.sortable('refresh');
        this._updateBlockOrder();
    }

    _updateBlockOrder () {
        var $inputs = this.$list.find(ORDER_INPUT_CSS_SELECTOR);

        $inputs.each(function (index, input) {
            $(input).val(index);
        });
    }


    /**
     * Add image
     */

    _handleImagesAdd (images) {
        each(images, this.add.bind(this));
        this._updateList();
    }

    _generateItemHTML () {
        var index = this.index++;
        return this.$list.data('prototype').replace(/__name__/g, index);
    }

    add (image) {
        const $html = $(this._generateItemHTML());
        this.$list.append($html);

        $html.find(IMAGE_WIDGET_SELECTOR).image().image('change', image);
        Admin.shared_setup($html);
    }

    /**
     * Remove image
     */

    _handleRemoveItem (e) {
        const $item = $(e.target).closest('.js-gallery-list > li');
        $item.remove();
        this._updateList();
    }
}


$.bridget(NAMESPACE, GalleryWidget);