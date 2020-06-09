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
                cancel              : '.collection-item__content',
                placeholder         : 'form-control-collection__highlight',
                forcePlaceholderSize: true,
                zIndex              : 999999,
                stop                : this._handleOrder.bind(this)
            });

        // "Add" button click
        $button.on(`click.${ NAMESPACE }`, this._handleAddItem.bind(this));

        // "Remove" button click
        $list.on(`click.${ NAMESPACE }`, '.js-collection-remove', this._handleRemoveItem.bind(this));

        // When this whole widget is removed from DOM trigger 'destroy'
        $element.on(`remove.${ NAMESPACE }`, this.destroy.bind(this));

        // When list item is collapsed update the item title
        $list.on('hide.bs.collapse', this._handleCollapseItem.bind(this));

        // Update list item title
        $list.children().each((_index, item) => this._updateListItemTitle($(item)));
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

    _handleOrder () {
        this._updateBlockOrder();
        this._reinitializeCKEditors();
    }

    _getMaxIndex () {
        const $inputs = this.$list.find(this.options.orderCssSelector);
        let   index   = 0;

        if ($inputs.length) {
            $inputs.each((i, input) => {
                const names   = $(input).attr('name').match(REGEX_MATCH_NUMBERS);
                const numbers = map(names, name => parseInt(name, 10));
    
                index = Math.max(index, Math.max.apply(Math, numbers));
            });
        } else {
            index = this.$list.children().length - 1;
        }

        return index + 1;
    }

    _updateList () {
        this.$list.sortable('refresh');
        this._updateBlockOrder();
    }

    /**
     * Update order input values to be in ascending order
     */
    _updateBlockOrder () {
        const $inputs = this.$list.find(this.options.orderCssSelector);

        $inputs.each(function (index, input) {
            $(input).val(index);
        });
    }

    /**
     * Re-intialize CKEditor since jQuery sortable elements thus destroying
     * CKEditor bindings
     */
    _reinitializeCKEditors () {
        const $inputs = this.$list.find('textarea');

        if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances) {
            for (let i = 0; i < $inputs.length; i++) {
                const textarea = $inputs.get(i);

                if (textarea.id && textarea.id in CKEDITOR.instances) {
                    const config = CKEDITOR.instances[textarea.id].config;

                    CKEDITOR.instances[textarea.id].destroy();
                    CKEDITOR.replace(textarea.id, config);
                }
            }
        }
    }


    /**
     * Add item
     */

    _handleAddItem () {
        const $html = $(this._generateItemHTML());
        this.$list.append($html);
        this.$list.find('script[type="text/javascript"]').remove();

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

    /**
     * Update item
     */

    _handleCollapseItem (e) {
        const $item = $(e.target).closest('.js-collection-list > li');
        this._updateListItemTitle($item);
    }
    _updateListItemTitle ($item) {
        const $title = $item.find('.js-collection-list-item-title');
        $title.text(this._getListItemTitle($item));
    }

    _getListItemTitle ($item) {
        // First search for title
        const $title = $item.find('[name*="[title]"]');

        if ($title.length) {
            return $title.val().replace(/(<([^>]+)>)/ig,"");
        }

        // Use any input we can find
        const $inputs = $item.find('input, textarea, select');

        for (let i = 0; i < $inputs.length; i++) {
            const $input = $inputs.eq(i);
            const inputValue = $input.val();
            let title = '';
    
            if ($input.is('textarea, [type="text"], [type="email"], [type="tel"], [type="url"], [type="date"], [type="number"]')) {
                title = inputValue;
            } else if ($input.is('.form-control-image input[type="hidden"]')) {
                // Image
                title = inputValue;
            } else if ($input.is('select')) {
                title = $input.find('option').filter((_, option) => {
                    return option.value === inputValue;
                }).text();
            }
    
            title = title.replace(/.*\//, '').substr(0, 255);

            if (title) {
                return title;
            }
        }

        return '';
    }
}


$.bridget(NAMESPACE, CollectionWidget);
