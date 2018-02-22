import each from 'lodash/each';

const NAMESPACE = 'collection';

const ORDER_INPUT_CSS_SELECTOR = 'input[type="hidden"][name*="[collectionorder]"]';


class CollectionWidget {

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
        const $list    = this.$list    = $element.find('.js-collection-list');
        const $button  = this.$button  = $element.find('.js-collection-add');

        // Item counter
        this.index = $list.find(ORDER_INPUT_CSS_SELECTOR).length;
        console.log('Index:', this.index);

        // Sortable list
        $list
            .sortable({
                placeholder         : 'form-control-collection__highlight',
                forcePlaceholderSize: true,
                zIndex              : 999999,
                stop                : this._updateBlockOrder.bind(this)
            });

        // "Add" button click
        $button.on(`click.${ NAMESPACE }`, this._handleAddItem.bind(this));

        // "Remove" button click
        $list.on(`click.${ NAMESPACE }`, '.js-collection-remove', this._handleRemoveItem.bind(this));

        // When this whole widget is removed from DOM trigger 'destroy'
        $element.on(`remove.${ NAMESPACE }`, this.destroy.bind(this));
    }

    destroy () {
        this.$element.off(`.${ NAMESPACE }`);
        this.$list.off(`.${ NAMESPACE }`);
        this.$button.off(`.${ NAMESPACE }`);

        this.$element = this.$list = this.$button = this.options = null;
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
     * Add item
     */

    _handleAddItem () {
        const $html = $(this._generateItemHTML());
        this.$list.append($html);

        Admin.shared_setup($html);
    }

    _generateItemHTML () {
        var index = this.index++;
        return this.$list.data('prototype').replace(/__name__/g, index);
    }

    /**
     * Remove item
     */

    _handleRemoveItem (e) {
        const $item = $(e.target).closest('.js-collection-list > li');
        $item.remove();
        this._updateList();
    }
}


$.bridget(NAMESPACE, CollectionWidget);