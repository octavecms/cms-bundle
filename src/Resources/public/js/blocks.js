jQuery(function ($) {

    var ORDER_INPUT_CSS_SELECTOR = 'input[type="hidden"][name*="[order]"]';

    function BlocksList ($container) {
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
                change              : this.updateBlockOrder.bind(this)
            });

            $container.on('click', '[data-widget="block-remove"]', this.handleBlockRemove.bind(this));
    }

    BlocksList.prototype = {

        updateList: function () {
            this.$container.sortable('refresh');
            this.updateBlockOrder();
        },

        updateBlockOrder: function () {
            var $inputs = this.$container.find(ORDER_INPUT_CSS_SELECTOR);
            $inputs.each(function (index, input) {
                $(input).val(index);
            });
        },

        handleBlockAdd: function (event, ui) {
            var widget = ui.item.data('widget');
            var html   = ui.item.data('prototype');

            if (widget === 'blocks-add' && html) {
                ui.item.replaceWith(this.createBlock(html));
                this.updateList();
            }
        },

        handleBlockRemove: function (event) {
            var $item = $(event.target).closest(this.$container.children());

            if ($item.length) {
                $item.slideUp('fast', (function () {
                    $item.remove();
                    this.updateList();
                }).bind(this));
            }
        },

        createBlock: function (html) {
            var index = this.index++;
            return html.replace(/__name__/g, index);
        }
    };



    $(function () {
        // Make blocks sortable Using jquery UI
        $('[data-widget="blocks-list"]')
            .each(function () {
                var $list = $(this);
                $list.data('list', new BlocksList($list));
            })
            .on('removed.boxwidget', function (event) {
                console.log(event);
            });

        //
        $('[data-widget="blocks-add"]')
            .addClass('blocks-add')
            .draggable({
                connectToSortable : $('[data-widget="blocks-list"]'),
                helper            : 'clone',
                placeholder       : 'sort-highlight',
                zIndex            : 999999
            });
    });
});