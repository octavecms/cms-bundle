const $ = jQuery;

const BLOCKS_LIST_SELECTOR     = '[data-widget="blocks-list"]';
const ADD_BLOCK_SELECTOR       = '[data-widget="blocks-add"]';

const ORDER_INPUT_CSS_SELECTOR = 'input[type="hidden"][name*="[order]"]';


class BlocksList {
    constructor ($container) {
        this.$container = $container;
        this.index = $container.find(ORDER_INPUT_CSS_SELECTOR).length;

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
        return html.replace(/__name__/g, index);
    }

    handleBlockAdd (event, ui) {
        var html   = ui.item.data('prototype');
        if (ui.item.is(ADD_BLOCK_SELECTOR) && html) {
            ui.item.replaceWith(this.generateBlockHTML(html));
            this.updateList();
        }
    }

    handleBlockRemove (event) {
        var $item = $(event.target).closest(this.$container.children());

        if ($item.length) {
            $item.slideUp('fast', (function () {
                $item.remove();
                this.updateList();
            }).bind(this));
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