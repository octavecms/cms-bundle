import $ from 'lib/jquery';
import { getItemMaxIndex, validateItemIndex, REGEX_NAME } from './util/item-index';

const NAMESPACE = 'collection';

const ORDER_INPUT_CSS_SELECTOR = 'input[type="hidden"][name*="[position]"]';


const SELECTOR_LIST = '.js-collection-list';
const SELECTOR_LIST_TITLE = '.js-collection-list-item-title';
const SELECTOR_ADD = '.js-collection-add';
const SELECTOR_REMOVE = '.js-collection-remove';

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
        const $list    = this.$list    = $element.find(SELECTOR_LIST).not($element.find(SELECTOR_LIST + ' ' + SELECTOR_LIST));

        // Find button, but no sub-list button
        const $button  = this.$button  = $element.find(SELECTOR_ADD).not(this.$list.find(SELECTOR_ADD));

        // Item counter
        this.index = getItemMaxIndex($list, this.options.orderCssSelector) + 1;

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
        $list.on(`click.${ NAMESPACE }`, SELECTOR_REMOVE, this._handleRemoveItem.bind(this));

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

    _handleAddItem (event) {
        const $html = $(this._generateItemHTML());
        this.$list.append($html);
        this.$list.find('script[type="text/javascript"]').remove();

        Admin.shared_setup($html);
        this._updateList();
    }

    _generateItemHTML () {
        let html = this.$list.data('prototype');
        let index = this.index++;

        // Prevent index collisions if element names / indexes are not in sequence or doesn't start with 1
        while (!validateItemIndex(this.$list, index, html)) {
            index = this.index++
        }

        // In the string replace only first occurance of the __name__, if there are occurances then
        // that means id or name is from collection which is inside collection
        html = html.replace(REGEX_NAME, function (all) {
            return all.replace('__name__', index);
        });

        return html;
    }

    /**
     * Remove item
     */

    _handleRemoveItem (e) {
        if (this._validateItem(e.target)) {
            const $item = $(e.target).closest(SELECTOR_LIST + ' > li');

            $item.remove();
            this._updateList();
        }
    }

    /**
     * Update item
     */

    _handleCollapseItem (e) {
        if (this._validateItem(e.target)) {
            const $item = $(e.target).closest(SELECTOR_LIST + ' > li');
            this._updateListItemTitle($item);
        }
    }
    _updateListItemTitle ($item) {
        if (this._validateItem($item)) {
            // Make sure we pick only title for this collection item, not all titles inside
            // the sub-collection (if such exists)
            const $subtitles = $item.find(SELECTOR_LIST + ' ' + SELECTOR_LIST_TITLE);
            const $title = $item.find(SELECTOR_LIST_TITLE).not($subtitles);
            $title.text(this._getListItemTitle($item));
        }
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

    /**
     * Validate event target
     * Returns true if target is somewhere inside collection item
     * Returns false if target is outside collection item or if it's inside sub-collection item
     * 
     * @param {jQuery|HTMLElement} target Target
     * @returns {boolean}
     */
    _validateItem (target) {
        const $list = $(target).closest(SELECTOR_LIST);

        // Make sure it's not sub collection widget
        return this.$list.is($list);
    }
}


$.bridget(NAMESPACE, CollectionWidget);
