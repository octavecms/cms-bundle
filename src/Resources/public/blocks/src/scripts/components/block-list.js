import $ from 'lib/jquery';
import { getItemMaxIndex, validateItemIndex, REGEX_NAME } from './util/item-index';


const BLOCKS_LIST_SELECTOR     = '[data-widget="blocks-list"]';
const ADD_BLOCK_SELECTOR       = '[data-widget="blocks-add"]';

const ORDER_INPUT_CSS_SELECTOR = 'input[type="hidden"][name*="[order]"]';

const REGEX_MATCH_NUMBERS = /\d+/g;


class BlocksList {
    constructor ($container) {
        this.$container = $container;
        this.index = getItemMaxIndex($container, ORDER_INPUT_CSS_SELECTOR) + 1;

        $container
            .addClass('blocks-list')
            .sortable({
                placeholder         : 'sort-highlight',
                handle              : '.box-header',
                forcePlaceholderSize: true,
                zIndex              : 999999,
                axis                : 'y',
                update              : this.handleBlockAdd.bind(this),
                stop                : this.updateBlockOrder.bind(this)
            });

            $container.on('click', '[data-widget="block-remove"]', this.handleBlockRemove.bind(this));
    }

    updateList () {
        this.$container.sortable('refresh');
        this.updateBlockOrder();
    }

    updateBlockOrder () {
        var $inputs = this.$container.find(ORDER_INPUT_CSS_SELECTOR);

        $inputs.each(function (index, input) {
            $(input).val(index);
        });
    }

    generateBlockHTML (html) {
        var index = this.index++;

        // Prevent index collisions if element names / indexes are not in sequence or doesn't start with 1
        while (!validateItemIndex(this.$container, index, html)) {
            index = this.index++
        }

        // In the string replace only first occurance of the __name__, if there are occurances then
        // that means id or name is from collection which is inside collection
        html = html.replace(REGEX_NAME, function (all) {
            return all.replace('__name__', index);
        });

        return html;
    }

    handleBlockAdd (event, ui) {
        var html   = ui.item.data('prototype');
        if (ui.item.is(ADD_BLOCK_SELECTOR) && html) {
            const $html = $(this.generateBlockHTML(html));
            ui.item.replaceWith($html);
            Admin.shared_setup($html);
            this.updateList();
        }
    }

    handleBlockRemove (event) {
        var $item = $(event.target).closest(this.$container.children());

        if ($item.length) {
            const message = `Are you sure you want to delete the selected block?`;

            if (confirm(message)) {
                $item.slideUp('fast', (function () {
                    $item.remove();
                    this.updateList();
                }).bind(this));
            }
        }
    }
}



$(function () {
    // Make blocks sortable Using jquery UI
    $(BLOCKS_LIST_SELECTOR)
        .each(function () {
            new BlocksList($(this));
        });

    //
    $(ADD_BLOCK_SELECTOR)
        .addClass('blocks-add')
        .draggable({
            connectToSortable : $(BLOCKS_LIST_SELECTOR),
            helper            : 'clone',
            placeholder       : 'sort-highlight',
            zIndex            : 999999
        });
});