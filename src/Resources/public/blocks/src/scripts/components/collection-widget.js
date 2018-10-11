import $ from 'lib/jquery';

import map from 'lodash/map';
import each from 'lodash/each';


const NAMESPACE = 'collection';

const ORDER_INPUT_CSS_SELECTOR = 'input[type="hidden"][name*="[position]"]';

const REGEX_MATCH_NUMBERS = /\d+/g;


class CollectionWidget {

    static get defaultOptions () {
        return {
            orderCssSelector : ORDER_INPUT_CSS_SELECTOR
        };
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
        this.index = this.options.orderCssSelector ? this._getMaxIndex() : $list.children().length;

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

    _getMaxIndex () {
        const $inputs = this.$list.find(this.options.orderCssSelector);
        let   index   = 0;

        $inputs.each((i, input) => {
            const names   = $(input).attr('name').match(REGEX_MATCH_NUMBERS);
            const numbers = map(names, name => parseInt(name, 10));

            index = Math.max(index, Math.max.apply(Math, numbers));
        });

        return index + 1;
    }

    _updateList () {
        this.$list.sortable('refresh');
        this._updateBlockOrder();
    }

    _updateBlockOrder () {
        var $inputs = this.$list.find(this.options.orderCssSelector);

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
        this._updateList();
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