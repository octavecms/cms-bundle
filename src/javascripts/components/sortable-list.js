/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import namespace from 'util/namespace';
import createPlugin from 'jquery-plugin-generator';
import Sortable, { MultiDrag, Swap } from 'sortablejs';

Sortable.mount(new MultiDrag());


/**
 * Sortable list component
 */
class SortableList {

    static get Defaults () {
        return {
            // CSS selector to find inputs which are used to define order of items
            // for backend
            orderCssSelector: 'input[type="hidden"][name*="[position]"], input[type="hidden"][name*="[order]"]',

            // Classname added while element is being sorted
            listSortingClass: 'is-sorting',

            // Classname added to the selected element
            selectedClass: 'is-selected',
            chosenClass: 'is-chosen',

            // Classname added to the element while it's dragged
            ghostClass: 'is-ghost',

            // Classname to style fake element which is being dragged
            dragClass: 'is-dragging',

            // Find elements
            listSelector: '.js-sortable-list-list',

            // Force elements to be at the start / end of the list, before / after all sortable elements
            forceStartSelector: '.js-sortable-list-force-start',
            forceEndSelector: '.js-sortable-list-force-end',
            
            // Non-draggable elements
            filterSelector: '.js-sortable-list-not-draggable',
            cancelSelector: '.js-sortable-list-cancel',

            // CSS selector for elements which are draggable
            draggableSelector: '.js-sortable-list-item',

            // Handle selector
            handleSelector: '.js-sortable-list-item-handle',

            // Inverted swap
            invertSwap: false,

            // Allows disabling sortable
            disabled: false,

            // Allow keyboard sorting
            keyboardSorting: true,
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$list = $container.find(options.listSelector).eq(0);
        this.ns = namespace();

        if (!options.disabled) {
            this.init();
        }
    }

    init () {
        const options = this.options;
        // const isOSX = navigator.platform.toLowerCase().indexOf('mac') >= 0;

        this.sortable = new Sortable(this.$list.get(0), {
            dragClass: options.dragClass,
            ghostClass: options.ghostClass,
            chosenClass: options.chosenClass,
            
            // Multidrag
            // multiDrag: true,
            // selectedClass: options.selectedClass,
            // multiDragKey: isOSX ? 'Meta' : 'Ctrl',

            // Non-draggalbe elements
            filter: options.filterSelector,
            cancel: options.cancelSelector,

            // Handle
            handle: options.handleSelector,

            // CSS selector for elements which are draggable
            draggable: options.draggableSelector,

            // Animation duration
            animation: 150,

            // Threshold
            swapThreshold: 1,
            invertSwap: options.invertSwap,

            onStart: this.onStart.bind(this),
            onEnd: this.onEnd.bind(this),
            setData: this.setDataTransferData.bind(this),

            onChange: this.onChange.bind(this),
        });

        if (options.handleSelector && options.keyboardSorting) {
            this.$list.on(`keydown.${ this.ns }`, `${ options.draggableSelector } ${ options.handleSelector }`, this.handleSortKey.bind(this));
        }
    }

    /**
     * Destructor
     */
    destroy () {
        if (this.sortable) {
            this.sortable.destroy();
            this.sortable = null;

            this.$list.off(`keydown.${ this.ns }`);
        }
    }


    /*
     * Sortable
     * ------------------------------------------------------------------------
     */

    /**
     * Add class when starting sorting
     * 
     * @protected
     */
    onStart () {
        this.$container.addClass(this.options.listSortingClass);
    }

    /**
     * Remove class when sorting ends
     * 
     * @protected
     */
    onEnd () {
        this.$container.removeClass(this.options.listSortingClass);
    }

    /**
     * Make move element to the end of the list which is always supposed to
     * be at the end of the list.
     * 
     * @protected
     */
    onChange () {
        const endSelector = this.options.forceEndSelector;
        const startSelector = this.options.forceStartSelector;

        if (startSelector) {
            const $list = this.$list;
            const $element = $list.find(startSelector);

            if ($element.length && $element.get(0).previousElementSibling && $element.parent().is($list)) {
                $list.prepend($element);
            }
        }
        if (endSelector) {
            const $list = this.$list;
            const $element = $list.find(endSelector);

            if ($element.length && $element.get(0).nextElementSibling && $element.parent().is($list)) {
                $list.append($element);
            }
        }

        this.updateOrderInputs();
    }

    /**
     * Set transferable data, this for example allow to drag item from the
     * list into the browser url and full size image will be opened in the browser
     * 
     * @protected
     */
    setDataTransferData (dataTransfer, dragEl) {
        const $header = $(dragEl).find('h1, h2, h3, h4');

        if ($header.length) {
            dataTransfer.setData('text/plain', $header.eq(0).text());
        } else {
            const $image = $(dragEl).find('img');
            let url = '';
    
            if ($image.length) {
                url = $image.attr('data-full-image-url') || $image.attr('src');
        
                if (url.indexOf('://') === -1 && url.indexOf('//') === -1) {
                    url = document.location.origin + url;
                }
            }
    
            if (url) {
                dataTransfer.setData('text/uri-list', url);
                dataTransfer.setData('text/plain', url);
            }
        }
    }


    /*
     * Keyboard
     * ------------------------------------------------------------------------
     */

    /**
     * Handle keyboard up/down arrow keys
     * 
     * @param {object} event Event
     * @protected
     */
    handleSortKey (event) {
        if (!event.isDefaultPrevented() && $(event.target).hasClass('focus-visible') && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            const options = this.options;
            const $item = $(event.target).closest(options.draggableSelector);

            if (event.key === 'ArrowUp') {
                const $ref = $item.prev();

                if ($ref.length && !$ref.is(options.forceStartSelector)) {
                    $item.insertBefore($ref);

                    $(event.target).focus();
                    event.preventDefault();

                    this.updateOrderInputs();
                }
            } else {
                const $ref = $item.next();

                if ($ref.length && !$ref.is(options.forceEndSelector)) {
                    $item.insertAfter($ref);

                    $(event.target).focus();
                    event.preventDefault();

                    this.updateOrderInputs();
                }
            }
        }
    }


    /*
     * List order
     * ------------------------------------------------------------------------
     */

    /**
     * Update order input values to be in ascending order
     */
    updateOrderInputs () {
        const options = this.options;

        // Find order inputs, but ignore sub-list inputs
        const $items = this.$list
            .find(options.draggableSelector)
            .not(this.$list.find(options.draggableSelector).find(options.draggableSelector));

        const $inputs = $items
            .map((_, item) => {
                const $item = $(item);
                const $input = $item.find(options.orderCssSelector);
                const $invalid = $item.find(options.draggableSelector).find(options.orderCssSelector);

                return $input.not($invalid).eq(0);
            });

        $inputs.each(function (index, input) {
            $(input).val(index);
        });
    }
}

$.fn.sortableList = createPlugin(SortableList);
